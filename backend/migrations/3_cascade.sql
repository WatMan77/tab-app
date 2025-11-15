-- Remove change records in case the account is deleted
ALTER TABLE admin_change
DROP CONSTRAINT admin_change_id_fkey,
ADD CONSTRAINT admin_change_id_fkey
FOREIGN KEY (id) REFERENCES account(id)
ON DELETE CASCADE;