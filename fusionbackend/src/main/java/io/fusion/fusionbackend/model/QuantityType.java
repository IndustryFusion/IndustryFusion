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

import io.fusion.fusionbackend.model.enums.QuantityDataType;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "quantity_type")
@NamedEntityGraph(name = "QuantityType.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "units"),
                @NamedAttributeNode(value = "baseUnit")})
@SequenceGenerator(initialValue = 1, allocationSize = 1, name = "idgen", sequenceName = "idgen_quantitytype")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class QuantityType extends BaseEntity {
    @Builder.Default
    @OneToMany(mappedBy = "quantityType", fetch = FetchType.EAGER)
    private Set<Unit> units = new LinkedHashSet<>();

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "base_unit_id")
    private Unit baseUnit;

    private String name;
    private String description;
    private String label;
    private QuantityDataType dataType;

    public void copyFrom(final QuantityType sourceField) {

        super.copyFrom(sourceField);

        if (sourceField.getName() != null) {
            setName(sourceField.getName());
        }
        if (sourceField.getDescription() != null) {
            setDescription(sourceField.getDescription());
        }
        if (sourceField.getLabel() != null) {
            setLabel(sourceField.getLabel());
        }
        if (sourceField.getDataType() != null) {
            setDataType(sourceField.getDataType());
        }
        if (sourceField.getBaseUnit() != null) {
            setBaseUnit(sourceField.getBaseUnit());
        }
    }
}
