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

package io.fusion.fusionbackend.service;

import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.Country;
import io.fusion.fusionbackend.model.FactorySite;
import io.fusion.fusionbackend.model.Room;
import io.fusion.fusionbackend.repository.FactorySiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class FactorySiteService {
    private final FactorySiteRepository factorySiteRepository;
    private final CompanyService companyService;
    private final RoomService roomService;
    private final CountryService countryService;

    private final String noSpecificRoomName = "No specific room";
    private final String noSpecificRoomDescription = "No specific room";

    @Autowired
    public FactorySiteService(FactorySiteRepository factorySiteRepository, CompanyService companyService,
                              @Lazy RoomService roomService, @Lazy CountryService countryService) {
        this.factorySiteRepository = factorySiteRepository;
        this.companyService = companyService;
        this.roomService = roomService;
        this.countryService = countryService;
    }

    public Set<FactorySite> getFactorySitesByCompany(final Long companyId) {
        return factorySiteRepository.findAllByCompanyId(FactorySiteRepository.DEFAULT_SORT, companyId);
    }

    public FactorySite getFactorySiteByCompany(final Long companyId, final Long factorySiteId, final boolean deep) {
        if (deep) {
            return factorySiteRepository.findDeepByCompanyIdAndId(companyId, factorySiteId)
                    .orElseThrow(ResourceNotFoundException::new);
        }
        return factorySiteRepository.findByCompanyIdAndId(companyId, factorySiteId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    @Transactional
    public FactorySite createFactorySite(final Long companyId, final Long countryId, final FactorySite factorySite) {
        final Company company = companyService.getCompany(companyId, false);
        final Country country = countryService.getCountry(countryId);

        company.getFactorySites().add(factorySite);
        factorySite.setCompany(company);
        factorySite.setCountry(country);
        FactorySite newFactorySite = factorySiteRepository.save(factorySite);

        Room newNoSpecificRoom = Room.builder()
                        .name(noSpecificRoomName)
                        .description(noSpecificRoomDescription)
                        .build();
        roomService.createRoom(companyId, newFactorySite.getId(), newNoSpecificRoom);

        return newFactorySite;
    }

    public FactorySite updateFactorySite(final Long companyId, final Long factorySiteId,
                                         final FactorySite sourceFactorySite) {
        final FactorySite targetFactorySite = getFactorySiteByCompany(companyId, factorySiteId, false);

        targetFactorySite.copyFrom(sourceFactorySite);

        return targetFactorySite;
    }

    public void deleteFactorySite(final Long companyId, final Long factorySiteId) {
        final FactorySite factorySite = getFactorySiteByCompany(companyId, factorySiteId, false);

        factorySite.getCompany().getFactorySites().remove(factorySite);
        factorySite.setCompany(null);

        factorySiteRepository.delete(factorySite);
    }
}
