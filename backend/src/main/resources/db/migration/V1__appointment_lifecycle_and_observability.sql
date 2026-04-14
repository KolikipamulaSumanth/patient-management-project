ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS status_note VARCHAR(1000);

ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS status_updated_by VARCHAR(255);

ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS status_updated_at DATETIME(6);
