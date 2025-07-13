# Not a real readme, but a collection of notes.
## Working in development
To start the development server run the `react_dev_run` script from the home directory.

To stop the backend service and the flask server for development purposes
`$ sudo systemctl stop backend_flask.service`

## To build and deploy from dev to production fun the following
`$ cd /home/nigel/data-portal/react-client`
`$ npm run build`
`$ cd ~/`
`$ sudo ./deploy`

## Create a backup image and restore
A backup image has been created prior to bringing chirpstack in to the stack with 
`$ gcloud compute machine-images create data-store-backup-1-7-2025 --source-instance=data-store`

To create a machine-image it is recommended to stop all services first
`$ sudo systemctl stop mysql mosquitto backend_flask backend_paho`

The machine image is called "data-store-backup-1-7-2025" and it can be restored with
`$ gcloud compute instances create NEW_INSTANCE_NAME --source-machine-image=data-store-backup-1-7-2025 --zone=ZONE`

The zone component can more or less be ommitted since all attempts to use it have thrown errors.

View all machine-images with
`$ gcloud compute machine-images list`

### Notes
- The listener for sim connected device uploads is configured to listen on localhost:1883 as it is currently a local connection. If the system was to be seperated out certs would be required and the ACL in /etc/mosquitto ammended accordingly.

## ssl cert generation
```
## The old way
# Create client key
$ openssl genrsa -out <CN>-key.pem 4096

# Create certificate signing request
$ openssl req -new -out <CN>.csr -key pi-client/pi.key

# Create client cert
$ openssl x509 -req -in <CN>.csr -CA /path/to/ca.pem -CAkey /path/to/ca-key.pem -CAcreateserial -out <CN>.pem -days 360


### The new way
### create a <name>-client.json file first, see examples in certs dirs
$ cfssl gencert -ca=/path/to/CA/ca.pem -ca-key=/path/to/CA/ca-key.pem -config=/path/to/CA/ca-config.json -profile=client <name>-client.json | cfssljson -bare <name>-client

eg
$ cfssl gencert -ca=../../ca.pem -ca-key=../../ca-key.pem -config=../../ca-config.json -profile=client chirpstack-client.json | cfssljson -bare chirpstack-client
```