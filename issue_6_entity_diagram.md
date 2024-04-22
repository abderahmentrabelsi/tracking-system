# 🗃️ Entity-Relationship Diagram Overview 🗂️

This diagram offers a visual representation of a database's structure. It highlights the tables/entities, their attributes (fields), and relationships.

## Entities and Relationships

- 🧑‍💼 **USER**: Central entity storing personal and login information.
- 🗝️ **TOKEN_DETAILS**: Holds access tokens and multi-factor authentication secrets.
- ⏰ **WORK_HOURS**: Records the check-in/out times and duration of employee shifts.
- 🏢 **DEPARTMENT**: Represents different business or organizational units.
- 🧑‍💼 **SUPERVISOR**: Contains details of each department's supervisory staff.
- 📅 **LOGIN_HISTORY**: Tracks user authentication instances.

![Entity Relationship Diagram Version 2](https://github.com/qorebacemabr/QoreTracking/assets/75340391/2938bebb-ed03-4d3e-ab06-b02460b0f971)

# 🆕 Key Updates in the Revised Diagram 🔄

- 🌐 **TOKEN_DETAILS Separation**: Access-related attributes have been extracted from the USER entity to form a dedicated TOKEN_DETAILS table, enhancing security and normalization.
- ⌛ **WORK_HOURS Table Addition**: A new WORK_HOURS entity has been introduced, which includes check-in, check-out, and duration of work, allowing for a detailed tracking of employee hours.
- 👨‍🏫 **Supervisor Relationship Change**: Instead of directly linking to users, supervisors are now associated with departments, streamlining the hierarchy and clarity in supervision.
- 🔍 **Detailed Work Hour Fields**: The WORK_HOURS table now potentially captures the type of work, location, and any comments, offering a comprehensive view of the employee's work schedule.

