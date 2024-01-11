--sql commands here

CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    username NOT NULL,
    category CHECK category IN ("ASUKAS", "VANHA", "HANGAROUND"),
    balance 
);

CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    name NOT NULL,
    pricein INTEGER CHECK (pricein >= 0), -- prices are in cents because rounding errors
    priceout INTEGER CHECK (priceout >= 0)
);

CREATE TABLE transaction (
    account REFERENCES account(id),
    product REFERENCES product(id),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    amount INTEGER CHECK (amount >= 1)
);