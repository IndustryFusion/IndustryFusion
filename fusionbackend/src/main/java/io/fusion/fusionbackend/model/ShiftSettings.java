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
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedSubgraph;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "shift_settings")
@NamedEntityGraph(name = "ShiftSettings.allChildrenDeep",
        attributeNodes = {
                @NamedAttributeNode(value = "shiftsOfDays", subgraph = "shiftsOfDaysChildren")},
        subgraphs = {
                @NamedSubgraph(name = "shiftsOfDaysChildren", attributeNodes = {
                        @NamedAttributeNode("shifts")})})
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_shift_settings")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class ShiftSettings extends BaseEntity {
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DayType weekStart;

    @OneToMany(mappedBy = "shiftSettings", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<ShiftsOfDay> shiftsOfDays = new LinkedHashSet<>();

    public void copyFrom(final ShiftSettings sourceShiftSettings) {

        super.copyFrom(sourceShiftSettings);

        if (sourceShiftSettings.getWeekStart() != null) {
            setWeekStart(sourceShiftSettings.getWeekStart());
        }

        if (sourceShiftSettings.getShiftsOfDays() != null && !sourceShiftSettings.getShiftsOfDays().isEmpty()) {
            Map<Long, ShiftsOfDay> sourceShiftsOfDayIdBasedMap = sourceShiftSettings.getShiftsOfDays().stream()
                    .collect(Collectors.toMap(BaseEntity::getId, shiftsOfDay -> shiftsOfDay));

            for (ShiftsOfDay targetShiftsOfDay: getShiftsOfDays()) {
                ShiftsOfDay sourceShiftsOfDay = sourceShiftsOfDayIdBasedMap.get(targetShiftsOfDay.getId());
                targetShiftsOfDay.copyFrom(sourceShiftsOfDay);
            }

            updateShiftSettingBackReferences();
        }
    }

    public void updateShiftSettingBackReferences() {
        for (ShiftsOfDay shiftsOfDay : getShiftsOfDays()) {
            shiftsOfDay.setShiftSettings(this);

            Set<Shift> shifts = shiftsOfDay.getShifts();
            for (Shift shift : shifts) {
                shift.setShiftsOfDay(shiftsOfDay);
            }
        }
    }
}
