import mysql.connector
import os
from datetime import datetime
from flask import session, jsonify
from functools import wraps

def login_required(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if not (user := session.get("user_id")):
      return jsonify({"error": "Unauthorized"}), 401
    return (f(*args, **kwargs))
  return decorated_function


# DATABASE
def db_connect():
  return mysql.connector.connect(option_files='/etc/mysql/connectors.cnf')


def db_terminate(curs, cnx):
  for cur in curs: cur.close()
  cnx.close()


def get_user(username=None, id=None):
  cnx = db_connect()
  cur = cnx.cursor(buffered=True)
  
  user_query = ("SELECT id, email, hashed_passwd, company_id FROM users WHERE email = %(user_name)s")
  userID_query = ("SELECT id, email FROM users WHERE id = %(id)s")
  
  if username: cur.execute(user_query, {'user_name': username})
  else: cur.execute(userID_query, {'id': id})
  row = cur.fetchone()
  db_terminate([cur], cnx)
  return row


def get_company(company_id):
  cnx = db_connect()
  cur = cnx.cursor(buffered=True)
  
  company_query = ("SELECT name, latitude, longitude, licenses FROM companies WHERE id = %(company_id)s")

  cur.execute(company_query, {"company_id": company_id})
  row = cur.fetchone()
  db_terminate([cur], cnx)
  return row



def get_devices(user_id=None):
  cnx = db_connect()
  cur = cnx.cursor(buffered=True)

  device_query = (
    """
      SELECT d.* FROM devices d JOIN users u on d.company_id = u.company_id WHERE u.id = %(user_id)s
    """
  )

  cur.execute(device_query, {'user_id': user_id})
  rows = cur.fetchall()
  return rows


def get_file_paths(device, days):
  folder_path = f"/opt/data/{device}"
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
        dated_files.append((date_obj, os.path.join(folder_path, filename)))
      except ValueError:
        continue # Skip invalid file

    # Sort list in reverse order
    sorted_set = sorted(dated_files, key=lambda x: x[0], reverse=True)

  except Exception as e:
    return e
  # Extract number files by days then sort cronologically
  return sorted(sorted_set[:days], key=lambda x: x[0])
  


def create_table():
  '''
    Grant privileges for user flask user by using $ sudo mysql
    GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, REFERENCE on iot.users TO 'flask'@'localhost' WITH GRANT OPTION;
  '''

  print("(Re)Create database table, select from the following options")
  selection = input("1 - Users\n2 - Companys\n3 - Devices\n\nEnter a number: ")

  options = {
    "1": [
      """ DROP TABLE IF EXISTS users; """,
      """ 
        CREATE TABLE users (
          id CHAR(32) PRIMARY KEY UNIQUE,
          email VARCHAR(255) UNIQUE NOT NULL,
          hashed_passwd VARCHAR(160) DEFAULT NULL,
          company_id CHAR(32),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id)
        );
      """
    ],
    "2": [
      """ DROP TABLE IF EXISTS companies; """,
      """ 
        CREATE TABLE companies (
          id CHAR(32) PRIMARY KEY UNIQUE,
          name VARCHAR(100) UNIQUE NOT NULL,
          latitude CHAR(13) NOT NULL,
          longitude CHAR(13) NOT NULL,
          licenses INT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      """
    ],
    "3": [
      """ DROP TABLE IF EXISTS devices; """,
      """ 
        CREATE TABLE devices (
          mac CHAR(12) PRIMARY KEY UNIQUE,
          name VARCHAR(30) UNIQUE NOT NULL,
          latitude CHAR(13) NOT NULL,
          longitude CHAR(13) NOT NULL,
          company_id CHAR(32),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id)
        );
      """
    ]
  }

  cnx = db_connect()
  cur = cnx.cursor()
  if selection in options:
    for q in options[selection]:
      print(f"Executing {q}")
      cur.execute(q)
  else:
    print("Invalid selection")
  cnx.commit()
  db_terminate([cur], cnx)
