--sql commands here

-- to show the time in Finnish time, do this
-- transaction_date AT TIME ZONE 'UTC' AS utc_transaction_date

SET timezone = 'Europe/Helsinki'; --make sure time is the same as in Finland

--
-- PostgreSQL database dump
--


-- Dumped from database version 18.0 (Debian 18.0-1.pgdg13+3)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: color_enum; Type: TYPE; Schema: public; Owner: postgres
--

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


ALTER TYPE public.color_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.account (
    username character varying(50) NOT NULL UNIQUE,
    category character varying(50),
    balance integer DEFAULT 0,
    closed boolean DEFAULT false,
    id serial PRIMARY KEY,
    pincode character varying(255),
    unlocked_until timestamp with time zone,
    CONSTRAINT account_category_check CHECK (((category)::text = ANY ((ARRAY['ASUKAS'::character varying, 'VANHA'::character varying, 'HANGAROUND'::character varying])::text[])))
);


ALTER TABLE public.account OWNER TO postgres;


ALTER SEQUENCE public.account_id_seq OWNER TO postgres;


--
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.admin (
    username character varying(50),
    hash character varying(64)
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- Name: admin_change; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.admin_change (
    change integer NOT NULL,
    id integer REFERENCES public.account(id),
    change_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_change OWNER TO postgres;

--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.product (
    name character varying(50) NOT NULL UNIQUE,
    pricein integer,
    priceout integer,
    color text NOT NULL,
    CONSTRAINT product_color_check CHECK ((color = ANY (ARRAY['WHITE'::text, 'BLUE'::text, 'RED'::text, 'BLACK'::text, 'YELLOW'::text, 'REDBLUE'::text, 'YELLOWBLACK'::text, 'EMPTY'::text]))),
    CONSTRAINT product_pricein_check CHECK ((pricein >= 0)),
    CONSTRAINT product_priceout_check CHECK ((priceout >= 0))
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.transaction (
    product_name character varying(50),
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    amount integer,
    user_id integer,
    sum integer,
    CONSTRAINT transaction_amount_check CHECK ((amount >= 1))
);


ALTER TABLE public.transaction OWNER TO postgres;


--
-- PostgreSQL database dump complete
--
