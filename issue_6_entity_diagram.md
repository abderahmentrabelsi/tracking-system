# Entity Relationship Diagram for QoreTracking

The following diagram represents the database schema for QoreTracking, outlining the relationships between users, their login history, work hours, token details, and departments.

![diagram (2)](https://github.com/qorebacemabr/QoreTracking/assets/75340391/915046bf-99b6-455c-afd7-2adb4be7ff37)


## Description of Entities and Relationships

### USER 🙍‍♂️
- **ID** (Primary Key)
- **Username** (String)
- **Password** (String)
- **Email** (String)
- **FirstName** (String)
- **LastName** (String)
- **Picture** (String)
- **Role** (String)
- **PhoneNumber** (String)
- **Address** (String)
- **DepartmentID** (Foreign Key)

### DEPARTMENT 🏢
- **ID** (Primary Key)
- **Name** (String)
- **Email** (String)
- **SupervisorID** (Foreign Key)

### LOGIN_HISTORY 📅
- **ID** (Primary Key)
- **UserID** (Foreign Key)
- **LoginIP** (String)
- **LoginDevice** (String)
- **LoginTime** (Date)

### WORK_HOURS ⏰
- **Checkin** (Date)
- **Checkout** (Date)
- **Duration** (Float)
- **WorkType** (String)
- **Location** (String)
- **Comments** (String)

### TOKEN_DETAILS 🔐
- **AccessToken** (String)
- **RefreshToken** (String)
- **TokenExpiry** (Date)
- **TOTPSecret** (String)

## Relationships

- A **USER** is managed by a **DEPARTMENT** (`managed_by`).
- A **DEPARTMENT** supervises a **USER** (`supervised_by`).
- A **USER** has a **LOGIN_HISTORY** (`logs`).
- A **USER** has **WORK_HOURS** (`records_of`).
- A **USER** has **TOKEN_DETAILS** (`has`).

Each relationship is depicted with a line connecting the relevant entities, with a notation indicating the nature of the relationship.
