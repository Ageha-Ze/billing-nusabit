-- Script to update existing cash_flow transactions with bank_account_id
-- This script assigns the first available bank account to all existing cash_flow transactions
-- that don't have bank_account_id set

-- First, get the first bank account ID (you can modify this to use a specific account)
DO $$
DECLARE
    default_bank_account_id UUID;
BEGIN
    -- Get the first active bank account
    SELECT id INTO default_bank_account_id
    FROM bank_accounts
    WHERE is_active = true
    ORDER BY created_at ASC
    LIMIT 1;

    -- If we found a bank account, update all cash_flow transactions without bank_account_id
    IF default_bank_account_id IS NOT NULL THEN
        UPDATE cash_flow
        SET bank_account_id = default_bank_account_id
        WHERE bank_account_id IS NULL;

        RAISE NOTICE 'Updated cash_flow transactions to use bank account: %', default_bank_account_id;
    ELSE
        RAISE NOTICE 'No active bank accounts found. Please create a bank account first.';
    END IF;
END $$;