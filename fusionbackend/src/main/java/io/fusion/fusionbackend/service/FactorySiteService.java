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
import io.fusion.fusionbackend.model.ShiftSettings;
import io.fusion.fusionbackend.model.enums.FactorySiteType;
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
    private final ShiftSettingsService shiftSettingsService;

    @Autowired
    public FactorySiteService(FactorySiteRepository factorySiteRepository,
                              CompanyService companyService,
                              @Lazy RoomService roomService,
                              @Lazy CountryService countryService,
                              ShiftSettingsService shiftSettingsService) {
        this.factorySiteRepository = factorySiteRepository;
        this.companyService = companyService;
        this.roomService = roomService;
        this.countryService = countryService;
        this.shiftSettingsService = shiftSettingsService;
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
    public FactorySite createFactorySiteWithUnspecificRoom(final Long companyId, final Long countryId,
                                                           final FactorySite factorySite) {

        FactorySite targetFactorySite = prepareCreateFactorySite(companyId, countryId, factorySite);
        FactorySite persistedFactorySite = factorySiteRepository.save(targetFactorySite);

        roomService.createUnspecificRoom(companyId, persistedFactorySite.getId());

        return persistedFactorySite;
    }

    @Transactional
    public FactorySite createFactorySite(final Long companyId, final Long countryId, final FactorySite factorySite) {
        FactorySite targetFactorySite = prepareCreateFactorySite(companyId, countryId, factorySite);
        return factorySiteRepository.save(targetFactorySite);
    }

    private FactorySite prepareCreateFactorySite(final Long companyId,
                                                 final Long countryId,
                                                 final FactorySite factorySite) {
        final Company company = companyService.getCompany(companyId, false);
        final Country country = countryService.getCountry(countryId);

        company.getFactorySites().add(factorySite);
        factorySite.setCompany(company);
        factorySite.setCountry(country);

        if (hasShiftSettings(factorySite)) {
            factorySite.getShiftSettings().updateShiftSettingBackReferences();
        }

        validate(factorySite);

        return factorySite;
    }

    public FactorySite updateFactorySite(final Long companyId, final Long factorySiteId,
                                         final FactorySite sourceFactorySite) {
        final FactorySite targetFactorySite = getFactorySiteByCompany(companyId, factorySiteId, true);

        if (hasShiftSettings(sourceFactorySite)) {
            final ShiftSettings shiftSettings = shiftSettingsService
                    .getShiftSettings(sourceFactorySite.getShiftSettings().getId());
            targetFactorySite.setShiftSettings(shiftSettings);

            shiftSettingsService.deleteRemovedShifts(targetFactorySite.getShiftSettings(),
                    sourceFactorySite.getShiftSettings());
        }

        targetFactorySite.copyFrom(sourceFactorySite);

        final Country country = countryService.getCountry(sourceFactorySite.getCountry().getId());
        targetFactorySite.setCountry(country);

        validate(targetFactorySite);

        return targetFactorySite;
    }

    private boolean hasShiftSettings(final FactorySite factorySite) {
        return factorySite.getType() != FactorySiteType.FLEETMANAGER && factorySite.getShiftSettings() != null;
    }

    private void validate(final FactorySite factorySite) {
        if (factorySite.getShiftSettings() == null && factorySite.getType() != FactorySiteType.FLEETMANAGER) {
            throw new IllegalArgumentException("Shift settings have to exist in a factory site");
        }
        if (factorySite.getCountry() == null) {
            throw new IllegalArgumentException("A country has to exist in a factory site");
        }
        if (factorySite.getCompany() == null) {
            throw new IllegalArgumentException("A company has to exist in a factory site");
        }

        if (factorySite.getShiftSettings() != null) {
            shiftSettingsService.validate(factorySite.getShiftSettings());
        }
    }

    public void deleteFactorySite(final Long companyId, final Long factorySiteId) {
        final FactorySite factorySite = getFactorySiteByCompany(companyId, factorySiteId, false);

        factorySite.getCompany().getFactorySites().remove(factorySite);
        factorySite.setCompany(null);

        factorySiteRepository.delete(factorySite);
    }
}
