import paho.mqtt.client as mqtt
import json

from dwriter import write_data

''' Configuration - Listening locally as we are running on the same host as the mqtt broker '''
BROKER = 'localhost'
PORT = 1883
TOPIC = 'upload_feed'

def on_connect(client, userdata, flags, rc, properties):
  # print(f"Connected with result code {rc}")
  client.subscribe(TOPIC)


devices = [
  "863663062798815",
  "863663062798816",
  "aabbccddeeff0003",
  "aabbccddeeff0004",
  "aabbccddeeff0005",
]

def on_message(client, userdata, msg):
  message = msg.payload.decode('utf-8')
  data = json.loads(message)

  if data['IMEI'] in devices:
    lines = list(data.items())[-8:]
    # Will run the below in seperate thread eventually
    # print("writing a line")
    write_data(data['IMEI'], lines)

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="cellular-listener", protocol=mqtt.MQTTv5)
client.on_connect = on_connect
client.on_message = on_message

''' Not presently required
client.tls_set(ca_certs="/home/nigel/certs/CA/ca.pem", 
               certfile="/home/nigel/certs/CA/clients/chirpstack/chirpstack-client.pem", 
               keyfile="/home/nigel/certs/CA/clients/chirpstack/chirpstack-client-key.pem")
'''
client.connect(BROKER, PORT, 60)
client.loop_forever()

