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
This guide is intended to use by developer to setup a local development environment, mostly based on Intellj IDEA and Docker. 

ToDo (fkn): Remove optional setup or move it to its own location/file  

#Optional: Additional setup for new Ubuntu

Note: You should always run 'apt(-get) update' first before installing a package.

```
sudo apt update           and/or         sudo apt-get update
```

## Docker

```
sudo apt-get install docker.io -y
```

Add current user to docker group to be able to run docker without admin permissions:

```
sudo gpasswd -a $USER docker
newgrp docker
```

Test: docker run hello-world,	docker ps -a,	        docker rm [container id]


## Git

```
sudo apt-get install git -y
```

## Npm, yarn

The package managers will be automatically installed within the next step. However, for manual installation do this:


```
sudo apt-get install npm -y
sudo npm install --global yarn
```
## OpenJDK 11 (LTS)

```
sudo apt install openjdk-11-jdk
```

# Setup Development Environment
## Prerequisites
Software needed to be installed on your system:
1. Git Client: version >= 2.31.1
1. Docker (or other Container-Runtime). Docker: version >=19.03.12 
1. OpenJDK: version >= 11.0.10
1. PostgreSQL-Client choose by your own. E.g.:
   1. Intellij integrated Data-Grid
   1. [pgadmin4](https://www.pgadmin.org/download/)


## 1. Checkout IndustryFusion application
Clone directory: `git clone https://github.com/IndustryFusion/IndustryFusion.git`

Pull testcontainer-image to be able to run tests with maven (dependency manager):

ToDo (fkn): Das untenstehende Container-Image wird von Testcontainers.org verwendet. Sollte aber automatisch gepulled werden. !?! 

```
docker pull testcontainersofficial/ryuk:0.3.0
```

Go in terminal to the maven project root folder (should be `IndustryFusion`). Run Maven to automatically install node, npm, yarn, angular-cli etc. 
during the build of the fusionfrontend Maven module:

ToDo (fkn): Build schlägt aktuell beim fusion-aggregator fehl


```
mvn install
```

## 2. Required Packages

ToDo (fkn): Wir sollten eine für alle funktionierende Beschreibung haben also OHNE Fallbacks! Das Kaptiel könnte eigentlich komplett 
enfallen

### Fallback: PrimeNG, PrimeIcons, Angular-DevKit

Should have been installed with "mvn install". If not, install it manually like this:

`yarn add primeng@9.1.3   or      npm install primeng –save`

`yarn add primeicons      or      npm install primeicons --save`

`yarn add @angular/cdk@9.1.3`

Check if Style files were added to angular.json at  project.architect.build.styles:   

 `"./node_modules/primeicons/primeicons.css", ".node_modules/primeng/resources/themes/nova-light/theme.css", ".node_modules/primeng/resources/primeng.min.css"`

### Fallback: Angular CLI

Necessary to run "ng serve" via terminal. Should have been installed with "mvn install". If not, do this and then restart console:

```
cd ./fusionfrontend	 
yarn install				   (or npm install)
yarn global add @angular/cli     	   (for ng serve)
npm link @angular/cli
```



## 3. Database and Authentication

### 3.1. Postgresql Database
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

#### Import Sample Data
Todo (fkn): Klären welche Datei nun richtig ist, es gibt im privaten Repo auch noch eine.

The file [demoinserts.sql (available only iteratec internal for security reasons)](https://iteratec.sharepoint.com/sites/m365_industryfusion_foundation/Freigegebene%20Dokumente/Entwicklung/demoinserts.sql) can be imported to provide some initial demo data. T

Hint: In pgAdmin4 you can use "Query Tool".


### 3.2. Keycloak Authentication
ToDo (fkn): Auch über docker-compose abbilden.

ToDo (fkn): Es gibt auch die Möglichkeit die Initialisierung gleich beim Container-Start zu machen. Siehe https://github.com/keycloak/keycloak-containers/blob/12.0.4/server/README.md

Do the steps based on the [keycloak setup description](keycloaksetup.md)


## 4. IDE
ToDo (fkn): Wie wurde das Intellij-Projekt erstellt/importiert/konfiguriert? 

### 4.1. Recommendation: IntelliJ IDEA (Ultimate Edition)

Install IntelliJ IDEA (Ultimate Edition, Community Edition also possible for fusionbackend).

#### fusionbackend (Spring Boot)

1. Open subfolder /fusionbackend
1. Open main file at src/main/&ava/io/fusion/fusionbackend/FusionbackendApplication.java
1. Setup SDK (top right) → add...  →  /usr/lib/jvm/java-11-openjdk-amd64
1. Ensure that container of keycloak and postgres are running (docker ps -a), then run backend

#### fusionfrontend (Angular + Jetti)

1. Open file fusionfrontend/package.json
2. Click the run button on the left of "start": "ng serve"
3. From now on you can use the added configuration to run the angular app

#### Plugins

Press `Strg` + `Alt` + `S` to open settings, then change to tab "Plugins", please ensure installation of 

* Lombok (installed by default)
* PMD-IDEA
* CheckStyle-IDEA,   add configuration file:
  * change to settings-tab "Tools"  →  Checkstyle  → Checkstyle Version = `8.27` 
  * configuration file  → Add  → Description = "Industry Fusion Checks"  → use a local checkstyle file: `./fusionparent/src/site/fusion_google_checks.xml` → Next
  * checkstyle.header.file = `license.txt`   → Finish  → set as active rule: click at checkbox on the left
    


### 4.2. Alternative: VS Code


#### fusionbackend  (Spring Boot)

Press `Strg` + `Alt` + `P` in VS Code → term → Create new integrated terminal.

```
cd ./fusionbackend
mvn clean install -DskipTests
java -jar target/fusionbackend-1.0.0-SNAPSHOT.jar
```


#### fusionfrontend (Angular + Jetti)  -->  TODO wegen npm install

Press `Strg` + `Alt` + `P` in VS Code → term → Create new integrated terminal → cd fusionfrontend/ → ``ng serve``

Ensure that you installed the latest angular-cli and once ran the command `npm install`.


#### Plugins

* GitHub Extension


## 5. Changes in Config

Please do the following changes:
* `fusionfrontend/src/environments/environment.ts`:   insert your keys for GoogleMapsPlugin, OISP etc.
* Recommendation: Create own dev-environment-yourName, and add it to the git-ignore list, 
  * add environment to angular.json  
  * add configuration startdev to package.json → scripts
  * TODO: @Tobias

Other important config files:
 * fusionbackend/src/main/resources/application.yaml
 * fusionfrontend/src/proxy.confs.js


## 6. Troubleshooting

### Miscellaneous
* ECONREFUSED →  Is keycloak running?
* ECONREFUSED → used port offset at native (no docker) keycloak creation? If yes, please change proxy.conf.js: “/auth” set target to e.g. :8180 or :8080
 * No data in FleetManager  → DB → asset_series:  company_id set to 2
 * GoogleMaps - Plugin not working  → add Keys in environment.ts
 * Local DB-Data were cleared → Running the fusionbackend deletes (currently) all imported data in the DB. Please reimport them.

### Pgadmin Configuration

#### Add database
Open http://127.0.0.1/pgadmin4  and login with your created credentials.

Servers (left side) → Create → Server… → use the following configuration:
```
General:     Name = Industry Fusion
Connection:  Host name / adress = 127.0.0.1;   db-name = postgresdb;   username =  postgres;     password = postgres
```

# Start und stop IF (backend + frontend)

## Start 

Assure database and keycloak docker containers are running. See above!

### 3. fusionbackend

Either (Option 2 is recommended)
1. run from within the IDE (intellij / eclipse / VS Code) of your choice
2. follow the instructions to compile and execute on [fusionbackend](https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionbackend)
3. or follow the instruction to generate and execute the docker container on follow the instructions to compile and execute on [fusionbackend](https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionbackend)

ToDo (fkn): Dass muss über getrennte Spring-Konfigurationen für local und cloud abgeschaltet werden.
**Warning**: Running the fusionbackend deletes (currently) all imported data in the DB. Automatic reimport or disabling is neccessary.

### 4. fusionfrontend

Either
1. run from within the IDE (intellij / eclipse / VS Code) of your choice
2. go to fusionfrontend-folder, type `ng serve`. For initial run enter once `npm install`. 
   For details see the instructions on [fusionfrontend](https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionfrontend)

## Stop

See running docker containers: `docker ps -a`, stop the following (order not important):

* stop fusionfrontend
* stop fusionbackend
* stop keycloak container:  `docker stop keycloak`
* stop docker container:  `docker stop postgres-104`


# Optional: Import Postman collection
ToDo (fkn): Für was werden/wurden die Postman-Collections verwendet?

[Get Postman!](https://www.getpostman.com/)

Download and import [fusion.postman_collection.json](https://github.com/IndustryFusion/IndustryFusion/tree/master/setup/fusion.postman_collection.json), copy content manually if not working.

# Using Kubernetes (K8S / K3S)

ToDo (fkn):  Update notwendig

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