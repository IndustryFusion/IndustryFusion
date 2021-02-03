# Keycloak setup instructions
1. The Theme https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionkeycloaktheme should be copied to the running keycloak instance under /opt/jboss/keycloak/themes/fusion
1. Add Realm with name OISP.
1. Create Client with name "fusion-frontend"
    1. Change to tab "Settings", set the following values for the fields and click "Save"
        1. Login Theme: fusion
        1. Direct Access Grants: OFF
        1. Root URL, Base URL: https://PUT-YOUR-OISP-URL-HERE.com/fusionfrontend
        1. Add to "Web Origins": https://PUT-YOUR-OISP-URL-HERE.com/fusionfrontend
        1. Add to "Valid Redirect URIs": https://PUT-YOUR-OISP-URL-HERE.com/fusionfrontend/*
        1. Access Type: Public
    1. Change to tab "Mappers", click "Create", set the following values for the fields and click "Save"
        1. Name: IF_COMPANY
        1. Mapper Type: User Attribute
        1. User Attribute: IF_COMPANY
        1. Token Claim Name: IF_COMPANY
        1. Claim JSON Type: long
        1. Otherwise defaults
1. Create Client with name "fusion-backend"
    1. Change to tab "Settings", set the following values for the fields and click "Save"
        1. Access Type: Confidential
        1. Standard Flow Enabled: OFF
        1. Direct Access Grants: OFF
        1. Service Accounts Enabled: ON
        1. Authorization Enabled: ON
    1. Change to tab "Credentials" and copy "Secret"
    1. Change to tab "Roles" and add the following roles:
        1. ECOSYSTEM_MANAGER
        1. FACTORY_MANAGER
        1. FLEET_MANAGER
1. Users
    1. Add Attribute IF_COMPANY = 2
    1. Assign one of the above roles of "fusion-backend"
    1. Assign the role "user" of of "oisp-frontend"
