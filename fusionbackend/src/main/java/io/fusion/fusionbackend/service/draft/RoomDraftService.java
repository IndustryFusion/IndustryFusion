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

package io.fusion.fusionbackend.service.draft;

import io.fusion.fusionbackend.model.Country;
import io.fusion.fusionbackend.model.FactorySite;
import io.fusion.fusionbackend.model.Room;
import io.fusion.fusionbackend.model.enums.FactorySiteType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RoomDraftService {

    private final FactorySiteDraftService factorySiteDraftService;

    @Autowired
    public RoomDraftService(FactorySiteDraftService factorySiteDraftService) {
        this.factorySiteDraftService = factorySiteDraftService;
    }

    public Room initUnspecificRoomDraft() {
        return Room.getUnspecificRoomInstance();
    }

    public Room initUnspecificRoomDraftWithFactorySite(final Long companyId, final Country country,
                                                       final FactorySiteType factorySiteType) {
        Room transientRoom = initUnspecificRoomDraft();
        FactorySite transientFactorySite = factorySiteDraftService.initDraft(companyId, country, factorySiteType);
        transientRoom.setFactorySite(transientFactorySite);
        return transientRoom;
    }
}
