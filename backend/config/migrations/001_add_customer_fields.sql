-- =====================================================
-- Database Migration Script
-- Add catatan and tag columns to customer table
-- Run date: 2026-01-29
-- =====================================================

USE kasir_puas;

-- Add catatan column (for customer notes)
ALTER TABLE customer 
ADD COLUMN catatan TEXT AFTER email;

-- Add tag column (for customer labels like VIP, Reseller, etc)
ALTER TABLE customer 
ADD COLUMN tag VARCHAR(50) AFTER catatan;

-- Verify columns were added
DESCRIBE customer;

SELECT 'Migration completed successfully!' as status;
