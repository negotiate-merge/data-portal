from werkzeug.security import generate_password_hash
import helpers as do
import sys

# Set up db connection & cursors.
cnx = do.db_connect()
curA = cnx.cursor(buffered=True)
curB = cnx.cursor(buffered=True)
 
# Querys
get_user_emails = ("SELECT email FROM users")
add_user = ("INSERT INTO users (email, hashed_passwd) "
      "VALUES (%(email)s, %(password)s)")

# Get new user credentials from console.
new_user = {
  'email': input("Enter Email: "),
  'password': generate_password_hash(input('Enter password: '), "scrypt", salt_length=8)
}

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