ALTER TABLE transaction
ADD COLUMN user_id INTEGER;

-- Step 2: Update user_id based on username
UPDATE transaction t
SET user_id = (
    SELECT id FROM account a WHERE a.username = t.username
);

-- Step 3: Remove the old username column
ALTER TABLE transaction
DROP COLUMN username;

-- Add price sum to the database
-- Step 1: Add the sum column
ALTER TABLE transaction
ADD COLUMN sum INTEGER;

-- Step 2 (optional): Populate sum with an initial value, for example, 0
UPDATE transaction
SET sum = 0;

-- Alternatively, if sum is calculated based on amount and product prices:
UPDATE transaction t
SET sum = (t.amount * p.pricein)
FROM product p
WHERE t.product_name = p.name;
