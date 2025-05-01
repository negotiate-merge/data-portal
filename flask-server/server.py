import csv
import os
import logging
from flask import Flask, request, session, send_file, jsonify 
from flask_session import Session
from flask_cors import CORS
from config import ApplicationConfig
import helpers as do
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
  '''
    What really will happen here is we will get an identifier from the session and 
    use that to detirmine what device data to retrieve. That will be pulled from db.
    Then we use that information to pull the relevant data files and return that.
    devId, siteName, lat, lng will come from the db, data will come from the files.
  '''
  if not session.get("user_id"): return jsonify({"error": "Unauthorized"}), 401
  data = []
  for d in ["a84041e08189aaaa", "a84041e08189bbbb"]:
    try:
      with open(f"/opt/data/{d}.csv", "r") as f:
        c = csv.reader(f)
        last_line = None
        for row in c:
          last_line = row
        device_info = {
          "devId": f"{d}",
          "siteName": "Test site 1" if d == "a84041e08189aaaa" else "Test site 2",
          "lat": "-31.558335" if d == "a84041e08189aaaa" else "-31.560691",
          "lng": "143.377734" if d == "a84041e08189aaaa" else "143.373465",
          "data": {
            "pressure": last_line[1],
            "flow": last_line[2],
            "date": last_line[0],
          }       
        }
        data.append(device_info)
    except Exception as e:
      #print("Error encountered trying to read device files", e)
      # logging.error("device_map: Error trying to read device file %(d)s.csv")
      app.logger.warning(f'device_map: Error trying to read device file {d}.csv')

  return jsonify(data)


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
      user = do.get_user(username)
      forwarded_for = request.headers.get('X-Forwarded-For')
      client_ip = forwarded_for.split(',')[0] if forwarded_for else request.remote_addr
      
      if user == None:
        return jsonify({"error": "Invalid username"}), 401

      # Handle invalid password
      if not check_password_hash(user[2], password):
        return jsonify({"error": "Invalid password"}), 401

      # user[0] = id    user[1] = email     user[2] = hashed_passwd

      session["user_name"] = user[1]
      session["user_id"] = user[0]
      # logging.info('login: %(username)s logged in from %(client_ip)s')
      app.logger.info(f'login: {username} logged in from {client_ip}')
      # print(f"session user = {session['user_name']}")
      # print(f"session user id = {session['user_id']}")

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
  app.run(host="127.0.0.1", port=5000) # debug=True, 