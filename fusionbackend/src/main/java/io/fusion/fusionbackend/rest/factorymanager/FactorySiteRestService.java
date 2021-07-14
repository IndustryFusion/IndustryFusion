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

package io.fusion.fusionbackend.rest.factorymanager;

import io.fusion.fusionbackend.dto.FactorySiteDto;
import io.fusion.fusionbackend.dto.mappers.FactorySiteMapper;
import io.fusion.fusionbackend.rest.annotations.IsFactoryUser;
import io.fusion.fusionbackend.service.FactorySiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@IsFactoryUser
public class FactorySiteRestService {
    private final FactorySiteService factorySiteService;
    private final FactorySiteMapper factorySiteMapper;

    @Autowired
    public FactorySiteRestService(FactorySiteService factorySiteService, FactorySiteMapper factorySiteMapper) {
        this.factorySiteService = factorySiteService;
        this.factorySiteMapper = factorySiteMapper;
    }

    @GetMapping(path = "/companies/{companyId}/factorysites")
    public Set<FactorySiteDto> getFactorySites(@PathVariable final Long companyId,
                                            @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return factorySiteMapper.toDtoSet(factorySiteService.getFactorySitesByCompany(companyId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}")
    public FactorySiteDto getFactorySite(@PathVariable final Long companyId,
                                      @PathVariable final Long factorySiteId,
                                      @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return factorySiteMapper.toDto(factorySiteService.getFactorySiteByCompany(companyId, factorySiteId,
                embedChildren),
                embedChildren);
    }

    @PostMapping(path = "/companies/{companyId}/factorysites")
    public FactorySiteDto createFactorySite(@PathVariable final Long companyId,
                                         @RequestBody final FactorySiteDto factorySiteDto) {
        final Long countryId = factorySiteDto.getCountry() != null ? factorySiteDto.getCountry().getId()
                : factorySiteDto.getCountryId();

        return factorySiteMapper.toDto(factorySiteService.createFactorySiteWithUnspecificRoom(companyId, countryId,
                factorySiteMapper.toEntity(factorySiteDto)),
                false);
    }

    @PatchMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}")
    public FactorySiteDto updateFactorySite(@PathVariable final Long companyId,
                                         @PathVariable final Long factorySiteId,
                                         @RequestBody final FactorySiteDto factorySiteDto) {
        return factorySiteMapper.toDto(factorySiteService.updateFactorySite(companyId, factorySiteId,
                factorySiteMapper.toEntity(factorySiteDto)), false);
    }

    @DeleteMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}")
    public void deleteFactorySite(@PathVariable final Long companyId,
                               @PathVariable final Long factorySiteId) {
        factorySiteService.deleteFactorySite(companyId, factorySiteId);
    }
}
