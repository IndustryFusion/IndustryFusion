package io.fusion.fusionbackend.test.persistence.tests;

import io.fusion.fusionbackend.model.ConnectivityType;
import io.fusion.fusionbackend.test.persistence.PersistenceTestsBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static io.fusion.fusionbackend.test.persistence.builder.ConnectivityProtocolBuilder.aConnectivityProtocol;
import static io.fusion.fusionbackend.test.persistence.builder.ConnectivityTypeBuilder.aConnectivityType;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;


public class PersistenceTestsConnectivityType extends PersistenceTestsBase {

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    void persistConnectivityType() {
        ConnectivityType connectivityType = aConnectivityType().build();

        ConnectivityType foundType = testEntityManager.persistFlushFind(connectivityType);

        assertNotNull(foundType);
    }

    @Test
    void persistConnectivityTypeWithProtocol() {
        ConnectivityType connectivityType = aConnectivityType()
                .withProtocol(persisted(aConnectivityProtocol()))
                .build();

        ConnectivityType foundType = testEntityManager.persistFlushFind(connectivityType);

        assertEquals(1, foundType.getAvailableProtocols().size());
    }
}
