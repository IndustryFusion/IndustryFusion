ALTER TABLE asset
    ADD global_id varchar(255) unique;
ALTER TABLE field_instance
    ADD global_id varchar(255) unique;
ALTER TABLE asset_series
    ADD global_id varchar(255) unique;
ALTER TABLE field_source
    ADD global_id varchar(255) unique;

UPDATE asset SET global_id = company_id||'/'||id;
UPDATE field_instance SET global_id = id||'/'||COALESCE(name, '');
UPDATE asset_series SET global_id = company_id||'/'||id;
UPDATE field_source SET global_id = id||'/'||COALESCE(name, '');

alter table asset
    alter column global_id SET not null;
alter table field_instance
    alter column global_id SET not null;
alter table asset_series
    alter column global_id SET not null;
alter table field_source
    alter column global_id SET not null;