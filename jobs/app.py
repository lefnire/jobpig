import os, csv, subprocess
from kombu import Connection, Exchange, Queue, Producer
from kombu.mixins import ConsumerMixin

exchange = Exchange('jobs')
conn = Connection('amqp://')
producer = Producer(conn)

class C(ConsumerMixin):
    def __init__(self, connection):
        self.connection = connection

    def get_consumers(self, Consumer, channel):
        return [
            Consumer([Queue('train:start', exchange, 'train:start')], callbacks=[self.train_start]),
            Consumer([Queue('predict:start', exchange, 'predict:start')], callbacks=[self.predict_start]),
        ]

    def train_start(self, body, message):
        message.ack()
        filename = os.path.join(os.path.dirname(__file__), 'data/sgd/train.csv')
        with open(filename, 'a', newline='\n') as csvfile:
            writer = csv.writer(csvfile, quotechar='"', quoting=csv.QUOTE_MINIMAL)
            # writer.writerow(['Context', 'Utterance', 'Distractor'])
            writer.writerow(body['body'])
        subprocess.call(['python', 'jobs/prepare_data.py'])
        # Call training in the background, it's heavy
        subprocess.Popen(['python', 'jobs/train.py'])

    def predict_start(self, body, message):
        predictions = subprocess.check_output(["python", "jobs/predict.py", '--context="%s"' % body['body']])
        predictions = eval(predictions.decode('utf-8').split("\n")[-2])
        producer.publish({'uid': body['uid'], 'body': predictions}, exchange=exchange, routing_key='predict:complete')
        message.ack()

print(' [*] Waiting for messages. To exit press CTRL+C')
C(conn).run()