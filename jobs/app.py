import os, csv, subprocess, json, eventlet
from kombu import Connection, Exchange, Queue, Producer
from kombu.mixins import ConsumerMixin
from jobs import train, predict
import tensorflow as tf


# Parameters
# ==================================================

# Data loading params
tf.flags.DEFINE_float("dev_sample_percentage", .1, "Percentage of the training data to use for validation")
tf.flags.DEFINE_boolean("seed", False, "Seed with initial tags")

# Model Hyperparameters
tf.flags.DEFINE_integer("embedding_dim", 128, "Dimensionality of character embedding (default: 128)")
tf.flags.DEFINE_string("filter_sizes", "3,4,5", "Comma-separated filter sizes (default: '3,4,5')")
tf.flags.DEFINE_integer("num_filters", 128, "Number of filters per filter size (default: 128)")
tf.flags.DEFINE_float("dropout_keep_prob", 0.5, "Dropout keep probability (default: 0.5)")
tf.flags.DEFINE_float("l2_reg_lambda", 0.0, "L2 regularization lambda (default: 0.0)")

# Training parameters
tf.flags.DEFINE_integer("batch_size", 64, "Batch Size (default: 64)")
tf.flags.DEFINE_integer("num_epochs", 100, "Number of training epochs (default: 200)")
tf.flags.DEFINE_integer("evaluate_every", 50, "Evaluate model on dev set after this many steps (default: 100)")
tf.flags.DEFINE_integer("checkpoint_every", 25, "Save model after this many steps (default: 100)")
tf.flags.DEFINE_integer("num_checkpoints", 5, "Number of checkpoints to store (default: 5)")

# Misc Parameters
tf.flags.DEFINE_string("vocab_path", "./runs/vocab/", "")
tf.flags.DEFINE_boolean("allow_soft_placement", True, "Allow device soft device placement")
tf.flags.DEFINE_boolean("log_device_placement", False, "Log placement of ops on devices")

FLAGS = tf.flags.FLAGS
FLAGS._parse_flags()
print("\nParameters:")
for attr, value in sorted(FLAGS.__flags.items()):
    print("{}={}".format(attr.upper(), value))
print("")

exchange = Exchange('jobs')
conn = Connection('amqp://')
producer = Producer(conn)

class C(ConsumerMixin):
    def __init__(self, connection):
        self.connection = connection
        self.training_thread = None

    def get_consumers(self, Consumer, channel):
        return [
            Consumer([Queue('train:seed:start', exchange, 'train:seed:start')], callbacks=[self.train_seed_start]),
            Consumer([Queue('train:start', exchange, 'train:start')], callbacks=[self.train_start]),
        ]

    def train_seed_start(self, body, message):
        message.ack()
        train.seed(json.loads(body), message)

    def train_start(self, body, message):
        message.ack()
        uid = json.loads(body)['uid']
        predict.predict(uid)
        if self.training_thread: self.training_thread.kill() #kill current training session & replace with this one
        self.training_thread = eventlet.greenthread.spawn(train.train, uid)


print(' [*] Waiting for messages. To exit press CTRL+C')
C(conn).run()