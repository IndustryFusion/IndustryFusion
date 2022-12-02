CALL mvn clean compile package -DskipTests
CALL java -jar target/fusionbackend-1.0.0-SNAPSHOT.jar -Djava.io.tmpdir=d:\\tmp
