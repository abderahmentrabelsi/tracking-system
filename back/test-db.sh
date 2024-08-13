#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Variables
DB_CONTAINER_NAME="$DB_CONTAINER_NAME"
ROOT_PASSWORD="$DB_ROOT_PASSWORD"
TEST_DB_NAME="$DB_DATABASE_TEST"
SOURCE_DB_NAME="$DB_DATABASE"
DUMP_FILE="$DUMP_FILE"

# 1. Create the test database
docker exec -i $DB_CONTAINER_NAME mysql -u root -p$ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $TEST_DB_NAME;"

# 2. Grant privileges
docker exec -i $DB_CONTAINER_NAME mysql -u root -p$ROOT_PASSWORD -e "GRANT ALL PRIVILEGES ON $TEST_DB_NAME.* TO '$DB_USERNAME'@'%';"

# 3. Flush privileges
docker exec -i $DB_CONTAINER_NAME mysql -u root -p$ROOT_PASSWORD -e "FLUSH PRIVILEGES;"

# 4. Dump the schema from the source database
docker exec -i $DB_CONTAINER_NAME mysqldump -u root -p$ROOT_PASSWORD $SOURCE_DB_NAME --no-data > $DUMP_FILE

# 5. Import the schema into the test database
docker exec -i $DB_CONTAINER_NAME mysql -u root -p$ROOT_PASSWORD $TEST_DB_NAME < $DUMP_FILE

# Clean up
rm $DUMP_FILE

echo "Test database setup completed successfully."
