import mysql.connector
# from functools import wraps
# from werkzeug.security import check_password_hash

""" NOT SURE IF NEEDED - MAY BE IMPLEMENTED IN REACT JS SIDE
def login_required(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if session.get("user_id") is None:
      return redirect("/login")
    return f(*args, **kwargs)
  return decorated_function

"""


def db_connect():
  return mysql.connector.connect(option_files='/etc/mysql/connectors.cnf')


def db_terminate(curs, cnx):
  for cur in curs: cur.close()
  cnx.close()


def get_user(username=None, id=None):
  cnx = db_connect()
  cur = cnx.cursor(buffered=True)
  
  user_query = ("SELECT id, email, hashed_passwd FROM users WHERE email = %(user_name)s")
  userID_query = ("SELECT id, email FROM users WHERE id = %(id)s")
  
  if username: cur.execute(user_query, {'user_name': username})
  else: cur.execute(userID_query, {'id': id})
  row = cur.fetchone()
  db_terminate([cur], cnx)
  return row


def create_user_table():
  '''
  Grant privileges for user flask user by using $ sudo mysql
  GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT on iot.users TO 'flask'@'localhost' WITH GRANT OPTION;
  '''
  cnx = db_connect()
  cur = cnx.cursor()
  cur.execute("DROP TABLE IF EXISTS users;")
  create_user_table = """ 
  CREATE TABLE users (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_passwd VARCHAR(160) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  """
  cur.execute(create_user_table)
  cnx.commit()
  db_terminate([cur], cnx)
