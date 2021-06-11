alter table asset_type_template
    add published_date timestamp;

alter table asset_type_template
    add draft_version bigint not null default 1;

alter table asset_type_template
    alter column draft_version drop default;