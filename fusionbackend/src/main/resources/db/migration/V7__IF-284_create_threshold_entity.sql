-- create table threshold
create sequence idgen_threshold;

alter sequence idgen_threshold owner to postgres;

create table if not exists threshold
(
    id bigint not null
        constraint threshold_pkey
            primary key,
    version bigint,
    value_lower double precision,
    value_upper double precision
);

-- set 3 reference in field source
alter table field_source
    add absolute_threshold_id bigint;

alter table field_source
    add ideal_threshold_id bigint;

alter table field_source
    add critical_threshold_id bigint;

alter table field_source
    add constraint field_source_absolute_threshold_id_fkey
        foreign key (absolute_threshold_id) references threshold
            on delete cascade;

alter table field_source
    add constraint field_source_ideal_threshold_id_fkey
        foreign key (ideal_threshold_id) references threshold
            on delete cascade;

alter table field_source
    add constraint field_source_critical_threshold_id_fkey
        foreign key (critical_threshold_id) references threshold
            on delete cascade;


-- set 3 reference in field instance
alter table field_instance
    add absolute_threshold_id bigint;

alter table field_instance
    add ideal_threshold_id bigint;

alter table field_instance
    add critical_threshold_id bigint;

alter table field_instance
    add constraint field_instance_absolute_threshold_id_fkey
        foreign key (absolute_threshold_id) references threshold
            on delete cascade;

alter table field_instance
    add constraint field_instance_ideal_threshold_id_fkey
        foreign key (ideal_threshold_id) references threshold
            on delete cascade;

alter table field_instance
    add constraint field_instance_critical_threshold_id_fkey
        foreign key (critical_threshold_id) references threshold
            on delete cascade;
