create table connectivity_protocol
(
    id                        bigint       not null,
    version                   bigint,
    connection_string_pattern varchar(255),
    name                      varchar(255) not null,
    primary key (id)
);
create table connectivity_type
(
    id        bigint       not null,
    version   bigint,
    info_text varchar(255) not null,
    name      varchar(255) not null,
    primary key (id)
);
create table connectivity_type_connectivity_protocol
(
    connectivity_type_id     bigint not null,
    connectivity_protocol_id bigint not null,
    primary key (connectivity_type_id, connectivity_protocol_id)
);

create sequence idgen_connectivity_protocol start 1 increment 1;
create sequence idgen_connectivitytype start 1 increment 1;

alter table connectivity_type_connectivity_protocol
    add constraint connectivity_protocol_id_fkey foreign key (connectivity_protocol_id) references connectivity_protocol;
alter table connectivity_type_connectivity_protocol
    add constraint connectivity_type_id_fkey foreign key (connectivity_type_id) references connectivity_type;





insert into connectivity_type (id, name, info_text)
values (nextval('idgen_connectivitytype'), 'Direct IO / SoftSPS', 'Sensors connected directly to the Gateway');
insert into connectivity_type (id, name, info_text)
values (nextval('idgen_connectivitytype'), 'Internal Machine Network',
        'Gateway is connected 1 to 1 to the Asset (e.g. PLC via Ethernet/Serial)');
insert into connectivity_type (id, name, info_text)
values (nextval('idgen_connectivitytype'), 'Network based (e.g. SQL, MQTT)',
        'Everything thats connected via the Network (SQL database, MQTT broker)');

insert into connectivity_protocol (id, name, connection_string_pattern)
values (nextval('idgen_connectivity_protocol'), 'MQTT', 'tcp://127.0.0.1:1883');
insert into connectivity_protocol (id, name, connection_string_pattern)
values (nextval('idgen_connectivity_protocol'), 'SQL', 'jdbc:sqlserver://127.0.0.1\SQLEXPRESS;database=TEST');
insert into connectivity_protocol (id, name, connection_string_pattern)
values (nextval('idgen_connectivity_protocol'), 'S7 (S7comm)', 's7://127.0.0.1');
insert into connectivity_protocol (id, name, connection_string_pattern)
values (nextval('idgen_connectivity_protocol'), 'LOGO! (S7comm)', 's7://127.0.0.1?controller-type=LOGO');
insert into connectivity_protocol (id, name, connection_string_pattern)
values (nextval('idgen_connectivity_protocol'), 'Beckhoff ADS', default);
insert into connectivity_protocol (id, name, connection_string_pattern)
values (nextval('idgen_connectivity_protocol'), 'OPC UA', 'opcua:tcp://127.0.0.1:12686?discovery=true');
insert into connectivity_protocol (id, name, connection_string_pattern)
values (nextval('idgen_connectivity_protocol'), 'Modbus TCP', 'modbus:tcp://127.0.0.1:502');
insert into connectivity_protocol (id, name, connection_string_pattern)
values (nextval('idgen_connectivity_protocol'), 'Ethernet/IP', default);
insert into connectivity_protocol (id, name, connection_string_pattern)
values (nextval('idgen_connectivity_protocol'), 'Modbus TCP (fest)', default);

insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Internal Machine Network'),
        (select id from connectivity_protocol where name = 'MQTT'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Internal Machine Network'),
        (select id from connectivity_protocol where name = 'SQL'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Internal Machine Network'),
        (select id from connectivity_protocol where name = 'S7 (S7comm)'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Internal Machine Network'),
        (select id from connectivity_protocol where name = 'LOGO! (S7comm)'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Internal Machine Network'),
        (select id from connectivity_protocol where name = 'Beckhoff ADS'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Internal Machine Network'),
        (select id from connectivity_protocol where name = 'OPC UA'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Internal Machine Network'),
        (select id from connectivity_protocol where name = 'Modbus TCP'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Internal Machine Network'),
        (select id from connectivity_protocol where name = 'Ethernet/IP'));

insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Network based (e.g. SQL, MQTT)'),
        (select id from connectivity_protocol where name = 'MQTT'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Network based (e.g. SQL, MQTT)'),
        (select id from connectivity_protocol where name = 'SQL'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Network based (e.g. SQL, MQTT)'),
        (select id from connectivity_protocol where name = 'S7 (S7comm)'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Network based (e.g. SQL, MQTT)'),
        (select id from connectivity_protocol where name = 'LOGO! (S7comm)'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Network based (e.g. SQL, MQTT)'),
        (select id from connectivity_protocol where name = 'Beckhoff ADS'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Network based (e.g. SQL, MQTT)'),
        (select id from connectivity_protocol where name = 'OPC UA'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Network based (e.g. SQL, MQTT)'),
        (select id from connectivity_protocol where name = 'Modbus TCP'));
insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Network based (e.g. SQL, MQTT)'),
        (select id from connectivity_protocol where name = 'Ethernet/IP'));

insert into connectivity_type_connectivity_protocol (connectivity_type_id, connectivity_protocol_id)
values ((select id from connectivity_type where name = 'Direct IO / SoftSPS'),
        (select id from connectivity_protocol where name = 'Modbus TCP (fest)'));