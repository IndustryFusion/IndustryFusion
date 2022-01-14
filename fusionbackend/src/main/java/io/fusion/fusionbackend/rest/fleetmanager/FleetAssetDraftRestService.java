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

import io.fusion.fusionbackend.dto.AssetDto;
import io.fusion.fusionbackend.dto.RoomDto;
import io.fusion.fusionbackend.dto.mappers.AssetMapper;
import io.fusion.fusionbackend.dto.mappers.RoomMapper;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.draft.AssetDraftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@IsFleetUser
public class FleetAssetDraftRestService {
    private final AssetDraftService assetDraftService;
    private final AssetMapper assetMapper;
    private final RoomMapper roomMapper;

    @Autowired
    public FleetAssetDraftRestService(AssetDraftService assetDraftService,
                                      AssetMapper assetMapper,
                                      RoomMapper roomMapper) {
        this.assetDraftService = assetDraftService;
        this.assetMapper = assetMapper;
        this.roomMapper = roomMapper;
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/init-asset-draft")
    public AssetDto initAssetDraft(@PathVariable final Long companyId,
                                    @PathVariable final Long assetSeriesId,
                                    @RequestParam(defaultValue = "true") final boolean embedChildren) {
        return assetMapper.toDto(
                assetDraftService.initAssetDraft(companyId, assetSeriesId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/init-room-draft")
    public RoomDto initUnspecificRoomDraft(@PathVariable final Long companyId,
                                           @RequestParam(defaultValue = "true") final boolean embedChildren) {
        return roomMapper.toDto(
                assetDraftService.initUnspecificRoomDraft(companyId), embedChildren);
    }
}
