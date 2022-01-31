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
import io.fusion.fusionbackend.model.enums.FactorySiteType;
import io.fusion.fusionbackend.rest.annotations.IsFactoryUser;
import io.fusion.fusionbackend.service.draft.FactorySiteDraftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@IsFactoryUser
public class FactorySiteDraftRestService {
    private final FactorySiteDraftService factorySiteDraftService;
    private final FactorySiteMapper factorySiteMapper;

    @Autowired
    public FactorySiteDraftRestService(FactorySiteDraftService factorySiteDraftService,
                                       FactorySiteMapper factorySiteMapper) {
        this.factorySiteDraftService = factorySiteDraftService;
        this.factorySiteMapper = factorySiteMapper;
    }

    @GetMapping(path = "/companies/{companyId}/factorysites/init-factory-site-draft")
    public FactorySiteDto getFactorySite(@PathVariable final Long companyId,
                                      @RequestParam(defaultValue = "true") final boolean embedChildren) {
        return factorySiteMapper.toDto(factorySiteDraftService.initDraft(companyId, FactorySiteType.FABRICATION),
                embedChildren);
    }
}
