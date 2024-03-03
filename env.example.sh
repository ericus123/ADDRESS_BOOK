# Environment Variables Example for NestJS

# General Configuration
PORT: <PORT value>
NODE_ENV: <"development | test | production">

# Redis Configuration
REDIS_CONNECTION_URI: "<REDIS_CONNECTION_URI value>"

# Database Configuration
DEV_DB_URI: "<DEV_DB_URI value>"
STAG_DB_URI: "<STAG_DB_URI value>"
PROD_DB_URI: "<PROD_DB_URI value>"
ALTER_TABLES: <true or false for alter table option in postgres>

# Cryptography Configuration
ENCRYPTION_KEY: <ENCRYPTION_KEY value>
HASH_SALT: <HASH_SALT value>

# JWT Configuration
JWT_SECRET: "<JWT_SECRET value>"
JWT_REFRESH_EXP: <JWT_REFRESH_EXP value>
JWT_ACCESS_EXP: <JWT_ACCESS_EXP value>
JWT_EXPIRATION_THRESHOLD: <JWT_EXPIRATION_THRESHOLD value>
SIGNOUT_EXP: <SIGNOUT_EXP value>
