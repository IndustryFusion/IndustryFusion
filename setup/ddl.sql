-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--   http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing,
-- software distributed under the License is distributed on an
-- "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
-- KIND, either express or implied.  See the License for the
-- specific language governing permissions and limitations
-- under the License.

create table asset_type
(
	id bigint not null
		constraint asset_type_pkey
			primary key,
	version bigint,
	description varchar(255),
	label varchar(255),
	name varchar(255)
);

alter table asset_type owner to postgres;

create table asset_type_template
(
	id bigint not null
		constraint asset_type_template_pkey
			primary key,
	version bigint,
	description varchar(255),
	image_key varchar(255),
	name varchar(255),
	asset_type_id bigint not null
		constraint fkcuj750rytsh6sv7sh4d5b9t2e
			references asset_type
);

alter table asset_type_template owner to postgres;

create table company
(
	id bigint not null
		constraint company_pkey
			primary key,
	version bigint,
	description varchar(255),
	image_key varchar(255),
	name varchar(255),
	type varchar(255) not null
);

alter table company owner to postgres;

create table asset_series
(
	id bigint not null
		constraint asset_series_pkey
			primary key,
	version bigint,
	description varchar(255),
	image_key varchar(255),
	name varchar(255),
	ce_certified boolean,
	handbook_key varchar(255),
	protection_class varchar(255),
	video_key varchar(255),
	asset_type_template_id bigint not null
		constraint fkj0662el86i6rsuj1gyhgsq55r
			references asset_type_template,
	company_id bigint not null
		constraint fktfuf4avwd4enyq6nu865lcouw
			references company
);

alter table asset_series owner to postgres;

create table location
(
	id bigint not null
		constraint location_pkey
			primary key,
	version bigint,
	city varchar(255),
	country varchar(255),
	image_key varchar(255),
	latitude double precision,
	line1 varchar(255),
	line2 varchar(255),
	longitude double precision,
	name varchar(255),
	type varchar(255) not null,
	zip varchar(255),
	company_id bigint not null
		constraint fkbxoiqd2lmvk7c3r3qhfoou2py
			references company
);

alter table location owner to postgres;

create table quantity_type
(
	id bigint not null
		constraint quantity_type_pkey
			primary key,
	version bigint,
	data_type integer,
	description varchar(255),
	label varchar(255),
	name varchar(255),
	base_unit_id bigint
);

alter table quantity_type owner to postgres;

create table room
(
	id bigint not null
		constraint room_pkey
			primary key,
	version bigint,
	description varchar(255),
	image_key varchar(255),
	name varchar(255),
	location_id bigint not null
		constraint fkrqejnp96gs9ldf7o6fciylxkt
			references location
);

alter table room owner to postgres;

create table asset
(
	id bigint not null
		constraint asset_pkey
			primary key,
	version bigint,
	description varchar(255),
	image_key varchar(255),
	name varchar(255),
	ce_certified boolean,
	construction_date timestamp,
	control_system_type varchar(255),
	external_id varchar(255),
	gateway_connectivity varchar(255),
	guid uuid,
	handbook_key varchar(255),
	has_gateway boolean,
	installation_date timestamp,
	protection_class varchar(255),
	serial_number varchar(255),
	video_key varchar(255),
	asset_series_id bigint not null
		constraint fkkmi7kne0t0s5t27pemap8r0so
			references asset_series,
	company_id bigint not null
		constraint fkbnbckrvy4gleqsugkauihx7d7
			references company,
	room_id bigint
		constraint fk3wluo9ljton4rckdhy9sxpdaq
			references room
);

alter table asset owner to postgres;

create table unit
(
	id bigint not null
		constraint unit_pkey
			primary key,
	version bigint,
	description varchar(255),
	label varchar(255),
	name varchar(255),
	symbol varchar(255),
	quantity_type_id bigint not null
		constraint fko23fbuf0a3mcqkp319x0203g4
			references quantity_type
);

alter table unit owner to postgres;

create table field
(
	id bigint not null
		constraint field_pkey
			primary key,
	version bigint,
	accuracy double precision,
	description varchar(255),
	label varchar(255),
	name varchar(255),
	value varchar(255),
	unit_id bigint not null
		constraint fksfkfrjdueu5ba66jt8hpfvblw
			references unit
);

alter table field owner to postgres;

create table field_target
(
	id bigint not null
		constraint field_target_pkey
			primary key,
	version bigint,
	description varchar(255),
	field_type integer,
	label varchar(255),
	mandatory boolean,
	name varchar(255),
	asset_type_template_id bigint not null
		constraint fkbpshasam5bt5m6h3l08irkcmi
			references asset_type_template,
	field_id bigint not null
		constraint fka1q3val56h7ghoa2i3jxnaqmq
			references field
);

alter table field_target owner to postgres;

create table field_source
(
	id bigint not null
		constraint field_source_pkey
			primary key,
	version bigint,
	description varchar(255),
	name varchar(255),
	source_sensor_label varchar(255),
	value varchar(255),
	asset_series_id bigint not null
		constraint fk59s4o5b3ffvyly5oh7kpyc8gw
			references asset_series,
	field_target_id bigint not null
		constraint fk12io6hmgtqjus1wjipiewchto
			references field_target,
	source_unit_id bigint not null
		constraint fkr6kqwnn5yptngyekdgxi4ysdx
			references unit
);

alter table field_source owner to postgres;

create table field_instance
(
	id bigint not null
		constraint field_instance_pkey
			primary key,
	version bigint,
	description varchar(255),
	external_id varchar(255),
	name varchar(255),
	source_sensor_label varchar(255),
	value varchar(255),
	asset_id bigint not null
		constraint fkfaaqwwm2mki6ost5djf6k4k3b
			references asset,
	field_source_id bigint not null
		constraint fkk8a405xgkkga8y3ioeeiyt7fl
			references field_source
);

alter table field_instance owner to postgres;

alter table quantity_type
	add constraint fksbddu8uv3c5ajhya8k7kws90v
		foreign key (base_unit_id) references unit;

create sequence idgen_asset;

alter sequence idgen_asset owner to postgres;

create sequence idgen_assetseries;

alter sequence idgen_assetseries owner to postgres;

create sequence idgen_assettype;

alter sequence idgen_assettype owner to postgres;

create sequence idgen_assettypetemplate;

alter sequence idgen_assettypetemplate owner to postgres;

create sequence idgen_company;

alter sequence idgen_company owner to postgres;

create sequence idgen_field;

alter sequence idgen_field owner to postgres;

create sequence idgen_fieldinstance;

alter sequence idgen_fieldinstance owner to postgres;

create sequence idgen_fieldsource;

alter sequence idgen_fieldsource owner to postgres;

create sequence idgen_fieldtarget;

alter sequence idgen_fieldtarget owner to postgres;

create sequence idgen_location;

alter sequence idgen_location owner to postgres;

create sequence idgen_quantitytype;

alter sequence idgen_quantitytype owner to postgres;

create sequence idgen_room;

alter sequence idgen_room owner to postgres;

create sequence idgen_unit;

alter sequence idgen_unit owner to postgres;
