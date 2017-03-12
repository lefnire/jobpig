import argparse, sys, tempfile, urllib
import pandas as pd
import tensorflow as tf
from tensorflow.contrib.learn import DNNRegressor
from tensorflow.contrib.layers import sparse_column_with_hash_bucket, embedding_column

# @see https://www.tensorflow.org/tutorials/wide_and_deep#define_base_feature_columns
# @see https://www.tensorflow.org/tutorials/linear#feature_columns_and_transformations

#TODO skills uses a SparseTensor? it's not a column, but many columns
COLUMNS = ["skills", "company", "location", "source", "commitment"]
LABEL_COLUMN = "score?"
CATEGORICAL_COLUMNS = COLUMNS
CONTINUOUS_COLUMNS = []

def build_estimator():
    #TODO get these from the database
    #TODO how to append to these when they change?
    features = {
        'skills': ['react', 'node', 'python'],
        'company': ['toptal', 'cybercoders', 'google'],
        'location': ['portland, or', 'boston, ma'],
        'source': ['indeed', 'simplyhired'],
        'commitment': ['full-time' 'part-time'],
        #TODO how to handle missing data? (since it's provided piece-wise) http://dspace.mit.edu/bitstream/handle/1721.1/7202/AIM-1509.pdf?sequence=2
    }

    # gender = tf.contrib.layers.sparse_column_with_keys(column_name="gender", keys=["Female", "Male"])
    # race = tf.contrib.layers.sparse_column_with_keys(column_name="race", keys=["Amer-Indian-Eskimo", "Asian-Pac-Islander", "Black", "Other", "White"])
    # education = tf.contrib.layers.sparse_column_with_hash_bucket("education", hash_bucket_size=1000)
    # relationship = tf.contrib.layers.sparse_column_with_hash_bucket("relationship", hash_bucket_size=100)

    #TODO figure out how buckets/keys work
    skill = sparse_column_with_hash_bucket("skills", hash_bucket_size=10000)
    company = sparse_column_with_hash_bucket("company", hash_bucket_size=10000)
    location = sparse_column_with_hash_bucket("location", hash_bucket_size=10000)
    source = sparse_column_with_hash_bucket("source", hash_bucket_size=100)
    commitment = sparse_column_with_hash_bucket("commitment", hash_bucket_size=10)

    columns = [
        embedding_column(skill, dimension=8),
        embedding_column(company, dimension=8),
        embedding_column(location, dimension=8),
        embedding_column(source, dimension=8),
        embedding_column(commitment, dimension=8),
    ]

    estimator = DNNRegressor(feature_columns=columns, hidden_units=[1024, 512, 256], model_dir="")
    return estimator

def input_fn(df):
  """Input builder function."""
  # Creates a dictionary mapping from each continuous feature column name (k) to
  # the values of that column stored in a constant Tensor.
  continuous_cols = {k: tf.constant(df[k].values) for k in CONTINUOUS_COLUMNS}
  # Creates a dictionary mapping from each categorical feature column name (k)
  # to the values of that column stored in a tf.SparseTensor.
  categorical_cols = {
      k: tf.SparseTensor(
          indices=[[i, 0] for i in range(df[k].size)],
          values=df[k].values,
          dense_shape=[df[k].size, 1])
      for k in CATEGORICAL_COLUMNS}
  # Merges the two dictionaries into one.
  feature_cols = dict(continuous_cols)
  feature_cols.update(categorical_cols)
  # Converts the label column into a constant Tensor.
  label = tf.constant(df[LABEL_COLUMN].values)
  # Returns the feature columns and the label.
  return feature_cols, label


def train_and_eval(model_dir, model_type, train_steps, train_data, test_data):
  """Train and evaluate the model."""
  train_file_name, test_file_name = maybe_download(train_data, test_data)
  df_train = pd.read_csv(
      tf.gfile.Open(train_file_name),
      names=COLUMNS,
      skipinitialspace=True,
      engine="python")
  df_test = pd.read_csv(
      tf.gfile.Open(test_file_name),
      names=COLUMNS,
      skipinitialspace=True,
      skiprows=1,
      engine="python")

  # remove NaN elements
  df_train = df_train.dropna(how='any', axis=0)
  df_test = df_test.dropna(how='any', axis=0)

  df_train[LABEL_COLUMN] = (
      df_train["income_bracket"].apply(lambda x: ">50K" in x)).astype(int)
  df_test[LABEL_COLUMN] = (
      df_test["income_bracket"].apply(lambda x: ">50K" in x)).astype(int)

  model_dir = tempfile.mkdtemp() if not model_dir else model_dir
  print("model directory = %s" % model_dir)

  m = build_estimator(model_dir, model_type)
  m.fit(input_fn=lambda: input_fn(df_train), steps=train_steps)
  results = m.evaluate(input_fn=lambda: input_fn(df_test), steps=1)
  for key in sorted(results):
    print("%s: %s" % (key, results[key]))


FLAGS = None


def main(_):
  train_and_eval(FLAGS.model_dir, FLAGS.model_type, FLAGS.train_steps,
                 FLAGS.train_data, FLAGS.test_data)


if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.register("type", "bool", lambda v: v.lower() == "true")
  parser.add_argument(
      "--model_dir",
      type=str,
      default="",
      help="Base directory for output models."
  )
  parser.add_argument(
      "--model_type",
      type=str,
      default="wide_n_deep",
      help="Valid model types: {'wide', 'deep', 'wide_n_deep'}."
  )
  parser.add_argument(
      "--train_steps",
      type=int,
      default=200,
      help="Number of training steps."
  )
  parser.add_argument(
      "--train_data",
      type=str,
      default="",
      help="Path to the training data."
  )
  parser.add_argument(
      "--test_data",
      type=str,
      default="",
      help="Path to the test data."
  )
  FLAGS, unparsed = parser.parse_known_args()
  tf.app.run(main=main, argv=[sys.argv[0]] + unparsed)