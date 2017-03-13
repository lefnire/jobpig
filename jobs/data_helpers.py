import numpy as np
import re
import itertools
from collections import Counter
from jobs import db
from bs4 import BeautifulSoup

sane_whitespace = re.compile(r"\s+", flags=re.MULTILINE)  # "or `\s\s+` ?
def clean_str(string):
    # TODO mine: need these?
    soup = BeautifulSoup(string, 'html.parser')
    string = sane_whitespace.sub(" ", soup.get_text())

    """
    Tokenization/string cleaning for all datasets except for SST.
    Original taken from https://github.com/yoonkim/CNN_sentence/blob/master/process_data.py
    """
    string = re.sub(r"[^A-Za-z0-9(),!?\'\`]", " ", string)
    string = re.sub(r"\'s", " \'s", string)
    string = re.sub(r"\'ve", " \'ve", string)
    string = re.sub(r"n\'t", " n\'t", string)
    string = re.sub(r"\'re", " \'re", string)
    string = re.sub(r"\'d", " \'d", string)
    string = re.sub(r"\'ll", " \'ll", string)
    string = re.sub(r",", " , ", string)
    string = re.sub(r"!", " ! ", string)
    string = re.sub(r"\(", " \( ", string)
    string = re.sub(r"\)", " \) ", string)
    string = re.sub(r"\?", " \? ", string)
    string = re.sub(r"\s{2,}", " ", string)
    return string.strip().lower()


def load_data_and_labels(uid, seed=False):
    """
    Loads MR polarity data from files, splits the data into words and generates labels.
    Returns split sentences and labels.
    """
    # Load data from files
    rows = list(db.execute("""
        SELECT uj.status, j.id::VARCHAR || ' ' || LOWER(j.title) || ' ' || LOWER(j.description) AS body
        FROM jobs j
        INNER JOIN user_jobs uj ON j.id=uj.job_id AND uj.user_id={}
    """.format(uid)))

    positive_examples = [s[1] for s in rows if s[0] == (1 if seed else 3)] # 3=liked; 1=match. Train from matches on seed, since they don't have likes yet
    negative_examples = [s[1] for s in rows if s[0] == 2]
    # Split by words
    x_text = positive_examples + negative_examples
    x_text = [clean_str(sent) for sent in x_text]
    # Generate labels
    positive_labels = [[0, 1] for _ in positive_examples]
    negative_labels = [[1, 0] for _ in negative_examples]
    y = np.concatenate([positive_labels, negative_labels], 0)
    return [x_text, y]

def load_data(uid):
    """
    Loads MR polarity data from files, splits the data into words and generates labels.
    Returns split sentences and labels.
    """
    # Load data from files
    rows = list(db.execute("""
        SELECT uj.status, j.id::VARCHAR || ' ' || LOWER(j.title) || ' ' || LOWER(j.description) AS body
        FROM jobs j
        LEFT JOIN user_jobs uj ON j.id=uj.job_id AND uj.user_id={}
        WHERE uj.status IS NULL -- NOT IN (2,3,4,5) -- exclude things they've seen
    """.format(uid)))

    examples = [s[1].strip() for s in rows]
    # Split by words
    x_text = [clean_str(sent) for sent in examples]
    return x_text


def batch_iter(data, batch_size, num_epochs, shuffle=True):
    """
    Generates a batch iterator for a dataset.
    """
    data = np.array(data)
    data_size = len(data)
    num_batches_per_epoch = int((len(data)-1)/batch_size) + 1
    for epoch in range(num_epochs):
        # Shuffle the data at each epoch
        if shuffle:
            shuffle_indices = np.random.permutation(np.arange(data_size))
            shuffled_data = data[shuffle_indices]
        else:
            shuffled_data = data
        for batch_num in range(num_batches_per_epoch):
            start_index = batch_num * batch_size
            end_index = min((batch_num + 1) * batch_size, data_size)
            yield shuffled_data[start_index:end_index]
