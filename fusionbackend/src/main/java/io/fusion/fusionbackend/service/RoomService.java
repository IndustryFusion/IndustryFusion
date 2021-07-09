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
import io.fusion.fusionbackend.model.Location;
import io.fusion.fusionbackend.model.Room;
import io.fusion.fusionbackend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class RoomService {
    private final RoomRepository roomRepository;
    private final LocationService locationService;

    @Autowired
    public RoomService(RoomRepository roomRepository, @Lazy LocationService locationService) {
        this.roomRepository = roomRepository;
        this.locationService = locationService;
    }

    public Set<Room> getRoomsByLocation(final Long locationId) {
        return roomRepository.findAllByLocationId(RoomRepository.DEFAULT_SORT, locationId);
    }

    public Room getRoomByLocation(final Long locationId, final Long roomId, final boolean deep) {
        if (deep) {
            return roomRepository.findDeepByLocationIdAndId(locationId, roomId)
                    .orElseThrow(ResourceNotFoundException::new);
        }
        return roomRepository.findByLocationIdAndId(locationId, roomId).orElseThrow(ResourceNotFoundException::new);
    }

    public Room getRoomById(final Long roomId) {
        return roomRepository.findById(roomId).orElseThrow(ResourceNotFoundException::new);
    }

    public Set<Room> getRoomsCheckFullPath(final Long companyId, final Long locationId) {
        locationService.getLocationByCompany(companyId, locationId, false); // Make sure location belongs to company
        return getRoomsByLocation(locationId);
    }

    public Set<Room> getRoomsOfCompany(final Long companyId) {
        return roomRepository.findAllByCompanyId(RoomRepository.DEFAULT_SORT, companyId);
    }

    public Room getRoomCheckFullPath(final Long companyId, final Long locationId, final Long roomId,
                                     final boolean deep) {
        final Room foundRoom = getRoomByLocation(locationId, roomId, deep);
        if (!foundRoom.getLocation().getCompany().getId().equals(companyId)) {
            throw new ResourceNotFoundException();
        }
        return foundRoom;
    }

    public Room createRoom(final Long companyId, final Long locationId, final Room room) {
        final Location location = locationService.getLocationByCompany(companyId, locationId, false);

        location.getRooms().add(room);
        room.setLocation(location);

        return roomRepository.save(room);
    }

    public Room updateRoom(final Long companyId, final Long locationId, final Long roomId, final Room sourceRoom) {
        final Room targetRoom = getRoomCheckFullPath(companyId, locationId, roomId, false);

        targetRoom.copyFrom(sourceRoom);

        return targetRoom;
    }

    public void deleteRoom(final Long companyId, final Long locationId, final Long roomId) {
        final Room room = getRoomCheckFullPath(companyId, locationId, roomId, false);

        room.getLocation().getRooms().remove(room);
        room.setLocation(null);

        roomRepository.delete(room);
    }
}
