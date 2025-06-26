import csv
import os
import io
import logging
from datetime import datetime
from flask import Flask, request, session, send_file, jsonify 
from flask_session import Session
from flask_cors import CORS
from config import ApplicationConfig
import helpers as db
from werkzeug.security import check_password_hash

app = Flask(__name__)
app.config.from_object(ApplicationConfig)

''' Ensure responses aren't cached
    Maybe make this more targeted in the future. When the app starts to get a little bigger.
'''
@app.after_request
def after_request(response):
  response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
  response.headers["Expires"] = 0
  response.headers["Pragma"] = "no-cache"
  return response

# Making changes here to fix bug in firefox logout
# cors = CORS(app, resources={r"/*": {"origins": "http://34.129.37.135:80"}}, supports_credentials=True)
cors = CORS(app, resources={r"/*": {
  "origins": ["http://34.129.37.135", "https://dev.synergitech.com.au", "https://synergitech.com.au"],
  "methods": ["GET", "POST", "OPTIONS", "DELETE"],
  "allow_headers": ["Content-Type", "Authorization"],
  "supports_credentials": True
}})
server_session = Session(app)

# Configure logging
logging.basicConfig(filename='logs/server.log', level=logging.INFO, \
                    format='%(asctime)s %(levelname)s: %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')


@app.route("/api/device-map", methods=['GET'])
@db.login_required
def device_map():
  user = session.get("user_id")
  company = db.get_company(session.get("company_id"))
  payload = {
    "company": company[0],
    "lat": company[1],
    "lng": company[2],
    "licenses": company[3],
    "devices": [],
  }
  
  # Get lastest device data for all devices attached to the users company   
  devices_raw = db.get_devices(user)
  try:
    for d in devices_raw:
      # print("d from device-map", d)
      try:
        latest_file_path = db.get_file_paths(d[0], 1)
        with open(latest_file_path[0][1], "r") as f:
          c = csv.reader(f)
          last_line = None
          for row in c:
            last_line = row
          device_info = {
            "devId": f"{d[0]}",
            "siteName": f"{d[1]}",
            "lat": f"{d[2]}",
            "lng": f"{d[3]}",
            "data": {
              "pressure": last_line[1],
              "flow": last_line[2],
              "date": last_line[0],
            }       
          }
          payload["devices"].append(device_info)
      except Exception as e:
        app.logger.warning(f'device_map: Error trying to read device file {latest_file_path}.csv')
    return jsonify(payload), 200
  except Exception as e:
    return jsonify({"info:": "User's company has no devices"}), 200


@app.route("/api/site-data/<id>", methods=["GET"])
@db.login_required
def site_data(id):
  # Get days query from url
  days = request.args.get("days", default=1, type=int)

  # Return site specific data set
  csvfiles = db.get_file_paths(id, days) # Sorted array tuples (dateObj, filename) of files
  if days == 1:
    return send_file(
      csvfiles[0][1], # Second item of first tuple
      mimetype='text/csv',
      as_attachment=False
    )
  elif days > 1:
    pass
    # build the csv here look near the end of https://chatgpt.com/c/6859a269-8adc-8000-8d0e-869b15b7b94f
    csv_buffer = io.StringIO()
    writer = csv.writer(csv_buffer)

    first_file = True
    for file in csvfiles:
      with open(file[1], 'r') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
          if i == 0 and not first_file: 
            if row == ["Time", "Pressure", "Flow"]: continue
          writer.writerow(row)
      first_file = False          

    csv_buffer.seek(0)  # Return to start of buffer
    return send_file(
      io.BytesIO(csv_buffer.getvalue().encode('utf-8')),
      mimetype='text/csv',
      as_attachment=False,
    )
    
  else: 
    # print(f"file with id {type(id)} not found")
    app.logger.warning(f'site_data: file(s) with id {id} not found')
    return jsonify({"error": "Resource not found"}), 404


@app.route("/api/example-site", methods=["POST"])
def example_site():
  user = db.get_user('example')
  forwarded_for = request.headers.get('X-Forwarded-For')
  client_ip = forwarded_for.split(',')[0] if forwarded_for else request.remote_addr

  # Flask session variables
  session["user_id"] = user[0]
  session["user_name"] = user[1]
  session["company_id"] = user[3]
  app.logger.info(f'login: demo-user logged in from {client_ip}')

  return jsonify({
    "id": user[0],
    "email": user[1],
  }), 200


@app.route("/api/login", methods=["POST"])
def login():
   session.clear()

   if request.method == "POST":
      username = request.json["email"]
      password = request.json["password"]
      user = db.get_user(username)
      forwarded_for = request.headers.get('X-Forwarded-For')
      client_ip = forwarded_for.split(',')[0] if forwarded_for else request.remote_addr
      
      # Validate user
      if user == None:
        return jsonify({"error": "Invalid username"}), 401
      if not check_password_hash(user[2], password):
        return jsonify({"error": "Invalid password"}), 401

      # Flask session variables
      session["user_id"] = user[0]
      session["user_name"] = user[1]
      session["company_id"] = user[3]
      app.logger.info(f'login: {username} logged in from {client_ip}')

      # For react app localStorage usage
      return jsonify({
        "id": user[0],
        "email": user[1],
      }), 200
   

@app.route("/api/auth/check", methods=["GET"])
def check_auth():
  if "user_id" in session:
    return jsonify({"status:": "authenticated"}), 200
  else:
    return jsonify({"status": "unauthorized"}), 401
   

@app.route("/api/logout", methods=["POST"])
def logout():
  try:
    session.pop("user_id")
    return "200"
  except KeyError as e:
    return jsonify({"error": "No user_id in session"}), 205
  

if __name__ == "__main__":
  app.run(host="127.0.0.1", port=5000, debug=True) # debug=True