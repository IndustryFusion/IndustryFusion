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
import io.fusion.fusionbackend.model.ShiftSettings;
import io.fusion.fusionbackend.model.ShiftsOfDay;
import io.fusion.fusionbackend.repository.ShiftSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;

@Service
@Transactional
public class ShiftSettingsService {
    private final ShiftsOfDayService shiftsOfDayService;
    private final ShiftSettingsRepository shiftSettingsRepository;

    @Autowired
    public ShiftSettingsService(ShiftsOfDayService shiftsOfDayService,
                                ShiftSettingsRepository shiftSettingsRepository) {
        this.shiftsOfDayService = shiftsOfDayService;
        this.shiftSettingsRepository = shiftSettingsRepository;
    }

    public void validate(ShiftSettings shiftSettings) {
        if (shiftSettings == null) {
            throw new NullPointerException("Shift settings is null");
        }
        if (shiftSettings.getWeekStart() == null) {
            throw new IllegalArgumentException("A week start has to exist in shift settings");
        }
        if (shiftSettings.getShiftsOfDays() == null) {
            throw new IllegalArgumentException("Shifts of days have to exist in shift settings");
        }
        if (shiftSettings.getShiftsOfDays().size() != 7) {
            throw new IllegalArgumentException("Shift settings should have 7 shifts of days");
        }

        for (ShiftsOfDay shiftsOfDay : shiftSettings.getShiftsOfDays()) {
            shiftsOfDayService.validate(shiftsOfDay);
        }
    }

    public ShiftSettings getShiftSettingsOfFactorySite(final FactorySite factorySite) {
        if (factorySite == null || factorySite.getShiftSettings() == null) {
            throw new NullPointerException();
        }
        return shiftSettingsRepository.findDeepById(factorySite.getShiftSettings().getId())
                .orElseThrow(ResourceNotFoundException::new);
    }

    public void deleteRemovedShifts(final ShiftSettings targetShiftSettings, final ShiftSettings sourceShiftSettings) {
        if (targetShiftSettings.getShiftsOfDays().size() == sourceShiftSettings.getShiftsOfDays().size()) {

            final ShiftsOfDay[] targetShiftsOfDay = targetShiftSettings.getShiftsOfDays()
                    .stream().sorted(Comparator.comparing(ShiftsOfDay::getDay))
                    .toArray(ShiftsOfDay[]::new);
            final ShiftsOfDay[] sourceShiftsOfDay = sourceShiftSettings.getShiftsOfDays()
                    .stream().sorted(Comparator.comparing(ShiftsOfDay::getDay))
                    .toArray(ShiftsOfDay[]::new);

            for (int i = 0; i < targetShiftSettings.getShiftsOfDays().size(); i++) {
                shiftsOfDayService.deleteRemovedShifts(targetShiftsOfDay[i], sourceShiftsOfDay[i]);
            }
        }
    }
}
