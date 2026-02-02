-- Migration: Add logo_toko column for store logo (base64 encoded)
-- Date: 2026-02-02
-- Description: Adds logo storage capability to konfigurasi table

-- Add logo_toko column (stores base64 encoded image)
ALTER TABLE konfigurasi ADD COLUMN logo_toko LONGTEXT DEFAULT NULL;

-- Verify column was added
SELECT COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'konfigurasi' AND COLUMN_NAME = 'logo_toko';
