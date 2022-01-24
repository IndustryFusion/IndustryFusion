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

package io.fusion.fusionbackend.model;

import io.fusion.fusionbackend.model.enums.DayType;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "shifts_of_day")
@NamedEntityGraph(name = "ShiftsOfDay.allChildren",
        attributeNodes = {
        @NamedAttributeNode(value = "shifts"), @NamedAttributeNode(value = "shiftSettings")})
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_shifts_of_day")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class ShiftsOfDay extends BaseEntity {
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DayType day;

    @Column(nullable = false)
    private Boolean isActive;

    @OneToMany(mappedBy = "shiftsOfDay", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Shift> shifts = new LinkedHashSet<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shift_settings_id", nullable = false)
    private ShiftSettings shiftSettings;

    public void copyFrom(final ShiftsOfDay sourceShiftsOfDay) {

        super.copyFrom(sourceShiftsOfDay);

        if (sourceShiftsOfDay.getDay() != null) {
            setDay(sourceShiftsOfDay.getDay());
        }
        if (sourceShiftsOfDay.getIsActive() != null) {
            setIsActive(sourceShiftsOfDay.getIsActive());
        }
        if (!sourceShiftsOfDay.getShifts().isEmpty()) {
            updateExistingShifts(sourceShiftsOfDay);
            addNewShifts(sourceShiftsOfDay);
            // delete shifts is handled in ShiftsOfDayService due to usage of repository
        }

        if (sourceShiftsOfDay.getShiftSettings() != null) {
            setShiftSettings(sourceShiftsOfDay.getShiftSettings());
        }
    }

    private void updateExistingShifts(final ShiftsOfDay sourceShiftsOfDay) {
        Map<Long, Shift> sourceShiftIdBasedMap = sourceShiftsOfDay.getShifts().stream()
                .filter(shift -> shift.getId() != null)
                .collect(Collectors.toMap(BaseEntity::getId, shift -> shift));

        for (Shift targetShift: getShifts()) {
            Shift sourceShift = sourceShiftIdBasedMap.get(targetShift.getId());
            if (sourceShift != null) {
                targetShift.copyFrom(sourceShift);
            }
        }
    }

    private void addNewShifts(final ShiftsOfDay sourceShiftsOfDay) {
        Set<Shift> newShifts = sourceShiftsOfDay.getShifts().stream()
                .filter(shift -> shift.getId() == null)
                .collect(Collectors.toSet());

        getShifts().addAll(newShifts);
    }
}
