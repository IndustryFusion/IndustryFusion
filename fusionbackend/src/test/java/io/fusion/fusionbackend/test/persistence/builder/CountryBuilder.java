package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.Country;

public class CountryBuilder implements Builder<Country> {

    private CountryBuilder() {
    }

    public static CountryBuilder aCountry() {
        return new CountryBuilder();
    }

    @Override
    public Country build() {
        Country country = new Country();
        country.setName("Germany");

        return country;
    }
}
