-- location -> factory site
alter table location rename to factory_site;
alter table factory_site rename constraint location_pkey to factory_site_pkey;
alter sequence idgen_location rename to idgen_factory_site;

-- room references
alter table room rename column location_id to factory_site_id;

alter table room drop constraint fkrqejnp96gs9ldf7o6fciylxkt;
alter table room
    add constraint room_factory_site_id_fkey
        foreign key (factory_site_id) references factory_site;
