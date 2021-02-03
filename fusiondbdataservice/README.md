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
```
mvn clean compile
```

## Execute
```
java -jar target/fusiondbdataservice-1.0.0-SNAPSHOT.jar
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
docker run -it fusiondbdataservice
```

or in windows

```
docker run -p 8080:8080 -it fusiondbdataservice
```

