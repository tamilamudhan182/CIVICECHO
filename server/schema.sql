-- Users Table
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  username text NOT NULL,
  total_points integer DEFAULT 0,
  badge_level text DEFAULT 'Beginner',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Civic Issues Table
CREATE TABLE public.civic_issues (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  location text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'Pending',
  urgency text DEFAULT 'Low',
  sentiment text DEFAULT 'Neutral',
  priority_score integer DEFAULT 10,
  category text DEFAULT 'Other',
  evidence_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT civic_issues_pkey PRIMARY KEY (id),
  CONSTRAINT civic_issues_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

-- Wallet Transactions Table
CREATE TABLE public.wallet_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL, -- 'earn' or 'redeem'
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

-- Note: Ensure UUID extension is enabled if using uuid_generate_v4():
-- create extension if not exists "uuid-ossp";
