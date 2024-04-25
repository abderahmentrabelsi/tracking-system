# Updated Sequence Diagram for User Login Process

This updated sequence diagram depicts a comprehensive user account login workflow, now including alternative scenarios, encompassing interactions between the user, frontend application, backend system, and database.

## Diagram

![SeqDiag-issue3](https://github-production-user-asset-6210df.s3.amazonaws.com/98985889/325587537-1737d182-5c22-4ab2-a47c-6639dec1415f.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20240425%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240425T112848Z&X-Amz-Expires=300&X-Amz-Signature=bac7d5e0d11933aac7b29a097374cd9a00235e407e71faf9f7c2cd161803bf65&X-Amz-SignedHeaders=host&actor_id=98985889&key_id=0&repo_id=787993841)

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
