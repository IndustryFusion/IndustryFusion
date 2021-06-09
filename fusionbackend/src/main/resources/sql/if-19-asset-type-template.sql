alter table asset_type_template
    add published boolean default false;

alter table asset_type_template
    add published_date timestamp;