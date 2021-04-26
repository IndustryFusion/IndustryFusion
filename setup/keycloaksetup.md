# Keycloak setup instructions

Keycloak is an open-source authentification software from JBoss enabling single-sign-on.

## Install / start keycloak
    
Use docker for quickstart. Run existing container with `docker start keycloak`. For first use, use this command:

```
docker run -d -p 8081:8080 --name keycloak -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin quay.io/keycloak/keycloak:10.0.2
```

Open the KC Admin GUI at http://localhost:8081/auth/


## Keycloak theme
The Theme https://github.com/mattmikulina/IndustryFusion-private-/tree/master/fusionkeycloaktheme should be copied to the running keycloak instance under keycloak/themes.

Instructions for adding the keycloak theme in docker:
1. clone repo, switch to "fusionkeycloaktheme" folder (or use DownGit and switch to "Downloads")
2. `docker cp fusion/ keycloak:/opt/jboss/keycloak/themes/`
3. Check if the folder was copied correctly to docker directory:
   
```
docker exec -it keycloak bash
cd /opt/jboss/keycloak/themes/
ls
```

## Keycloak configuration

Follow the instruction below but substitute local URLS for
   https://platform.industry-fusion.com/fusionfrontend with http://localhost:4200!
Do this to add an OISP realm with 2 clients and a concrete user that will be used to access the IF application:

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
    1. Change to tab "Credentials"
    	1. copy content of "Secret"
    	1. open fusionbackend/src/main/resources/application.yaml -> Substitute secret in path  keycloak.credentials.secret
    1. Change to tab "Roles" and add the following roles:
        1. ECOSYSTEM_MANAGER
        1. FACTORY_MANAGER
        1. FLEET_MANAGER
1. Create a new user and click save
    1. Change to tab "Attributes" and add attribute IF_COMPANY = 2, click save
    1. Change to tab "Credentials" and set a password
    1. Change to tab "Role Mappings" and assign under client roles one (or more) of the above roles of "fusion-backend"
    1. Assign the role "user" of "oisp-frontend"  (not necessary for quick setup)
