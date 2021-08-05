alter table asset_series
    add column connectivity_settings_id bigint;
alter table asset_series
    add constraint UK_su1a43xou98sno10yyaxdc2ce unique (connectivity_settings_id);

create table connectivity_settings
(
    id                       bigint         not null,
    version                  bigint,
    connection_string        varchar(255) not null,
    connectivity_protocol_id bigint         not null,
    connectivity_type_id     bigint         not null,
    primary key (id)
);

alter table asset_series
    add constraint asset_series_connectivity_settings_id_fkey foreign key (connectivity_settings_id) references connectivity_settings;
alter table connectivity_settings
    add constraint connectivity_settings_connectivity_protocol_id_fkey foreign key (connectivity_protocol_id) references connectivity_protocol;
alter table connectivity_settings
    add constraint connectivity_settings_connectivity_type_id_fkey foreign key (connectivity_type_id) references connectivity_type;

create sequence idgen_connectivity_settings start 1 increment 1;
