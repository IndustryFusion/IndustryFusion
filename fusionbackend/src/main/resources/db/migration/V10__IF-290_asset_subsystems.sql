alter table asset
    add column subsystem_parent_id bigint;
alter table asset
    add constraint asset_id_fkey foreign key (subsystem_parent_id) references asset;