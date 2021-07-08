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

import io.fusion.fusionbackend.dto.FieldDetailsDto;
import io.fusion.fusionbackend.dto.mappers.FieldDetailsMapper;
import io.fusion.fusionbackend.rest.annotations.IsFactoryUser;
import io.fusion.fusionbackend.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@IsFactoryUser
public class FactoryAssetFieldRestService {
    private final AssetService assetService;
    private final FieldDetailsMapper fieldDetailsMapper;

    @Autowired
    public FactoryAssetFieldRestService(AssetService assetService,
                                        FieldDetailsMapper fieldDetailsMapper) {
        this.assetService = assetService;
        this.fieldDetailsMapper = fieldDetailsMapper;
    }

    @GetMapping(path = "companies/{companyId}/assets/{assetId}/fields")
    public Set<FieldDetailsDto> getFieldDetails(@PathVariable final Long companyId,
                                                @PathVariable final Long assetId,
                                                @RequestParam(defaultValue = "true") final boolean embedChildren) {
        return fieldDetailsMapper.toDtoSet(assetService.getFieldInstances(companyId, assetId), embedChildren);
    }
}
