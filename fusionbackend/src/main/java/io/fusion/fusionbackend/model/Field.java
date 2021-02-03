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

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedSubgraph;
import javax.persistence.SequenceGenerator;

@Entity
@NamedEntityGraph(name = "Field.allChildrenDeep",
        attributeNodes = {
                @NamedAttributeNode(value = "unit", subgraph = "unitChildren")},
        subgraphs = {
                @NamedSubgraph(name = "unitChildren", attributeNodes = {
                        @NamedAttributeNode(value = "quantityType")})})
@SequenceGenerator(initialValue = 1, allocationSize = 1, name = "idgen", sequenceName = "idgen_field")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class Field extends BaseEntity {
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    private String name;
    private String description;
    private String label;
    private Double accuracy;
    private String value;

    public void copyFrom(final Field sourceField) {
        if (sourceField.getName() != null) {
            setName(sourceField.getName());
        }
        if (sourceField.getDescription() != null) {
            setDescription(sourceField.getDescription());
        }
        if (sourceField.getUnit() != null) {
            setUnit(sourceField.getUnit());
        }
        if (sourceField.getAccuracy() != null) {
            setAccuracy(sourceField.getAccuracy());
        }
        if (sourceField.getValue() != null) {
            setValue(sourceField.getValue());
        }
        if (sourceField.getLabel() != null) {
            setLabel(sourceField.getLabel());
        }
    }
}
