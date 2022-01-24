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

import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.ShiftSettings;
import io.fusion.fusionbackend.model.ShiftsOfDay;
import io.fusion.fusionbackend.model.enums.DayType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;

@Service
@Transactional
public class ShiftsOfDayDraftService {

    @Autowired
    public ShiftsOfDayDraftService() {
    }

    public ShiftsOfDay initDraft(final ShiftSettings transientShiftSettings, final DayType day) {
        if (day == null) {
            throw new ResourceNotFoundException();
        }

        final ShiftsOfDay transientShiftsOfDay = new ShiftsOfDay();

        transientShiftsOfDay.setDay(day);
        transientShiftsOfDay.setIsActive(day != DayType.SUNDAY && day != DayType.SATURDAY);
        transientShiftsOfDay.setShiftSettings(transientShiftSettings);
        transientShiftsOfDay.setShifts(new LinkedHashSet<>());

        return transientShiftsOfDay;
    }
}
