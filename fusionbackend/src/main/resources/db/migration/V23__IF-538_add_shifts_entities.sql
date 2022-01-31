-- shift_settings
create sequence idgen_shift_settings start 1 increment 1;
alter sequence idgen_shift_settings owner to postgres;

create table shift_settings
(
    id bigint not null,
    version bigint,
    week_start varchar(255) not null,
    primary key (id)
);


-- shifts_of_day
create sequence idgen_shifts_of_day start 1 increment 1;
alter sequence idgen_shifts_of_day owner to postgres;

create table shifts_of_day
(
    id bigint not null,
    version bigint,
    day varchar(255) not null,
    is_active boolean not null,
    shift_settings_id bigint not null,
    primary key (id)
);

alter table shifts_of_day
    add constraint shift_settings_shift_settings_id_fkey
        foreign key (shift_settings_id) references shift_settings
            on delete cascade;


-- shift
create sequence idgen_shift start 1 increment 1;
alter sequence idgen_shift owner to postgres;

create table shift
(
    id bigint not null,
    version bigint,
    end_minutes bigint not null,
    name varchar(255) not null,
    start_minutes bigint not null,
    shifts_of_day_id bigint not null,
    primary key (id)
);

alter table shift
    add constraint shifts_of_day_shifts_of_day_id_fkey
        foreign key (shifts_of_day_id) references shifts_of_day
            on delete cascade;


-- factory_site
alter table factory_site
    add column shift_settings_id bigint;

alter table factory_site
    add constraint factory_site_shift_settings_id_key unique (shift_settings_id);

alter table factory_site
    add constraint shift_settings_shift_settings_id_fkey
        foreign key (shift_settings_id) references shift_settings
            on delete cascade;

