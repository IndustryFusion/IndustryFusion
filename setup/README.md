<!--
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
-->

#Set-Up Guide for local Development Environment for IndustryFusion
This guide is intended to be used by developer to set up a local development environment, mostly based on Intellj IDEA and Docker. 


# Setup Development Environment
## Prerequisites
Software needed to be installed on your system:
1. Git Client: version >= 2.31.1
1. Docker (or other Container-Runtime). Docker: version >=19.03.12 
1. OpenJDK: version >= 11.0.10
   1. Think about using [SDKMAN!](https://sdkman.io/)
1. PostgreSQL-Client choose by your own. E.g.:
   1. Preferred: Intellij integrated Data-Grid
   1. Alternative: [pgadmin4](https://www.pgadmin.org/download/)
1. Intellij Ultimate Edition: version >= 2021.1.1


## Prepare Infrastructure: Database and Authentication

### Database: Postgresql
ToDo (fkn): Es existiert eine docker-compose-Datei mit anderer Image-Konfiguration. Klären! Was ist in der Produktion?

#### Run Docker Container

for the initial start use this:
```
docker run -d --name postgres-104 -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgresdb postgres:10.4
```

for the second time use:
```
 docker start postgres-104
```

### Authentication: Keycloak 
- ToDo (fkn): Auch über docker-compose abbilden.
- ToDo (fkn): Es gibt auch die Möglichkeit die Initialisierung gleich beim Container-Start zu machen. Siehe https://github.com/keycloak/keycloak-containers/blob/12.0.4/server/README.md

Do the steps based on the [keycloak setup instructions](keycloaksetup.md)


## Checkout IndustryFusion application

The project is [hosted on GitHub](https://github.com/IndustryFusion/IndustryFusion).

1. Thus clone from there:  
   ```git clone https://github.com/IndustryFusion/IndustryFusion.git```
1. Switch to branch `develop`

## Open project in Intellij
1. Choose menu "File > New > Project from Existing Sources..."
1. Select POM File of the root folder (IndustryFusion/pom.xml) and click "OK"
1. Run `mvn install` from terminal or the Maven tool window within the fusionfrontend module to automatically install node, yarn and the node modules to the "target" folder.

ToDo (fkn): Build schlägt aktuell beim fusion-aggregator fehl

## Configure Intellij 

1. Choose menu "File > Project Structure...". Assure that your local java 11 sdk is selected below "Project Settings > Project > Project SDK"

### fusionbackend (Spring Boot)

1. Check Run Configurations: There must be already Spring Boot configuration called "FusionbackendApplication". 
1. Add "dev" to the section "Active profiles"    
Example: 
   ![Run Configuration Backend](images/Intellij_run_configuration_backend.png)
1. Copy `application.yaml` to `application-dev.yaml` and change the values of the following keys:
    1. `keycloak.credentials.secret`: Set it to the secret value, which has been generated during the keycloak set up.

#### Import Sample Data
1. Change temporary the setting `spring.jpa.hibernate.ddl-auto` in the `application-dev.yaml` from 'validate' to 'create'.
1. Start the fusionbackend run configuration. This creates the database schema
1. Import sample data by using the file [demoinserts.sql (located on internal SharePoint)](https://iteratec.sharepoint.com/sites/m365_industryfusion_foundation/Freigegebene%20Dokumente/Entwicklung/demoinserts.sql).
1. Stop the fusionbackend run configuration.
1. Change back the setting `spring.jpa.hibernate.ddl-auto` in the `application-dev.yaml` from 'create' to 'validate'.


### fusionfrontend (npm)
1. Assure there is a npm run configuration for the fusionfrontend.  
1. Edit "Node Interpreter" and "Package manager" to correct path, see example below, within your target folder in the fusionfrontend module. Example:
   ![Run Configuration Frontend](images/Intellij_run_configuration_frontend.png)   
1. Copy attachment of LastPass note "Shared-IndustryFusion > Frontend environment.dev.ts" to `fusionfrontend/src/environments/environment.dev.ts`. Do not forget to rename it correctly!

Todo (fkn): Besser nicht die ganze Datei, sondern nur die einzelnen Keys in LastPass ablegen

### Install Plugins
1. Choose menu "File > Settings..."
1. Change to tab "Plugins" and ensure installation of 
    1. Lombok (installed by default)
    1. PMD-IDEA
    1. CheckStyle-IDEA: Add configuration file:
       1. change to settings-tab "Tools"  →  Checkstyle  → Checkstyle Version = `8.27` 
       1. configuration file  → Add  → Description = "Industry Fusion Checks"  → use a local checkstyle file: `./fusionparent/src/site/fusion_google_checks.xml` → Next
       1. checkstyle.header.file = `license.txt`   → Finish  → set as active rule: click at checkbox on the left
    

### Start Full Stack
1. Assure docker containers for keycloak and postgres database are running
1. Start fusionbackend via its run configuration.
1. Start fusionfrontend via its run configuration. 

--> Your are set up! Happy Coding :-)


# Optional: Import Postman collection
ToDo (fkn): Für was werden/wurden die Postman-Collections verwendet?

[Get Postman!](https://www.getpostman.com/)

Download and import [fusion.postman_collection.json](https://github.com/IndustryFusion/IndustryFusion/tree/master/setup/fusion.postman_collection.json), copy content manually if not working.

# Using Kubernetes (K8S / K3S)

ToDo (fkn): Update für dieses Kapitel notwendig und auslagern in eigene MD-Datei

### Create linux host if running on Windows or Mac
This step is only necessary if running on Windows or Mac. If on linux skip to next step.

#### Get multipass
Install multipass from https://multipass.run/

#### Create linux host
Execute the following on the command line: `multipass launch --name k3s-master --cpus 2 --mem 2048M --disk 10G`

#### Setup linux host
1. Login to the newly created host with `multipass shell k3s-master`
3. Install k3s `curl -sfL https://get.k3s.io | sh -`

### Install postgres onto cluster
If on linux, execute the following on the local host.
If on Windows, this should be executed from within k3s-master

```
git clone https://github.com/IndustryFusion/IndustryFusion.git
cd IndustryFusion-private-/setup/kubernetes
sudo kubectl apply -f postgres.yaml
```

### Get and set up the fusion application
This should be done from the local host (on linux and windows)
```
# Checkout fusionapplication if not done in last step
git clone https://github.com/IndustryFusion/IndustryFusion.git
# This should only be necessary on linux
cd IndustryFusion-private-/fusionbackend/src/main/resources
vi application.yaml
# Change k3s-master.mshome.net to localhost
# spring:
#   datasource:
#     url: jdbc:postgresql://<k3s-master.mshome.net>:5432/postgresdb
```