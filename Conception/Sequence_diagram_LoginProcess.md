# Updated Sequence Diagram for User Login Process

This updated sequence diagram depicts a comprehensive user account login workflow, now including alternative scenarios, encompassing interactions between the user, frontend application, backend system, and database.

## Diagram

![SeqDiag-issue3](https://github.com/qorebacemabr/QoreTracking/assets/98985889/e6cfe3d3-c164-4ae3-9b59-d620829b7fe5)


## Description
This repository contains an updated sequence diagram illustrating the login process with a focus on handling both successful and failed login attempts. The diagram has been refined based on the feedback and guidance provided by the supervisor.

👤 **User to Frontend App – “type email & password”**:
- This step remains the same as the user enters their email and password.

🔒 **Frontend App to Backend App – “login”**:
- The frontend app sends the login credentials to the backend app.

🔍 **Backend App to Database – “queries the Database to validate the credentials”**:
- The backend app queries the database to validate the entered credentials.

💡 **Database to Backend App – “user data if the credentials are valid”**:
- If the credentials are valid, the database responds with the user data.

❌ **alt – Failed Login**:
- Within this fragment,the following interactions are included:
  - Backend App to Frontend App – “send error response” (or any other appropriate message name indicating failure).
  - Frontend App to User – “Display Error Message”.


✅ **alt – Successful Login**:
 - Within this fragment,the following interactions are included:
   - Backend App to Frontend App – “send confirmation response” (or any other appropriate message name indicating success).
   - Frontend App to User – “Display Login Confirmation”.
