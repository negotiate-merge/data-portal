import csv
from flask import Flask, request, jsonify, session
from flask_session import Session
from flask_cors import CORS, cross_origin
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

  data = []
  for d in ["a84041e08189aaaa", "a84041e08189bbbb"]:
    try:
      with open(f"../data_logs/{d}.log", "r") as f:
        c = csv.reader(f)
        last_line = None
        for row in c:
          last_line = row
        device_info = {
          "devId": f"{d}",
          "siteName": "Test",
          "lat": "-31.558335" if d == "a84041e08189aaaa" else "-31.560691",
          "lng": "143.377734" if d == "a84041e08189aaaa" else "143.373465",
          "data": {
            "pressure": last_line[0],
            "flow": last_line[1],
            "time": last_line[2],
          }       
        }
        data.append(device_info)
    except Exception as e:
      print("Error encountered trying to read device files", e)
    
  # print(data)
  return jsonify(data)


@app.route("/site-data/<id>", methods=["GET"])
def site_data(id):
  # Return site specific data set
  data = []
  try:
      with open(f"../data_logs/{id}.log", "r") as f:
        c = csv.reader(f)

        device_data = {
          "devId": f"{id}",
          "siteName": "Test",
          "lat": "-31.558335" if id == "a84041e08189aaaa" else "-31.560691",
          "lng": "143.377734" if id == "a84041e08189aaaa" else "143.373465",
          "data": []
        }

        data = []
        for row in c:
          d = {
            "pressure": row[0],
            "flow": row[1],
            "time": row[2],            
          }

          data.append(d)
        device_data['data'] = data
  except Exception as e:
      print("Error encountered trying to read device files", e)
    
  print(device_data)
  return jsonify(device_data)


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
  session.pop("user_id")
  return "200"

if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0")