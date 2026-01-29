# Database Migrations

This folder contains SQL migration scripts to update your database schema.

## How to Run Migrations

### Option 1: Using MySQL Command Line
```bash
cd backend/config/migrations
mysql -u root -p kasir_puas < 001_add_customer_fields.sql
```

### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open the migration file (001_add_customer_fields.sql)
4. Click "Execute" (⚡ lightning icon)

### Option 3: Copy-Paste
1. Open the migration file
2. Copy all SQL commands
3. Paste in your MySQL client (phpMyAdmin, HeidiSQL, etc.)
4. Execute

## Migration Order

Run migrations in numerical order:
- `001_add_customer_fields.sql` - Adds catatan and tag columns to customer table

## Verify Migration Success

After running, check if columns exist:
```sql
USE kasir_puas;
DESCRIBE customer;
```

You should see `catatan` (TEXT) and `tag` (VARCHAR) columns.
