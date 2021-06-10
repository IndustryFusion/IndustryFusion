alter table asset_type_template
    add published boolean default false;

alter table asset_type_template
    add published_date timestamp;

alter table asset_type_template
    add draft_version bigint default 1;