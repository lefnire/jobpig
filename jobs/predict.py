#! /usr/bin/env python

import tensorflow as tf
import numpy as np
import os, re
from jobs import data_helpers, db
from jobs.text_cnn import TextCNN
from tensorflow.contrib import learn

FLAGS = tf.flags.FLAGS


def predict(uid):
    # CHANGE THIS: Load data. Load your own data here
    x_raw = data_helpers.load_data(uid)
    checkpoint_dir = "./runs/{}/checkpoints/".format(uid)

    # Map data into vocabulary
    vocab_path = os.path.join(FLAGS.vocab_path)
    vocab_processor = learn.preprocessing.VocabularyProcessor.restore(vocab_path)
    x_test = np.array(list(vocab_processor.transform(x_raw)))

    print("\nPredicting...\n")

    # Evaluation
    # ==================================================
    checkpoint_file = tf.train.latest_checkpoint(checkpoint_dir)
    graph = tf.Graph()
    with graph.as_default():
        session_conf = tf.ConfigProto(
          allow_soft_placement=FLAGS.allow_soft_placement,
          log_device_placement=FLAGS.log_device_placement)
        sess = tf.Session(config=session_conf)
        with sess.as_default():
            # Load the saved meta graph and restore variables
            saver = tf.train.import_meta_graph("{}.meta".format(checkpoint_file))
            saver.restore(sess, checkpoint_file)

            # Get the placeholders from the graph by name
            input_x = graph.get_operation_by_name("input_x").outputs[0]
            # input_y = graph.get_operation_by_name("input_y").outputs[0]
            dropout_keep_prob = graph.get_operation_by_name("dropout_keep_prob").outputs[0]

            # Tensors we want to evaluate
            predictions = graph.get_operation_by_name("output/predictions").outputs[0]

            # Generate batches for one epoch
            batches = data_helpers.batch_iter(list(x_test), FLAGS.batch_size, 1, shuffle=False)

            # Collect the predictions here
            all_predictions = []

            for x_test_batch in batches:
                batch_predictions = sess.run(predictions, {input_x: x_test_batch, dropout_keep_prob: 1.0})
                all_predictions = np.concatenate([all_predictions, batch_predictions])

    # Save the evaluation to a csv
    predictions_human_readable = np.column_stack((np.array(x_raw), all_predictions))
    db.execute("DELETE FROM user_jobs WHERE user_id={} AND STATUS=1".format(uid)) # remove previous matches, re-assigning #TODO scale issue
    db.execute("""
        INSERT INTO user_jobs (status, note, created_at, updated_at, job_id, user_id)
        VALUES {values}
        -- ON CONFLICT (job_id, user_id) DO UPDATE SET status=EXCLUDED.status, updated_at=now();
    """.format(
        values=", ".join(map(lambda p: """(1, '', now(), now(), {job_id}, {user_id})""".format(
            job_id=re.match(r"^(\d+) ", p[0]).group(1), # iterating list of strings like "24 React Developer" (24=id). FIXME work with tuples instead of str
            user_id=uid
        ), predictions_human_readable))
    ))
    # out_path = os.path.join(checkpoint_dir, "..", "prediction.csv")
    # print("Saving evaluation to {0}".format(out_path))
    # with open(out_path, 'w') as f:
    #     csv.writer(f).writerows(predictions_human_readable)