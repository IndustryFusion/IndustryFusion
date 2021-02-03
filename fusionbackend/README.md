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

# Build, test and execute the jar
## Build 
```
mvn clean compile -DskipTests
```

## Build with test
The backend tests are full integration test which rely on the TestContainers library.
TestContainers require docker to operate.
```
mvn clean compile
```

## Execute
```
java -jar target/fusionbackend-1.0.0-SNAPSHOT.jar 
```

# Build and execute the docker image
The application uses the Jib base image.

## Build docker image to docker daemon
```
mvn install
# or specifically
mvn compile jib:dockerBuild
```

## Build a docker image tarball
```
mvn compile jib:buildTar
```
The file can then be found in target/jib-image.tar

## Execute the docker image from the docker daemon
```
docker run -it fusionbackend
```

or in windows

```
docker run -p 8080:8080 -it fusionbackend
```

## Start a local postgres
```
docker run -d -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgresdb postgres
# or for existing
docker start postgres
```
## Start a local keycloak
```
docker run -d -p 8081:8080 --name keycloak -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin quay.io/keycloak/keycloak:10.0.2
# or for existing
docker start keycloak
```
