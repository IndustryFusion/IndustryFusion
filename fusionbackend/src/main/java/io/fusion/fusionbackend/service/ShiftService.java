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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ShiftService {

    @Autowired
    public ShiftService() {
    }

    public void validate(Shift shift) {
        if (shift == null) {
            throw new NullPointerException("Shift is null");
        }
        if (shift.getName() == null) {
            throw new IllegalArgumentException("A name has to exist in a shift");
        }

        final Long minutesPerDay = 24 * 60L - 1;
        if (shift.getStartMinutes() == null) {
            throw new IllegalArgumentException("A shift start has to exist in a shift");
        }
        if (shift.getStartMinutes() < 0 || shift.getStartMinutes() > minutesPerDay) {
            throw new IllegalArgumentException("Illegal value of start minutes of shift");
        }
        if (shift.getEndMinutes() == null) {
            throw new IllegalArgumentException("A shift end has to exist in a shift");
        }
        if (shift.getEndMinutes() < 0 || shift.getEndMinutes() > minutesPerDay) {
            throw new IllegalArgumentException("Illegal value of end minutes of shift");
        }
    }
}
