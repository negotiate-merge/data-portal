import paho.mqtt.client as mqtt
import json

from dwriter import write_data

# Configuration
BROKER = 'mqtt.synergitech.com.au'
PORT = 8883
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
    write_data(data['IMEI'], lines)

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="listener_01", protocol=mqtt.MQTTv5)
client.on_connect = on_connect
client.on_message = on_message

client.tls_set(ca_certs="/home/nigel/certs/CA/ca.crt", certfile="/home/nigel/certs/clients/listener/listener.crt", keyfile="/home/nigel/certs/clients/listener/listener.key")
client.connect(BROKER, PORT, 60)
client.loop_forever()

