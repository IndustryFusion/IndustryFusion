ALTER TABLE field
    ADD data_type varchar(255);

ALTER TABLE field
    ALTER COLUMN unit_id DROP NOT NULL;

create table field_option
(
    id                       bigint         not null,
    version                  bigint,
    label                    varchar(255)   not null,
    field_id                 bigint         not null,
    primary key (id)
);

create sequence idgen_fieldoption start 1 increment 1;

ALTER TABLE field_source
    ALTER COLUMN source_unit_id DROP NOT NULL;