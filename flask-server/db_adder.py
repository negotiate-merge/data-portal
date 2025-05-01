from werkzeug.security import generate_password_hash
import helpers as do
import sys
import uuid

### THIS NEEDS WORK DONE ### 
def create_user(cnx):
  curA = cnx.cursor(buffered=True)
  curB = cnx.cursor(buffered=True)

  # Ensure proposed UUID not already in use
  curB.execute(get_user_ids)
  id = None
  unique = False
  user_ids = {row[0] for row in curB.fetchall()} # returns a set of id's for faster lookup - O(1) instead of O(n)
  while True:
    id = uuid.uuid4().hex
    print (user_ids, id)
    if id not in user_ids: break

  # Get new user credentials from console.
  new_user = {
    'id': str(id),
    'email': input("Enter Email: "),
    'password': generate_password_hash(input('Enter password: '), "scrypt", salt_length=8)
  }

  print(new_user['id'], f"is {len(new_user['id'])} long")

  # Get all user emails
  curA.execute(get_user_emails)

  # If the table is empty this loop will not run
  for email in curA:
    if email[0] == new_user['email']:
      print("Email already in use, aborting")
      cnx.close()
      sys.exit(1)
    else:
      curB.execute(add_user, new_user)

  # Allow for empty table scenario
  if curA.rowcount == 0:
    curB.execute(add_user, new_user)


# Querys
get_user_emails = ("SELECT email FROM users")
get_user_ids = ("SELECT id FROM users")
add_user = ("INSERT INTO users (id, email, hashed_passwd) "
      "VALUES (%(id)s, %(email)s, %(password)s)")

def get_companys(cnx):
  cur = cnx.cursor(buffered=True)
  cur.execute(("SELECT id, name FROM companies"))
  if cur.rowcount == 0: 
    print("No companys in table")
    cur.close()
    return None
  else:
    ids = {row[0] for row in cur.fetchall()}
    print(ids)

  cur.close()


# Create new company
def create_company(cnx):
  create_query = """
    CREATE TABLE companies (
    id CHAR(32) PRIMARY KEY UNIQUE,
    name VARCHAR(100) UNIQUE NOT NULL,
    latitude CHAR(13) NOT NULL,
    longitude CHAR(13) NOT NULL,
    licenses INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  """
  
  # Get current companies
  curA = cnx.cursor(buffered=True)
  # curB = cnx.cursor(buffered=True)
  
  add_company = ("INSERT INTO companies (id, name, latitude, longitude, licenses) "
      "VALUES (%(id)s, %(name)s, %(latitude)s, %(longitude)s, %(licenses)s)")

  new_company = {
    "id" : str(uuid.uuid4().hex),
    "name": "Wilcania Council",
    "latitude": "-31.558335",
    "longitude": "143.377734",
    "licenses": 50
  }
  
  if not get_companys(cnx):
    curA.execute(add_company, new_company)
    cnx.commit()
    curA.close()
  else:
    # Handle the scenario where there are companies
    pass
  


print("Welcome to the db entry adder. You need to know the company id of the company that you want to add entrys to.")
print("If said company does not currently exist you will need to create it first.\n")

selector = ''
cnx = do.db_connect()

while selector != 'q':
  print("Select an option from the following:\nl - get all company names\nc - create a company\nu - add a user\nd - add a device\nq - quit\n")
  selector = input("Enter your selection: ")
  
  match selector:
    case 'l':
      print("list companys")
      get_companys(cnx)
    case 'c':
      print("create company")
      create_company(cnx)
    case 'u':
      print("add user")
    case 'd':
      print("add device")
    case _:
      print("Invalid input")
    


# Close cursor and connection
# cnx.commit()
# curA.close()
# curB.close()

cnx.close()