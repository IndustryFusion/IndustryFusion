alter table asset_type_template
    alter column draft_version drop not null;

alter table asset_type_template
    rename column draft_version to published_version;