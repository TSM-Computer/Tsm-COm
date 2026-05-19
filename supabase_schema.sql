-- 1. ตารางเก็บรายการค่าน้ำมัน
create table fuel_entries (
  id uuid primary key default uuid_generate_v4(),
  date timestamp with time zone not null,
  amount decimal not null,
  trip_type text check (trip_type in ('daily', 'round-trip')),
  trips int,
  note text,
  created_at timestamp with time zone default now()
);

-- 2. ตารางเก็บข้อมูลผู้ใช้งาน
create table users (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  password text not null,
  name text,
  role text check (role in ('admin', 'user')),
  email text,
  created_at timestamp with time zone default now()
);

-- เพิ่มแอดมินเริ่มต้น
insert into users (username, password, name, role, email)
values ('admin', 'admin', 'ผู้ดูแลระบบ', 'admin', 'admin@tracker.com');
