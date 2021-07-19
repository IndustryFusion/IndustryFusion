package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.test.persistence.builder.Builder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
abstract class PersistenceTestsBase {

    @Autowired
    private TestEntityManager testEntityManager;

    /**
     * Factory method for a Builder decorator, which persists entities directly after building.
     *
     * @param builder the builder to be decorated
     * @param <T> the generic type of the builder
     * @return the decorated builder
     */
    protected  <T> Builder<T> persisted(final Builder<T> builder) {
        return () -> {
            T entity = builder.build();
            testEntityManager.persist(entity);
            return entity;
        };
    }

}
