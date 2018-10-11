CREATE TABLE customer (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(180),
    customer_auth_id TEXT,
    customer_picture TEXT,
    customer_email TEXT
)