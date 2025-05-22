import csv
import os
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

"""
  This part here might not be needed but is left in for now.
  It is part of a cs50 project that is brought in as boiler plate.

# Ensure responses aren't cached
@app.after_request
def after_request(response):
  response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
  response.headers["Expires"] = 0
  response.headers["Pragma"] = "no-cache"
  return response
"""
# Making changes here to fix bug in firefox logout
# cors = CORS(app, resources={r"/*": {"origins": "http://34.129.37.135:80"}}, supports_credentials=True)
cors = CORS(app, resources={r"/*": {
  "origins": "http://34.129.37.135", # 
  "methods": ["GET", "POST", "OPTIONS", "DELETE"],
  "allow_headers": ["Content-Type", "Authorization"],
  "supports_credentials": True
}})
server_session = Session(app)

# Configure logging
logging.basicConfig(filename='logs/server.log', level=logging.INFO, \
                    format='%(asctime)s %(levelname)s: %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')

@app.route("/api/dashboard", methods=["GET"])
def dashboard():
  if not session.get("user_id"): return jsonify({"error": "Unauthorized"}), 401
  " We are going to make changes to the database and incorporate those here and in device-map below"

  return jsonify({
    "dummy_data": "Remove later"
  })


@app.route("/api/device-map", methods=['GET'])
def device_map():
  if not (user := session.get("user_id")): return jsonify({"error": "Unauthorized"}), 401
  '''
  [('863663062798815', 'STA1', '-33.8073128', '151.2510467', 'c70b8cb72ea84498bc3cbd4850f68b18', 1, datetime.datetime(2025, 5, 2, 5, 43, 36)), 
   ('863663062798816', 'STA2', '-33.8080089', '151.2486871', 'c70b8cb72ea84498bc3cbd4850f68b18', 1, datetime.datetime(2025, 5, 2, 5, 44, 17))]
  '''
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
  for d in devices_raw: # TODO If there are no devices, this may error at present
    # Get valid device log files
    folder_path = f"/opt/data/{d[0]}"
    try:
      # Get files from device directory
      files = [
        f for f in os.listdir(folder_path)
        if f.endswith(".csv")
      ]

      dated_files = []
      for filename in files:
        try:
          date_str = filename.replace(".csv", "")
          date_obj = datetime.strptime(date_str, "%Y-%m-%d")
          dated_files.append((date_obj, filename))
        except ValueError:
          continue # Skip invalid file

      # Get the latest log file
      if dated_files:
        latest_file = max(dated_files, key=lambda x: x[0])[1]
        latest_file_path = os.path.join(folder_path, latest_file)

      with open(latest_file_path, "r") as f:
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
      #print("Error encountered trying to read device files", e)
      # logging.error("device_map: Error trying to read device file %(d)s.csv")
      app.logger.warning(f'device_map: Error trying to read device file {latest_file_path}.csv')

  print(payload)

  return jsonify(payload)


@app.route("/api/site-data/<id>", methods=["GET"])
def site_data(id):
  if not session.get("user_id"): return jsonify({"error": "Unauthorized"}), 401

  # Return site specific data set
  csvfile = f"/opt/data/{id}.csv"
  if os.path.exists(csvfile):
    # print("Valid file found returning data for {}".format(id))
    return send_file(
      csvfile,
      mimetype='text/csv',
      as_attachment=False
    )
  else: 
    print(f"file with id {type(id)} not found")
    app.logger.warning(f'site_data: file with id {id} not found')
    return jsonify({"error": "Resource not found"}), 404



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
      })
   

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
  app.run(host="127.0.0.1", port=5000, debug=True) # debug=True, 