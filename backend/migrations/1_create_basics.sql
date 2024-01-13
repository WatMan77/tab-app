--sql commands here

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
    username VARCHAR(50) REFERENCES account(username),
    product_id INTEGER REFERENCES product(id),
    product_name VARCHAR(50) REFERENCES product(name),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount INTEGER CHECK (amount >= 1)
);