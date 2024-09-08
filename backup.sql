--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+1)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    username character varying(50) NOT NULL,
    category character varying(50),
    balance integer DEFAULT 0,
    closed boolean DEFAULT false,
    id integer NOT NULL,
    CONSTRAINT account_category_check CHECK (((category)::text = ANY ((ARRAY['ASUKAS'::character varying, 'VANHA'::character varying, 'HANGAROUND'::character varying])::text[])))
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_id_seq OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    username character varying(50),
    hash character varying(64)
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    name character varying(50) NOT NULL,
    pricein integer,
    priceout integer,
    color character varying(50) NOT NULL,
    CONSTRAINT product_color_check CHECK (((color)::text = ANY ((ARRAY['WHITE'::character varying, 'BLUE'::character varying, 'RED'::character varying, 'BLACK'::character varying, 'YELLOW'::character varying, 'REDBLUE'::character varying, 'YELLOWBLACK'::character varying])::text[]))),
    CONSTRAINT product_pricein_check CHECK ((pricein >= 0)),
    CONSTRAINT product_priceout_check CHECK ((priceout >= 0))
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction (
    username character varying(50),
    product_name character varying(50),
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    amount integer,
    CONSTRAINT transaction_amount_check CHECK ((amount >= 1))
);


ALTER TABLE public.transaction OWNER TO postgres;

--
-- Name: account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.account_id_seq'::regclass);


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (username, category, balance, closed, id) FROM stdin;
Jarmo	ASUKAS	900	f	17
Mikael	VANHA	9900	f	19
Kari	ASUKAS	-1100	f	18
\.


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (username, hash) FROM stdin;
admin	$2b$10$WyEEwY20dFLRrsnMzq6ZceDzLU3d7MsrSDktR52ntmCXpF9ignNPK
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2024-09-08 07:16:42.366347
1	create_basics	a768d936522ca6d311985c474c0d98cb367fad83	2024-09-08 10:16:42.37957
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (name, pricein, priceout, color) FROM stdin;
Kalja	100	200	WHITE
Lonkero	140	250	BLUE
Jaegermeister	240	300	RED
\.


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction (username, product_name, transaction_date, amount) FROM stdin;
\.


--
-- Name: account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.account_id_seq', 19, true);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: account account_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_username_key UNIQUE (username);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: product product_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_name_key UNIQUE (name);


--
-- PostgreSQL database dump complete
--

