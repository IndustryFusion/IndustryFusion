ALTER TABLE field
    ADD creation_date timestamp;
ALTER TABLE asset_type_template
    ADD creation_date timestamp;
ALTER TABLE unit
    RENAME COLUMN created_date TO creation_date;