# TiDB Cloud Migration Guide

## How to Add catatan and tag columns to customer table

Since you're using **TiDB Cloud**, follow these steps:

### Step 1: Login to TiDB Cloud Console
1. Go to https://tidbcloud.com/
2. Login to your account
3. Navigate to your cluster

### Step 2: Open SQL Editor
1. Click on your cluster name
2. Click "SQL Editor" or "Chat2Query"
3. Or use "Connect" → Download CA cert and use MySQL client

### Step 3: Run Migration SQL

Copy and paste this SQL:

```sql
USE kasir_puas;

-- Add catatan column
ALTER TABLE customer 
ADD COLUMN catatan TEXT AFTER email;

-- Add tag column  
ALTER TABLE customer 
ADD COLUMN tag VARCHAR(50) AFTER catatan;

-- Verify
DESCRIBE customer;
```

### Step 4: Verify

You should see output like:
```
Field       Type         Null    Key
------------------------------------
id          INT          NO      PRI
nama        VARCHAR(100) NO
no_hp       VARCHAR(20)  YES
alamat      TEXT         YES
email       VARCHAR(100) YES
catatan     TEXT         YES      ← NEW
tag         VARCHAR(50)  YES      ← NEW
created_at  TIMESTAMP    YES
updated_at  TIMESTAMP    YES
```

---

## Alternative: Use MySQL Client

If you prefer command line:

```bash
# Connect to TiDB Cloud
mysql -h <your-tidb-host> -P 4000 -u <username> -p --ssl-mode=VERIFY_IDENTITY --ssl-ca=/path/to/ca.pem

# Run migration
USE kasir_puas;
ALTER TABLE customer ADD COLUMN catatan TEXT AFTER email;
ALTER TABLE customer ADD COLUMN tag VARCHAR(50) AFTER catatan;
```

---

## Temporary Workaround

**Good news:** Your API is now **backwards compatible**! 

The customer edit will work even without running migration yet:
- ✅ If columns exist → Save catatan & tag
- ✅ If columns don't exist → Skip catatan & tag, only save nama/no_hp/alamat/email

**However**, you won't be able to use catatan & tag features until migration is done.

---

## After Migration

Once migration is complete:
1. Refresh your application
2. Edit customer form will show catatan & tag fields
3. Data will be saved properly to database

No code changes needed - API automatically detects new columns! 🎉
