from werkzeug.security import generate_password_hash
import helpers as db
from mysql.connector import IntegrityError, Error
import sys
from tabulate import tabulate
import uuid

# Querys
get_user_emails = ("SELECT email FROM users")
get_user_ids = ("SELECT id FROM users")
get_company_ids = ("SELECT id FROM companies")
add_user = ("INSERT INTO users (id, email, hashed_passwd, company_id) "
      "VALUES (%(id)s, %(email)s, %(password)s, %(company_id)s)")

"""   CREATE USERS   """
def create_user(cnx):
  # Create cursors
  curA = cnx.cursor(buffered=True)
  curB = cnx.cursor(buffered=True)

  # Get all user ids, emails
  curA.execute(get_user_emails)
  curB.execute(get_user_ids)
  user_ids = {row[0] for row in curB.fetchall()} # returns a set of id's for faster lookup - O(1) instead of O(n)
  user_emails = {row[0] for row in curA.fetchall()}
  
  id = email = company_id = None
  # Ensure new user id is unique
  while True:
    id = uuid.uuid4().hex
    print (user_ids, id)
    if id not in user_ids: break

  # Ensure email not already in user table
  while True:
    email = input("Enter Email: ")
    if email not in user_emails: break
    else: print("Email already in use, contact system administrator or choose an alternative.")

  # Get all company ids
  curA.execute(get_company_ids)
  company_ids = {row[0] for row in curA.fetchall()}

  # Ensure valid company id
  while True:
    company_id = input("Enter your company id: ")
    if company_id in company_ids: break
    else: print("No company exists with that id.")

  
  # Create new user, will validate pasword strength later on the front end
  new_user = {
    'id': str(id),
    'email': email,
    'password': generate_password_hash(input('Enter password: '), "scrypt", salt_length=8),
    'company_id': company_id,
  }

  curB.execute(add_user, new_user)
  cnx.commit()
  db.db_terminate([curA, curB], cnx)
  print("User added successfully.")
  sys.exit(0)


"""   LIST COMPANYS   """
def get_companys(cnx):
  cur = cnx.cursor(buffered=True)
  cur.execute(("SELECT id, name FROM companies"))
  if cur.rowcount == 0: 
    print("No companys in table")
    cur.close()
    return None
  else:
    companies = []
    headers = ["Company", "ID"]
    for row in cur.fetchall():
      companies.append([row[1], row[0]])
    table = tabulate(companies, headers=headers, tablefmt="psql")
    print(f"\n{table}\n")
  cur.close()


"""   CREATE A COMPANY   """
def create_company(cnx):
  # Get current companies
  curA = cnx.cursor(buffered=True)
  add_company = ("INSERT INTO companies (id, name, latitude, longitude, licenses) "
      "VALUES (%(id)s, %(name)s, %(latitude)s, %(longitude)s, %(licenses)s)")
  
  # Print the company list
  get_companys(cnx)
  print("Make sure the company is not already in the list above.\n")

  # Ensure company id is unique
  curA.execute(get_company_ids)
  company_ids = {row[0] for row in curA.fetchall()}
  while True:
    id = uuid.uuid4().hex
    if id not in company_ids: break

  new_company = {
    "id" : id,
    "name": input("Enter company name: "),
    "latitude": input("Enter Latitude: "),
    "longitude": input("Enter Longitude: "),
    "licenses": int(x) if (x := input("Enter number of licenses: ")) else None,
  }
    
  try:
    curA.execute(add_company, new_company)
    cnx.commit()
    print(f"\n{new_company['name']} successfully added with id  {new_company['id']}\n")
  except IntegrityError:
    print("\n Error: Duplicate company name exists in db.\n")
  
  curA.close()


"""   ADD DEVICES   """
def add_device(cnx):
  get_companys(cnx)
  # Get cursor
  cur = cnx.cursor(buffered=True)
  company_name = ''
  while not company_name:
    company_id = input("Enter company id you wish to add devices too: ")
    cur.execute("SELECT id, name, licenses FROM companies WHERE id = %s", (company_id,))
    if cur.rowcount == 0:
      print("\nCompany not found\n")
    else:
      for row in cur:
        company_name = row[1]
        licenses = row[2]

  try:
    while licenses:
      print(f"Adding devices to {company_name} with {licenses} remaining licenses")
      # Aggregate lists of mac addresses and names
      imeis = names = []
      cur.execute("SELECT imei, name FROM devices WHERE company_id = %s", (company_id,))
      if cur.rowcount == 0: pass
      else:
        for row in cur:
          imeis.append(row[0])
          names.append(row[1])

      while (imei := input('Enter IMEI address of device: ')) in imeis: pass
      while (name := input('Enter Asset name for device: ')) in names: pass

      device = {
        'imei': imei,
        'name': name,
        'latitude': input('Enter Latitude: '),
        'longitude': input('Enter Longitude: '),
        'company_id': company_id,
        'is_active': 1,
      }

      # Execute the device add, update license count
      add_device = ("INSERT INTO devices (imei, name, latitude, longitude, company_id, is_active) "
        "VALUES (%(imei)s, %(name)s, %(latitude)s, %(longitude)s, %(company_id)s, %(is_active)s)")

      try:
        cur.execute(add_device, device)
        licenses -= 1
        cur.execute("UPDATE companies SET licenses = %s WHERE id = %s", (licenses, company_id))
      except Error as e:
        print(f"Error occurred during database write: {e}")

      decide = input("Press Enter to add another or q to quit: ")
      if decide == 'q': 
        cnx.commit()
        db.db_terminate([cur], cnx)
        sys.exit(0)
  except KeyboardInterrupt:
    cnx.commit()
    db.db_terminate([cur], cnx)
    sys.exit(0)


"""   LIST DEVICES FOR A COMPANY   """
def device_list(cnx):
  get_companys(cnx)
  target = input("Enter target Company ID from the list above: ")
  cur = cnx.cursor(buffered=True)

  try:
    cur.execute("SELECT * FROM devices WHERE company_id = %s", (target,))
    if cur.rowcount == 0: 
      print("No devices in table")
      cur.close()
      return None
    else:
      devices = []
      headers = ['imei', 'name', 'latitude', 'longitude', 'company_id', 'is_active', 'created']
      for row in cur.fetchall():
        devices.append(list(row))
      table = tabulate(devices, headers=headers, tablefmt="psql")
      print(f"\n{table}\n")
    cur.close()
  except Error as e:
    print("Error listing devices: {e}")

"""
    Program Entry.
"""

print("Welcome to the db entry adder. You need to know the id of the company that you want to add entrys to.")
print("If said company does not currently exist you will need to create it first.\n")

selector = ''
cnx = db.db_connect()

try:
  while selector != 'q':
    print("""Select an option from the following:\nl - Get all company names\nc - Create a company\nu - Add a user\n\
a - Add a device\nd - Get list of devices for a company\nq - Quit\n""")
    selector = input("Enter your selection: ")
    
    match selector:
      case 'l':
        # List companys
        get_companys(cnx)
      case 'c':
        # Create company
        create_company(cnx)
      case 'u':
        # Add user
        create_user(cnx)
      case 'a':
        # Add device")
        add_device(cnx)
      case 'd':
        # List devices for a company
        device_list(cnx)
      case 'q':
        print('Exiting')
      case _:
        print("Invalid input")
  cnx.close()
except KeyboardInterrupt:
  cnx.close()