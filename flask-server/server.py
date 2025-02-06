import csv
import os
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
cors = CORS(app, supports_credentials=True)
server_session = Session(app)

@app.route("/device-map", methods=['GET'])
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
      with open(f"../data_logs/{d}.csv", "r") as f:
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
      print("Error encountered trying to read device files", e)

  
  print(data, "\n\n")

  return jsonify(data)


@app.route("/site-data/<id>", methods=["GET"])
def site_data(id):
  if not session.get("user_id"): return jsonify({"error": "Unauthorized"}), 401

  # Return site specific data set
  logfile = f"../data_logs/{id}.csv"
  if os.path.exists(logfile):
    print("Valid file found returning data for {}".format(id))
    return send_file(
      logfile,
      mimetype='text/csv',
      as_attachment=False
    )
  else: 
    print(f"file with id {type(id)} not found")
    return jsonify({"error": "Resource not found"}), 404


@app.route("/@me", methods=['GET'])
def get_current_user():
  user_id = session.get("user_id")
  if not user_id:
    return jsonify({"error": "Unauthorized"}), 401
  print(f"trying to get user with id {user_id}")
  user = do.get_user(id=user_id)
  if user:
    u = jsonify({
          "id": user[0],
          "email": user[1],
        })
    print("returning", u)
    return u
  else:
    print("No user returned")
    return jsonify({
      "id": "333",
      "email": "fake@address.com"
    })


@app.route("/login", methods=["POST"])
def login():
   session.clear()

   if request.method == "POST":
      username = request.json["email"]
      password = request.json["password"]
      user = do.get_user(username)
      
      if user == None:
        return jsonify({"error": "Invalid username"}), 401

      # Handle invalid password
      if not check_password_hash(user[2], password):
        return jsonify({"error": "Invalid password"}), 401

      # user[0] = id    user[1] = email     user[2] = hashed_passwd

      session["user_name"] = user[1]
      session["user_id"] = user[0]
      print(f"session user = {session['user_name']}")
      print(f"session user id = {session['user_id']}")

      return jsonify({
        "id": user[0],
        "email": user[1],
      })
   

@app.route("/logout", methods=["POST"])
def logout():
  try:
    session.pop("user_id")
    return "200"
  except KeyError as e:
    return jsonify({"error": "No user_id in session"}), 205
  

if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0")