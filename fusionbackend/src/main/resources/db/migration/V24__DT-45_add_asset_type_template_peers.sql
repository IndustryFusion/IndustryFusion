create sequence idgen_assettypetemplatepeer;

create table asset_type_template_peer
(
    id bigint not null default nextval('idgen_assettypetemplatepeer')
        constraint asset_type_template_peer_pkey
            primary key,
    version bigint,
    asset_type_template_id bigint not null,
    peer_id bigint not null,
    custom_name varchar(255),
    cardinality varchar(255),
    mandatory boolean
);

alter sequence idgen_assettypetemplatepeer owned by asset_type_template_peer.id;

alter table asset_type_template_peer owner to postgres;

alter table asset_type_template_peer
    add constraint asset_type_template_peer_asset_type_template_id_fkey
        foreign key (asset_type_template_id) references asset_type_template;

alter table asset_type_template_peer
    add constraint asset_type_template_peer_peer_id_fkey
        foreign key (peer_id) references asset_type_template;