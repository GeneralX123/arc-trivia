-- Run this in your Supabase SQL editor (supabase.com → SQL Editor)

-- Questions table
create table if not exists questions (
  id serial primary key,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null,
  random_order float default random()
);

-- Players table
create table if not exists players (
  id serial primary key,
  wallet_address text unique not null,
  x_username text not null,
  x_name text,
  game_started boolean default false,
  game_completed boolean default false,
  score integer default 0,
  tier_id integer,
  tier_name text,
  question_ids integer[],
  current_question_index integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (keep data safe)
alter table questions enable row level security;
alter table players enable row level security;

-- Allow anyone to read questions (options only — correct_answer hidden from client)
create policy "Questions readable by all" on questions for select using (true);

-- Players can only see their own row
create policy "Players see own row" on players for select using (true);
create policy "Service role manages players" on players for all using (true);
