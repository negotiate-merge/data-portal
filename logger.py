# Connect to Chirpstack MQTT Server and receive uplink messages using the Paho MQTT Python client library
#
# Original source:
# https://github.com/descartes/TheThingsStack-Integration-Starters/blob/main/MQTT-to-Tab-Python3/TTS.MQTT.Tab.py
#
# Instructions to use Eclipse Paho MQTT Python client library:
# https://www.thethingsindustries.com/docs/integrations/mqtt/mqtt-clients/eclipse-paho/)
#
import os
import sys
import logging
from paho.mqtt import client as mqtt
import json
# import config
import random
from datetime import datetime

PUBLIC_TLS_ADDRESS = "192.168.19.4"
PUBLIC_TLS_ADDRESS_PORT = 1883

# Meaning Quality of Service (QoS)
# QoS = 0 - at most once
# The client publishes the message, and there is no acknowledgement by the broker.
# QoS = 1 - at least once
# The broker sends an acknowledgement back to the client.
# The client will re-send until it gets the broker's acknowledgement.
# QoS = 2 - exactly once
# Both sender and receiver are sure that the message was sent exactly once, using a kind of handshake
QOS = 0
DEBUG = False

devices = [
    "863663062798815",
    "123456789876543",
    "987654321234567",
]

def get_value_from_json_object(obj, key):
    try:
        return obj[key]
    except KeyError:
        return '-'


def stop(client):
    client.disconnect()
    print("\nExit")
    logging.info("Controller process terminated")
    sys.exit(0)


# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc, properties):
    if rc == 0:
        print("\nConnected successfully to MQTT broker")
    else:
        print("\nFailed to connect, return code = " + str(rc))

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, message):
    print("\nMessage received on topic '" + message.topic + "' with QoS = " + str(message.qos))

    data_dir = "./data_logs"

    data_str = message.payload.decode('utf-8')
    data_str = data_str.replace("'", '"')
    d_json = json.loads(data_str)
    print(d_json)
    points = []
    try:
        imei = d_json["IMEI"]
    except KeyError:
        imei = False
    if imei in devices:
        print("device is known")
        num = 1
        try:
            while d_json[str(num)]:
                print(num, d_json[str(num)])
                points.insert(0, d_json[str(num)])
                num += 1
        except KeyError as e:
            print(f'key {num} not present in dictionary')
        except Exception as e:
            print("something unexpected has occurred")
        # print(json.dumps(points, indent=2))

        with open(f"{data_dir}/{imei}.log", "a") as fw:
            for p in points:
                fw.write(", ".join(map(str, p)) + "\n")
                
    # except KeyError:
    #     # We have a different response that we want to read the output of
    #     print("Payload (Expanded): \n" + json.dumps(d_json, indent=4))    

    if DEBUG:
        # print("Payload (Collapsed): " + str(message.payload))
        print("Payload (Expanded): \n" + json.dumps(d_json, indent=4))

# mid = message ID
# It is an integer that is a unique message identifier assigned by the client.
# If you use QoS levels 1 or 2 then the client loop will use the mid to identify messages that have not been sent.

def on_subscribe(client, userdata, mid, granted_qos, properties):
    print("\nSubscribed with message id (mid) = " + str(mid) + " and QoS = " + str(granted_qos))


def on_disconnect(client, userdata, rc, properties, other):
    print("\nDisconnected with result code = " + str(rc))


'''
def on_log(client, userdata, level, buf):
    print("\nLog: " + buf)
    logging_level = client.LOGGING_LEVEL[level]
    logging.log(logging_level, buf)
'''
# Configure logging - removed the encoding='utf-8' arg
logging.basicConfig(filename='controller.log', level=logging.INFO, \
                    format='%(asctime)s %(levelname)s: %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')

# Generate client ID with pub prefix randomly
client_id = f'python-mqtt-{random.randint(0, 1000)}'

print("Create new mqtt client instance")
# Added first arguement due to breaking Changes migrating to version 2 paho
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id) 

print("Assign callback functions")
mqttc.on_connect = on_connect
mqttc.on_subscribe = on_subscribe
mqttc.on_message = on_message
mqttc.on_disconnect = on_disconnect
# mqttc.on_log = on_log  # Logging for debugging OK, waste

logging.info("Controller process started")
print("Connecting to broker: " + PUBLIC_TLS_ADDRESS + ":" + str(PUBLIC_TLS_ADDRESS_PORT))
logging.info("Connecting to broker: " + PUBLIC_TLS_ADDRESS + ":" + str(PUBLIC_TLS_ADDRESS_PORT))
mqttc.connect(PUBLIC_TLS_ADDRESS, PUBLIC_TLS_ADDRESS_PORT, 60)

if True:  # This is ugly chnage it later
    topic = "test"
    print("subscribe to topic " + topic + " with QOS = " + str(QOS))
    mqttc.subscribe(topic, QOS)
    logging.info("subscribed to topic " + topic + " with QOS = " + str(QOS))
else:
    print("Can not subscribe to any topic")
    logging.critical("Could not subscribe to any topic")
    stop(mqttc)    

print("And run forever")
try:
    run = True
    while run:
        mqttc.loop(10)  # seconds timeout / blocking time
        # print(".", end="", flush=True)  # feedback to the user that something is actually happening
except KeyboardInterrupt:
    stop(mqttc)