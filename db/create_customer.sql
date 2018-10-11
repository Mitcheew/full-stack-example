INSERT INTO customer
(customer_name, customer_auth_id, customer_picture, customer_email)
VALUES
($1, $2, $3, $4)
RETURNING *;