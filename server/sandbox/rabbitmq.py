
import pika
import pika.adapters.blocking_connection
from config import CLOUDAMQP_URL

PARAMS = pika.URLParameters(CLOUDAMQP_URL)

connection = pika.BlockingConnection(PARAMS)

channel = connection.channel()

channel.queue_declare(queue='hello')
channel.basic_publish(exchange='',
                      routing_key='hello',
                      body='Hello World!')
print(" [x] Sent 'Hello World!'")
connection.close()