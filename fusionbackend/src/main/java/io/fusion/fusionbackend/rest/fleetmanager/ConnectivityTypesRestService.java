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

package io.fusion.fusionbackend.rest.fleetmanager;

import io.fusion.fusionbackend.dto.ConnectivityTypeDto;
import io.fusion.fusionbackend.dto.mappers.ConnectivityTypeMapper;
import io.fusion.fusionbackend.service.ConnectivityTypeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
public class ConnectivityTypesRestService {

    private final ConnectivityTypeMapper connectivityTypeMapper;

    private final ConnectivityTypeService connectivityTypesService;

    public ConnectivityTypesRestService(ConnectivityTypeMapper connectivityTypeMapper,
                                        ConnectivityTypeService connectivityTypesService) {
        this.connectivityTypeMapper = connectivityTypeMapper;
        this.connectivityTypesService = connectivityTypesService;
    }

    @GetMapping(path = "/connectivity-types")
    public Set<ConnectivityTypeDto> getConnectivityTypes() {
        return connectivityTypeMapper.toDtoSet(connectivityTypesService.getAll(), true);
    }
}
