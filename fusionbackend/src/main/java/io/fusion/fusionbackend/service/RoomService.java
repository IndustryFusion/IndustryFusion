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
import io.fusion.fusionbackend.model.FactorySite;
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
    private final FactorySiteService factorySiteService;

    @Autowired
    public RoomService(RoomRepository roomRepository, @Lazy FactorySiteService factorySiteService) {
        this.roomRepository = roomRepository;
        this.factorySiteService = factorySiteService;
    }

    public Set<Room> getRoomsByFactorySite(final Long factorySiteId) {
        return roomRepository.findAllByfactorySiteId(RoomRepository.DEFAULT_SORT, factorySiteId);
    }

    public Room getRoomByFactorySite(final Long factorySiteId, final Long roomId, final boolean deep) {
        if (deep) {
            return roomRepository.findDeepByfactorySiteIdAndId(factorySiteId, roomId)
                    .orElseThrow(ResourceNotFoundException::new);
        }
        return roomRepository.findByfactorySiteIdAndId(factorySiteId, roomId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    public Room getRoomById(final Long roomId) {
        return roomRepository.findById(roomId).orElseThrow(ResourceNotFoundException::new);
    }

    public Set<Room> getRoomsCheckFullPath(final Long companyId, final Long factorySiteId) {
        // Make sure factory site belongs to company
        factorySiteService.getFactorySiteByCompany(companyId, factorySiteId, false);
        return getRoomsByFactorySite(factorySiteId);
    }

    public Set<Room> getRoomsOfCompany(final Long companyId) {
        return roomRepository.findAllByCompanyId(RoomRepository.DEFAULT_SORT, companyId);
    }

    public Room getRoomCheckFullPath(final Long companyId, final Long factorySiteId, final Long roomId,
                                     final boolean deep) {
        final Room foundRoom = getRoomByFactorySite(factorySiteId, roomId, deep);
        if (!foundRoom.getFactorySite().getCompany().getId().equals(companyId)) {
            throw new ResourceNotFoundException();
        }
        return foundRoom;
    }

    public Room createRoom(final Long companyId, final Long factorySiteId, final Room room) {
        final FactorySite factorySite = factorySiteService.getFactorySiteByCompany(companyId, factorySiteId, false);

        factorySite.getRooms().add(room);
        room.setFactorySite(factorySite);

        return roomRepository.save(room);
    }

    public Room updateRoom(final Long companyId, final Long factorySiteId, final Long roomId, final Room sourceRoom) {
        final Room targetRoom = getRoomCheckFullPath(companyId, factorySiteId, roomId, false);

        targetRoom.copyFrom(sourceRoom);

        return targetRoom;
    }

    public void deleteRoom(final Long companyId, final Long factorySiteId, final Long roomId) {
        final Room room = getRoomCheckFullPath(companyId, factorySiteId, roomId, false);

        room.getFactorySite().getRooms().remove(room);
        room.setFactorySite(null);

        roomRepository.delete(room);
    }
}
