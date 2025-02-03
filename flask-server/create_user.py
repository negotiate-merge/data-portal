from werkzeug.security import generate_password_hash
import helpers as do
import sys
import uuid

# Set up db connection & cursors.
cnx = do.db_connect()
curA = cnx.cursor(buffered=True)
curB = cnx.cursor(buffered=True)
 
# Querys
get_user_emails = ("SELECT email FROM users")
get_user_ids = ("SELECT id FROM users")
add_user = ("INSERT INTO users (id, email, hashed_passwd) "
      "VALUES (%(id)s, %(email)s, %(password)s)")

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

# Close cursor and connection
cnx.commit()
curA.close()
curB.close()

cnx.close()