import mysql.connector

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
