create sequence idgen_country;

alter sequence idgen_country owner to postgres;

create table if not exists country
(
    id bigint not null
        constraint country_pkey
            primary key,
    version bigint,
    name varchar(255) not null
);

alter table factory_site
    drop column country;

alter table factory_site
    add country_id bigint not null;

alter table factory_site
    add constraint factory_site_country__fk
        foreign key (country_id) references country (id);
