alter table asset_type_template
    add column subsystem_parent_id bigint;

alter table asset_type_template
    add constraint asset_type_template_subsystem_parent_id_fkey
        foreign key (subsystem_parent_id) references asset_type_template;