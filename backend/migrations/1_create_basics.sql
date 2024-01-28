--sql commands here

-- to show the time in Finnish time, do this
-- transaction_date AT TIME ZONE 'UTC' AS utc_transaction_date

SET timezone = 'Europe/Helsinki'; --make sure time is the same as in Finland

CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) CHECK (category IN ('ASUKAS', 'VANHA', 'HANGAROUND')),
    balance INTEGER DEFAULT 0
);

CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    pricein INTEGER CHECK (pricein >= 0), -- prices are in cents because rounding errors
    priceout INTEGER CHECK (priceout >= 0)
);

CREATE TABLE transaction (
    account_id INTEGER REFERENCES account(id),
    username VARCHAR(50),
    product_id INTEGER REFERENCES product(id),
    product_name VARCHAR(50),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount INTEGER CHECK (amount >= 1)
);

CREATE TABLE admin (
    username VARCHAR(50),
    hash VARCHAR(64)
)