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

import io.fusion.fusionbackend.dto.RoomDto;
import io.fusion.fusionbackend.dto.mappers.RoomMapper;
import io.fusion.fusionbackend.rest.annotations.IsFactoryUser;
import io.fusion.fusionbackend.service.RoomService;
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
public class RoomRestService {
    private final RoomService roomService;
    private final RoomMapper roomMapper;

    @Autowired
    public RoomRestService(RoomService roomService, RoomMapper roomMapper) {
        this.roomService = roomService;
        this.roomMapper = roomMapper;
    }

    @GetMapping(path = "/companies/{companyId}/locations/{locationId}/rooms")
    public Set<RoomDto> getRooms(@PathVariable final Long companyId,
                                 @PathVariable final Long factorySiteId,
                                 @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return roomMapper.toDtoSet(roomService.getRoomsCheckFullPath(companyId, factorySiteId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/rooms")
    public Set<RoomDto> getRoomsOfCompany(@PathVariable final Long companyId,
                                          @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return roomMapper.toDtoSet(roomService.getRoomsOfCompany(companyId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/locations/{locationId}/rooms/{roomId}")
    public RoomDto getRoom(@PathVariable final Long companyId,
                           @PathVariable final Long factorySiteId,
                           @PathVariable final Long roomId,
                           @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return roomMapper.toDto(roomService.getRoomCheckFullPath(companyId, factorySiteId, roomId, embedChildren),
                embedChildren);
    }

    @PostMapping(path = "/companies/{companyId}/locations/{locationId}/rooms")
    public RoomDto createRoom(@PathVariable final Long companyId,
                              @PathVariable final Long factorySiteId,
                              @RequestBody final RoomDto roomDto) {
        return roomMapper.toDto(roomService.createRoom(companyId, factorySiteId, roomMapper.toEntity(roomDto)), false);
    }

    @PatchMapping(path = "/companies/{companyId}/locations/{locationId}/rooms/{roomId}")
    public RoomDto updateRoom(@PathVariable final Long companyId,
                              @PathVariable final Long factorySiteId,
                              @PathVariable final Long roomId,
                              @RequestBody final RoomDto roomDto) {
        return roomMapper.toDto(roomService.updateRoom(companyId, factorySiteId, roomId,
                roomMapper.toEntity(roomDto)), false);
    }

    @DeleteMapping(path = "/companies/{companyId}/locations/{locationId}/rooms/{roomId}")
    public void deleteRoom(@PathVariable final Long companyId,
                           @PathVariable final Long factorySiteId,
                           @PathVariable final Long roomId) {
        roomService.deleteRoom(companyId, factorySiteId, roomId);
    }
}
