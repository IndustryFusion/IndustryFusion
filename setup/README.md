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

# Setup fusion application

## Setup using docker (recommended for quickstart)
### Postgres in docker
If you just want to get postgres up and running quickly:
`docker run -d --name postgres-104 -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:10.4`

### Run the fusionbackend
Either
1. run from within the IDE (intellij / eclipse) of your choice
2. follow the instructions to compile and execute on [fusionbackend](https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionbackend)
3. or follow the instruction to generate and execute the docker container on follow the instructions to compile and execute on [fusionbackend](https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionbackend)

Option 2 is recommended.

### Run the fusionfrontend
Follow the instructions on [fusionfrontend](https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionfrontend)

### Import sample data
The file [demoinserts.sql](https://github.com/IndustryFusion/IndustryFusion/tree/master/setup/demoinserts.sql) can be imported to provide some initial demo data.
This should be done in any sql client:
The connection URL will be the following
Connection url: `jdbc:postgresql://localhost:5432/postgres`
username: postgres
password: postgres

## Using K8S
### Create linux host if running on windows or mac
This step is only necessary if running on Windows or Mac. If on linux skip to next step.

#### Get multipass
Install multipass from https://multipass.run/

#### Create linux host
Execute the following on the command line: `multipass launch --name k3s-master --cpus 2 --mem 2048M --disk 10G`

#### Setup linux host
1. Login to the newly created host with `multipass shell k3s-master`
3. Install k3s `curl -sfL https://get.k3s.io | sh -`

### Install postgres onto cluster
If on linux execute the following on the local host.
If on windows this should be executed from within k3s-master

```
git clone https://github.com/IndustryFusion/IndustryFusion.git
cd IndustryFusion-private-/setup/kubernetes
sudo kubectl apply -f postgres.yaml
```

### Get and setup the fusion application
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

## Run the fusionbackend
Either
1. run from within the IDE (intellij / eclipse) of your choice
2. follow the instructions to compile and execute on [fusionbackend](https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionbackend)
3. or follow the instruction to generate and execute the docker container on follow the instructions to compile and execute on [fusionbackend](https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionbackend)

Option 2 is recommended.

## Run the fusionfrontend
Follow the instructions on [fusionfrontend](https://github.com/IndustryFusion/IndustryFusion/tree/master/fusionfrontend)

## Import sample data
The file [demoinserts.sql](https://github.com/IndustryFusion/IndustryFusion/tree/master/setup/demoinserts.sql) can be imported to provide some initial demo data.
This should be done in any sql client:
The connection URL will be the following
* for linux: `jdbc:postgresql://localhost:5432/postgresdb`
* for windows `jdbc:postgresql://k3s-master.mshome.net:5432/postgresdb`

The following connection details should be used
```
  POSTGRES_DB: postgresdb
  POSTGRES_USER: postgresadmin
  POSTGRES_PASSWORD: posgresadminpw
```
## Import Postman collection
[Get Postman!](https://www.getpostman.com/)

Download and import [fusion.postman_collection.json](https://github.com/IndustryFusion/IndustryFusion/tree/master/setup/fusion.postman_collection.json)
