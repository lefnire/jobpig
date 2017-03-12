import os, csv, subprocess, json
from kombu import Connection, Exchange, Queue, Producer
from kombu.mixins import ConsumerMixin
import train

exchange = Exchange('jobs')
conn = Connection('amqp://')
producer = Producer(conn)

class C(ConsumerMixin):
    def __init__(self, connection):
        self.connection = connection

    def get_consumers(self, Consumer, channel):
        return [
            Consumer([Queue('train:seed:start', exchange, 'train:seed:start')], callbacks=[self.train_seed_start]),
            # Consumer([Queue('predict:start', exchange, 'predict:start')], callbacks=[self.predict_start]),
        ]

    def train_seed_start(self, body, message):
        message.ack()
        decoded = json.loads(body)
        train.seed(decoded['uid'], decoded['tags'])

    def predict_start(self, body, message):
        predictions = subprocess.check_output(["python", "jobs/predict.py", '--context="%s"' % body['body']])
        predictions = eval(predictions.decode('utf-8').split("\n")[-2])
        producer.publish({'uid': body['uid'], 'body': predictions}, exchange=exchange, routing_key='predict:complete')
        message.ack()

print(' [*] Waiting for messages. To exit press CTRL+C')
C(conn).run()