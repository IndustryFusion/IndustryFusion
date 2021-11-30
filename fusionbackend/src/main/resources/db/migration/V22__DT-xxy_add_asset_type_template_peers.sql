create sequence idgen_assettypetemplatepeers;

create table asset_type_template_peers
(
    id bigint not null default nextval('idgen_assettypetemplatepeers')
        constraint asset_type_template_peers_pkey
            primary key,
    asset_type_template_id bigint not null,
    peer_id bigint not null
);

alter sequence idgen_assettypetemplatepeers owned by asset_type_template_peers.id;

alter table asset_type_template_peers
    add constraint asset_type_template_peers_peer_id_fkey
        foreign key (peer_id) references asset_type_template;

alter table asset_type_template_peers
    add constraint asset_type_template_peers_asset_type_template_id_fkey
        foreign key (asset_type_template_id) references asset_type_template;