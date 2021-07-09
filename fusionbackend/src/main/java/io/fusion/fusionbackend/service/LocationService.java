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
import io.fusion.fusionbackend.model.Location;
import io.fusion.fusionbackend.model.Room;
import io.fusion.fusionbackend.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class LocationService {
    private final LocationRepository locationRepository;
    private final CompanyService companyService;
    private final RoomService roomService;

    private final String noSpecificRoomName = "No specific room";
    private final String noSpecificRoomDescription = "No specific room";

    @Autowired
    public LocationService(LocationRepository locationRepository, CompanyService companyService,
                           @Lazy RoomService roomService) {
        this.locationRepository = locationRepository;
        this.companyService = companyService;
        this.roomService = roomService;
    }

    public Set<Location> getLocationsByCompany(final Long companyId) {
        return locationRepository.findAllByCompanyId(LocationRepository.DEFAULT_SORT, companyId);
    }

    public Location getLocationByCompany(final Long companyId, final Long locationId, final boolean deep) {
        if (deep) {
            return locationRepository.findDeepByCompanyIdAndId(companyId, locationId)
                    .orElseThrow(ResourceNotFoundException::new);
        }
        return locationRepository.findByCompanyIdAndId(companyId, locationId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    public Location createLocation(final Long companyId, final Location location) {
        final Company company = companyService.getCompany(companyId, false);

        company.getLocations().add(location);
        location.setCompany(company);
        Location newLocation = locationRepository.save(location);

        Room noSpecificRoom =
                Room.builder().name(noSpecificRoomName).description(noSpecificRoomDescription).build();
        roomService.createRoom(companyId, newLocation.getId(), noSpecificRoom);

        return newLocation;
    }

    public Location updateLocation(final Long companyId, final Long locationId, final Location sourceLocation) {
        final Location targetLocation = getLocationByCompany(companyId, locationId, false);

        targetLocation.copyFrom(sourceLocation);

        return targetLocation;
    }

    public void deleteLocation(final Long companyId, final Long locationId) {
        final Location location = getLocationByCompany(companyId, locationId, false);

        location.getCompany().getLocations().remove(location);
        location.setCompany(null);

        locationRepository.delete(location);
    }
}
