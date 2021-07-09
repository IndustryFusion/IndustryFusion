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
