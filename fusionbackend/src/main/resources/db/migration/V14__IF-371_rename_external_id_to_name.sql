alter table asset
    rename column external_id to external_name;

alter table field_instance
    rename column external_id to external_name;
