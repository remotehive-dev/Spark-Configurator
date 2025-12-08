import 'dotenv/config'
import { Client } from 'pg'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  const sqls = [
    `create extension if not exists pgcrypto`,
    `create table if not exists public.users (
      id uuid default gen_random_uuid() primary key,
      username text unique not null,
      password text not null
    )`,
    `create table if not exists public.topics (
      id uuid default gen_random_uuid() primary key,
      name text unique not null,
      created_at timestamptz default now()
    )`,
    `create table if not exists public.students (
      id varchar primary key,
      name text not null,
      grade text,
      status text,
      board text,
      sap_eligible boolean default false,
      created_at timestamptz default now()
    )`,
    `create table if not exists public.curriculum_files (
      id uuid default gen_random_uuid() primary key,
      name text not null,
      grade text not null,
      topic text,
      url text not null,
      created_at timestamptz default now()
    )`,
    `create table if not exists public.customizations (
      id uuid default gen_random_uuid() primary key,
      student_id varchar not null,
      selected_topics jsonb not null,
      parent_topics jsonb not null,
      created_at timestamptz default now()
    )`,
  ]
  for (const q of sqls) {
    await client.query(q)
  }
  await client.end()
  console.log('Database initialized')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
