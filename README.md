# Problems / ToDo
- [ ] Create table for licenses, track purchase count and date aquired. We will aggreagate total licenses per company from this table and track licenses in use else where, probably in the companie table directly as a function of the database.
- [ ] List devices is cutting part of the cordinates off for some reason.
- [ ] Create a simulation page for viewing the product without the need for logging in.
- [ ] Make a script/system for creating .crt .key pairs uniquely so that they can be assigned to each client.
- [ ] Establish correct file permissions with the above to impove security.
- [ ] have a look at changes suggested in https://chatgpt.com/share/67d9bdaf-9c8c-8000-85e7-16cec54c7658 to the tls test data sender on the pi.

- [ ] when logging out the logged in dashboard page loads briefly before returning to the login page. This needs to be changed maybe the await is not being awaited?
- [ ] Upgrade vis.gl to the latest version keep note of the current version in case of breaking changes. Last working version was "^1.1.3"
- [ ] Longer term make the code more modular - we are currently repeating the whole block for a new graph.
- [ ] Construct an org table to hold details about the the organisations that users are associated with.
- [ ] Construct a licenses table to hold details of devices permitted per organization.
- [ ] Make nav bar stick to the top of the page
- [ ] Logout fails in firefox with AxiosError ECONNABORTED due to the Enhanced Tracking Protection feature in firefox.
