-- create_basics.sql
-- Schema bootstrap (idempotent, safe for postgres-migrations)
-- No pg_dump boilerplate, all DDL is guarded with IF NOT EXISTS

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'color_enum'
          AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.color_enum AS ENUM (
            'WHITE',
            'BLUE',
            'RED',
            'BLACK',
            'YELLOW',
            'REDBLUE',
            'YELLOWBLACK',
            'EMPTY'
        );
    END IF;
END
$$;

-- Account table
CREATE TABLE IF NOT EXISTS public.account (
    id serial PRIMARY KEY,
    username varchar(50) UNIQUE NOT NULL,
    category varchar(50) CHECK (category IN ('ASUKAS', 'VANHA', 'HANGAROUND')),
    balance integer DEFAULT 0,
    closed boolean DEFAULT false,
    pincode varchar(255),
    unlocked_until timestamptz
);

-- Admin table
CREATE TABLE IF NOT EXISTS public.admin (
    username varchar(50),
    hash varchar(64)
);

-- Admin change table
CREATE TABLE IF NOT EXISTS public.admin_change (
    change integer NOT NULL,
    id integer,
    change_date timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admin_change_id_fkey FOREIGN KEY (id)
        REFERENCES public.account(id)
);

-- Product table
CREATE TABLE IF NOT EXISTS public.product (
    name varchar(50) UNIQUE NOT NULL,
    pricein integer CHECK (pricein >= 0),
    priceout integer CHECK (priceout >= 0),
    color text NOT NULL CHECK (
        color IN (
            'WHITE', 'BLUE', 'RED', 'BLACK',
            'YELLOW', 'REDBLUE', 'YELLOWBLACK', 'EMPTY'
        )
    )
);

-- Transaction table
CREATE TABLE IF NOT EXISTS public.transaction (
    product_name varchar(50),
    transaction_date timestamp DEFAULT CURRENT_TIMESTAMP,
    amount integer CHECK (amount >= 1),
    user_id integer,
    sum integer
);
