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

-- company
insert into company (id, version, description, image_key, name, type) values (nextval('idgen_company'), 0, 'Example ECOSYSTEM_MANAGER', 'example.jpg', 'Example ECOSYSTEM_MANAGER', 'ECOSYSTEM_MANAGER');
insert into company (id, version, description, image_key, name, type) values (nextval('idgen_company'), 0, 'Example MACHINE_CUSTOMER', 'example.jpg', 'Example MACHINE_CUSTOMER', 'MACHINE_CUSTOMER');
insert into company (id, version, description, image_key, name, type) values (nextval('idgen_company'), 0, 'Example MACHINE_MANUFACTURER', 'example.jpg', 'Example MACHINE_MANUFACTURER', 'MACHINE_MANUFACTURER');

-- location
insert into location (id, version, city, country, image_key, latitude, line1, line2, longitude, name, type, zip, company_id) values (nextval('idgen_location'), 0, 'Munich', 'Germany', 'example.jpg', 48.137440, 'Marienplatz 1', '', 11.574710, 'ExampleLocation', 'HEADQUARTER', '80331', 2);

-- room
insert into room (id, version, image_key, name, description, location_id) values (nextval('idgen_room'), 0, null, 'Exampleroom', 'Exampleroom', 1);


-- quantity_type
insert into quantity_type (id, version, description, label, name, data_type) values (nextval('idgen_quantitytype'), 0, 'Example Quantity', 'examplequantity', 'Example Quantity', 1);

-- unit
insert into unit (id, version, description, label, name, symbol, quantity_type_id) values (nextval('idgen_unit'), 0, 'Example Unit: Seconds', 'seconds', 'Example Unit: Seconds', 's', 1);

-- quantity_type.base_unit_id
update quantity_type set base_unit_id = 1 where id = 1;

-- field
insert into field (id, version, accuracy, description, label, name, value, unit_id) values (nextval('idgen_field'), 0, 1, 'Example interval', 'example_interval', 'Example interval', null, 1);

-- asset_type
insert into asset_type (id, version, description, label, name) values (nextval('idgen_assettype'), 0, 'Example asset type', 'exampleassettype', 'Example asset type');

-- asset_type_template
insert into asset_type_template (id, version, description, image_key, name, asset_type_id) values (nextval('idgen_assettypetemplate'), 0, 'Example asset type template', '', 'Example asset type template', 1);

-- field_target
insert into field_target (id, version, field_type, label, mandatory, name, asset_type_template_id, field_id) values (nextval('idgen_fieldtarget'), 0, 1, 'Example field target', true, 'Example field target', 1, 1);
update field_target set description = name;

-- asset_series
insert into asset_series (id, version, description, image_key, name, ce_certified, handbook_key, protection_class, video_key, asset_type_template_id, company_id) values (nextval('idgen_assetseries'), 0, 'Example asset series', 'example.jpg', 'Example asset series', true, '', '1', '', 1, 3);

-- field_source
insert into field_source (id, version, description, name, source_sensor_label, value, asset_series_id, field_target_id, source_unit_id) values (nextval('idgen_fieldsource'), 0, 'Example field source', 'Example field source', 'example_field_source', null, 1, 1, 1);


-- asset
insert into asset (id, version, description, image_key, name, ce_certified, construction_date, control_system_type, external_id, gateway_connectivity, guid, handbook_key, has_gateway, installation_date, protection_class, serial_number, video_key, asset_series_id, company_id, room_id) values (nextval('idgen_asset'), 0, 'Example asset', 'example.jpg', 'Example asset', true, '2021-01-01 00:00:00.000000', 'PLC', 'PUT_OISP_ID_HERE', 'S7com', '0000000-0000-0000-0000-0000000000', null, true, '2021-01-01 00:00:00.000000', '1', '1234', null, 1, 2, 1);

-- field_instance
insert into field_instance (id, version, description, external_id, name, source_sensor_label, value, asset_id, field_source_id) values (nextval('idgen_fieldinstance'), 0, 'Example: Asset status', 'status', 'Example: Asset status', null, null, 1, 1);
