package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.Country;
import io.fusion.fusionbackend.model.FactorySite;
import io.fusion.fusionbackend.model.ShiftSettings;
import io.fusion.fusionbackend.model.enums.FactorySiteType;

public class FactorySiteBuilder implements Builder<FactorySite> {

    private Company company;
    private Country country;
    private ShiftSettings shiftSettings;

    private FactorySiteBuilder() {
    }

    public static FactorySiteBuilder aFactorySite() {
        return new FactorySiteBuilder();
    }

    public FactorySiteBuilder forCompany(Builder<Company> companyBuilder) {
        this.company = companyBuilder.build();
        return this;
    }

    public FactorySiteBuilder forCompany(Company company) {
        this.company = company;
        return this;
    }

    public FactorySiteBuilder withCountry(Builder<Country> countryBuilder) {
        this.country = countryBuilder.build();
        return this;
    }

    public FactorySiteBuilder withShiftSettings(ShiftSettings shiftSettings) {
        this.shiftSettings = shiftSettings;
        return this;
    }

    @Override
    public FactorySite build() {
        FactorySite factorySite = new FactorySite();

        if (shiftSettings == null) {
            throw new NullPointerException("Please provide a persisted shift settings");
        }
        factorySite.setShiftSettings(shiftSettings);

        if (company == null) {
            company = CompanyBuilder.aCompany().build();
        }
        factorySite.setCompany(company);
        company.getFactorySites().add(factorySite);

        if (country == null) {
            country = CountryBuilder.aCountry().build();
        }
        factorySite.setCountry(country);

        factorySite.setType(FactorySiteType.FABRICATION);

        return factorySite;
    }
}
