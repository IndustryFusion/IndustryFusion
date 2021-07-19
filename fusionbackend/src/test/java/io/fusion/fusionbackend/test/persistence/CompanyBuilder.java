package io.fusion.fusionbackend.test.persistence;

import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.enums.CompanyType;



public class CompanyBuilder implements Builder<Company> {

    public static CompanyBuilder aCompany() {
        return new CompanyBuilder();
    }


    @Override
    public Company build() {
        Company company = new Company();
        company.setType(CompanyType.ECOSYSTEM_MANAGER);
        return company;
    }
}
