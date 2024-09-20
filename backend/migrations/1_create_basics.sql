--sql commands here

-- to show the time in Finnish time, do this
-- transaction_date AT TIME ZONE 'UTC' AS utc_transaction_date

SET timezone = 'Europe/Helsinki'; --make sure time is the same as in Finland

CREATE TABLE IF NOT EXISTS account (
    username VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) CHECK (category IN ('ASUKAS', 'VANHA', 'HANGAROUND')),
    balance INTEGER DEFAULT 0,
    closed BOOLEAN DEFAULT false,
    id SERIAL PRIMARY key
);

CREATE TABLE IF NOT EXISTS product (
    name VARCHAR(50) UNIQUE NOT NULL,
    pricein INTEGER CHECK (pricein >= 0), -- prices are in cents because rounding errors
    priceout INTEGER CHECK (priceout >= 0),
    color VARCHAR(50) NOT NULL CHECK (color in ('WHITE', 'BLUE', 'RED', 'BLACK', 'YELLOW', 'REDBLUE', 'YELLOWBLACK'))
);

CREATE TABLE IF NOT EXISTS transaction (
    username VARCHAR(50),
    product_name VARCHAR(50),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount INTEGER CHECK (amount >= 1)
);

CREATE TABLE IF NOT EXISTS admin (
    username VARCHAR(50),
    hash VARCHAR(64)
);