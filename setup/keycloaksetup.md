# Keycloak setup instructions

Keycloak is an open-source authentification software from JBoss enabling single-sign-on.

## Install / start keycloak
    
Use docker for quickstart. Run existing container with `docker start keycloak`. For first use, use this command:

```
docker run -d -p 8081:8080 --name keycloak \
-e KEYCLOAK_USER=admin \
-e KEYCLOAK_PASSWORD=admin \
-e JAVA_OPTS_APPEND="-Dkeycloak.profile.feature.upload_scripts=enabled" \
jboss/keycloak:12.0.0
```

**Hint**: The above environment variable JAVA_OPTS_APPEND, and its value, is only necessary if the realm should later be uploaded as a JSON file via the admin gui or by the docker run command with `-e KEYCLOAK_IMPORT`. See the [docker image documentation](https://hub.docker.com/r/jboss/keycloak). 


Open the keycloak Admin GUI at http://localhost:8081/auth/


## Keycloak theme
- ToDo (fkn): Das untenstehende Kopieren könnte vermutlich über einen Container-Mount und in Docker-Compose vereinfacht werden oder ein eigenes Dockerfile inkl. Realm-Import.

The [fusion keycloak theme](https://github.com/IndustryFusion/IndustryFusion/tree/develop/fusionkeycloaktheme) must be copied to the running keycloak instance under keycloak/themes.

Instructions for copying the keycloak theme in docker:
1. clone repo, switch to "fusionkeycloaktheme" folder (or use DownGit and switch to "Downloads")
2. `docker cp fusion/ keycloak:/opt/jboss/keycloak/themes/`
3. Check if the folder was copied correctly to docker directory:
    ```
    docker exec -it keycloak bash
    cd /opt/jboss/keycloak/themes/
    ls
    ```

## Keycloak configuration

### Create Realm

You will add an OISP realm with 2 clients and a concrete user that will be used to access the IF application and the object storage.

#### Option 1: Create Realm for local Development and based on Import Realm File
1. Click on the Master realm dropdown and click Add Realm.
1. Click _Select file_ in the import section.
1. Choose [fusion.oisp_realm_local.json](fusion.oisp_realm_local.json) from the sources.
1. Click _Create_

#### Option 2: Create Realm by Admin GUI

Follow the instruction below but substitute local URLS for
_https://platform.industry-fusion.com/fusionfrontend_ with _http://localhost:4200_.


1. Click on the Master realm dropdown and click Add Realm
1. Add Realm with name OISP and enable it
1. Create Client from sidebar with name "fusion-frontend"
    1. Change to tab "Settings", set the following values for the fields and click "Save"
        1. Login Theme: fusion
        1. Direct Access Grants: OFF
        1. Root URL, Base URL: https://platform.industry-fusion.com/fusionfrontend
        1. Add to "Web Origins": https://platform.industry-fusion.com/fusionfrontend
        1. Add to "Valid Redirect URIs": https://platform.industry-fusion.com/fusionfrontend/*
        1. Access Type: Public
    1. Change to tab "Mappers", click "Create", set the following values for the fields and click "Save"
        1. Name: IF_COMPANY
        1. Mapper Type: User Attribute
        1. User Attribute: IF_COMPANY
        1. Token Claim Name: IF_COMPANY
        1. Claim JSON Type: long
        1. Otherwise defaults
1. Go back to client and create Client with name "fusion-backend"
    1. Change to tab "Settings", set the following values for the fields and click "Save"
        1. Access Type: Confidential
        1. Standard Flow Enabled: OFF
        1. Direct Access Grants: OFF
        1. Service Accounts Enabled: ON
        1. Authorization Enabled: ON
    1. Change to tab "Roles" and add the following roles:
        1. ECOSYSTEM_MANAGER
        1. FACTORY_MANAGER
        1. FLEET_MANAGER

### Handle Backend Secret
1. Go to client with name "fusion-backend"
1. Change to tab "Credentials"
   1. If the secret contains only `*********`: Click _Regenerate Secret_.
   1. This secret is needed for the configuration of fusionbackend (see README -> Configure Intellij). 

### Create Access User
1. Within the OISP-Realm, create a new user 'if-admin' and click save
    1. add an existing e-mail address, click save
    1. Change to tab "Attributes"
        1. add attribute IF_COMPANY = 2
        1. add attributes S3_API_KEY and S3_SECRET_KEY with values corresponding to your S3 compatible object storage server/user credentials
        1. click save
    1. Change to tab "Credentials" and set a password
    1. Change to tab "Role Mappings" and assign under client roles one (or more) of the above roles of "fusion-backend"
    1. Optional: Assign the role "user" of "oisp-frontend"  (not necessary for quick setup)

### Adjust Admin User
1. Switch to Master-Realm
1. edit the _admin_ user.
1. Add an existing e-mail address.

## Development-Cluster
Within the Kubernetes development cluster, an additional OAuth client is configured. This configuration is exported to the file [keycloak-client_fusion-frontend-development.json](keycloak-client_fusion-frontend-development.json) and can be used for a reconfiguration or new setup of other clusters. 