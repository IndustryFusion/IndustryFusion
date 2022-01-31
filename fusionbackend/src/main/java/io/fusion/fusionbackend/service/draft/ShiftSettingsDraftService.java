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

import io.fusion.fusionbackend.model.ShiftSettings;
import io.fusion.fusionbackend.model.ShiftsOfDay;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.LinkedHashSet;
import java.util.Set;

@Service
@Transactional
public class ShiftSettingsDraftService {

    private final ShiftsOfDayDraftService shiftsOfDayDraftService;

    @Autowired
    public ShiftSettingsDraftService(ShiftsOfDayDraftService shiftsOfDayDraftService) {
        this.shiftsOfDayDraftService = shiftsOfDayDraftService;
    }

    public ShiftSettings initDraft() {
        final ShiftSettings transientShiftSettings = new ShiftSettings();

        transientShiftSettings.setWeekStart(DayOfWeek.MONDAY);

        Set<ShiftsOfDay> shiftsOfDays = new LinkedHashSet<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            shiftsOfDays.add(shiftsOfDayDraftService.initDraft(transientShiftSettings, day));
        }
        transientShiftSettings.setShiftsOfDays(shiftsOfDays);

        return transientShiftSettings;
    }
}
