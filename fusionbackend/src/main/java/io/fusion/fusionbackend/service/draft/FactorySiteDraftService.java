/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package io.fusion.fusionbackend.service.draft;

import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.Country;
import io.fusion.fusionbackend.model.FactorySite;
import io.fusion.fusionbackend.model.enums.FactorySiteType;
import io.fusion.fusionbackend.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FactorySiteDraftService {
    private final CompanyService companyService;

    @Autowired
    public FactorySiteDraftService(CompanyService companyService) {
        this.companyService = companyService;
    }

    public FactorySite initDraft(final Long companyId, final Country country, final FactorySiteType factorySiteType) {
        if (country == null) {
            throw new ResourceNotFoundException();
        }

        final Company company = companyService.getCompany(companyId, false);
        final FactorySite transientFactorySite = new FactorySite();

        transientFactorySite.setCompany(company);
        transientFactorySite.setCountry(country);
        transientFactorySite.setType(factorySiteType);

        return transientFactorySite;
    }
}
