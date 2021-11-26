package io.fusion.fusionbackend.test.persistence.tests;

import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.test.persistence.PersistenceTestsBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static io.fusion.fusionbackend.test.persistence.builder.CompanyBuilder.aCompany;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;


public class PersistenceTestsCompany extends PersistenceTestsBase {

    @Autowired
    private TestEntityManager testEntityManager;

    @Test
    void persistCompany() {
        Company company = aCompany().build();

        Company foundCompany = testEntityManager.persistAndFlush(company);

        assertNotNull(foundCompany);
        assertEquals(company, foundCompany);
    }
}
