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

import io.fusion.fusionbackend.model.Shift;
import io.fusion.fusionbackend.model.ShiftsOfDay;
import io.fusion.fusionbackend.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ShiftsOfDayService {
    private final ShiftService shiftService;
    private final ShiftRepository shiftRepository;

    @Autowired
    public ShiftsOfDayService(ShiftService shiftService,
                              ShiftRepository shiftRepository) {
        this.shiftService = shiftService;
        this.shiftRepository = shiftRepository;
    }

    public void validate(final ShiftsOfDay shiftsOfDay) {
        if (shiftsOfDay == null) {
            throw new NullPointerException("Shifts of day is null");
        }
        if (shiftsOfDay.getDay() == null) {
            throw new IllegalArgumentException("A day has to exist in shifts of day");
        }
        if (shiftsOfDay.getShifts() == null) {
            throw new IllegalArgumentException("A shift list has to exist in shifts of day");
        }
        if (shiftsOfDay.getShifts().size() > 3) {
            throw new IllegalArgumentException("There are more than 3 shifts per day");
        }

        for (Shift shift : shiftsOfDay.getShifts()) {
            shiftService.validate(shift);
        }
    }

    public void deleteRemovedShifts(final ShiftsOfDay targetShiftsOfDay, final ShiftsOfDay sourceShiftsOfDay) {
        Set<Shift> shiftsToDelete = targetShiftsOfDay.getShifts().stream()
                .filter(shift -> shift.getId() != null && !sourceShiftsOfDay.getShifts().contains(shift))
                .collect(Collectors.toSet());

        for (Shift shift : shiftsToDelete) {
            shiftRepository.delete(shift);
            targetShiftsOfDay.getShifts().remove(shift);
        }
    }
}
