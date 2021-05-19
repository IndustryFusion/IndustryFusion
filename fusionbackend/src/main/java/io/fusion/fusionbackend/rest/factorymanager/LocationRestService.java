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

import io.fusion.fusionbackend.dto.LocationDto;
import io.fusion.fusionbackend.dto.mappers.LocationMapper;
import io.fusion.fusionbackend.rest.annotations.IsFactoryUser;
import io.fusion.fusionbackend.service.LocationService;
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
public class LocationRestService {
    private final LocationService locationService;
    private final LocationMapper locationMapper;

    @Autowired
    public LocationRestService(LocationService locationService, LocationMapper locationMapper) {
        this.locationService = locationService;
        this.locationMapper = locationMapper;
    }

    @GetMapping(path = "/companies/{companyId}/locations")
    public Set<LocationDto> getLocations(@PathVariable final Long companyId,
                                         @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return locationMapper.toDtoSet(locationService.getLocationsByCompany(companyId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/locations/{locationId}")
    public LocationDto getLocation(@PathVariable final Long companyId,
                                   @PathVariable final Long locationId,
                                   @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return locationMapper.toDto(locationService.getLocationByCompany(companyId, locationId, embedChildren),
                embedChildren);
    }

    @PostMapping(path = "/companies/{companyId}/locations")
    public LocationDto createLocation(@PathVariable final Long companyId,
                                      @RequestBody final LocationDto locationDto) {
        return locationMapper.toDto(locationService.createLocation(companyId, locationMapper.toEntity(locationDto)),
                false);
    }

    @PatchMapping(path = "/companies/{companyId}/locations/{locationId}")
    public LocationDto updateLocation(@PathVariable final Long companyId,
                                      @PathVariable final Long locationId,
                                      @RequestBody final LocationDto locationDto) {
        return locationMapper.toDto(locationService.updateLocation(companyId, locationId,
                locationMapper.toEntity(locationDto)), false);
    }

    @DeleteMapping(path = "/companies/{companyId}/locations/{locationId}")
    public void deleteLocation(@PathVariable final Long companyId,
                               @PathVariable final Long locationId) {
        locationService.deleteLocation(companyId, locationId);
    }
}
