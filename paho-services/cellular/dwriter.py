import os

def write_data(path, data):
  working_directory = f"/opt/data/{path}"
  header = "Time,Pressure,Flow\n"
  
  try:
    os.chdir(working_directory)
  except FileNotFoundError:
    # TODO Change this to log, noted on Jira Board
    print(f"Error: Device path {working_directory} not found.")
    exit(1)

  for d in data:
    date_file = f"{d[1][2][:10]}.csv"
    date_time = d[1][2]
    pressure = d[1][0]
    flow = d[1][1]

    # Check if day file exists and write.
    if os.path.exists(date_file):
      with open(date_file, "a") as f:
        f.write(f"{date_time},{pressure},{flow}\n")
    else:
      # Create date file if not found.
      with open(date_file, "w") as f:
        f.write(header)
        f.write(f"{date_time},{pressure},{flow}\n")
