-- =====================================================
-- TiDB Cloud Migration: Add Customer Fields
-- Run these queries ONE BY ONE (separately)
-- =====================================================

-- Step 1: Add catatan column
ALTER TABLE customer ADD COLUMN catatan TEXT;

-- Step 2: After Step 1 succeeds, run this
ALTER TABLE customer ADD COLUMN tag VARCHAR(50);

-- Step 3: Verify columns were added
DESCRIBE customer;

-- You should see:
-- id, nama, no_hp, alamat, email, catatan, tag, created_at, updated_at
