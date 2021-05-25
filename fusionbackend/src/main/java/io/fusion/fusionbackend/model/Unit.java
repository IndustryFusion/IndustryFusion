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

import javax.persistence.*;

@Entity
@NamedEntityGraph(name = "Unit.allChildrenDeep",
        attributeNodes = {
                @NamedAttributeNode(value = "quantityType", subgraph = "quantityTypeChildren")},
        subgraphs = {
                @NamedSubgraph(name = "quantityTypeChildren", attributeNodes = {
                        @NamedAttributeNode(value = "units"),
                        @NamedAttributeNode(value = "baseUnit")})})
@SequenceGenerator(initialValue = 1, allocationSize = 1, name = "idgen", sequenceName = "idgen_unit")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class Unit extends BaseEntity {
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "quantity_type_id", nullable = false)
    private QuantityType quantityType;

    private String name;
    private String label;
    private String description;
    private String symbol;

    public void copyFrom(final Unit sourceUnit) {
        if (sourceUnit.getName() != null) {
            setName(sourceUnit.getName());
        }
        if (sourceUnit.getDescription() != null) {
            setDescription(sourceUnit.getDescription());
        }
        if (sourceUnit.getSymbol() != null) {
            setSymbol(sourceUnit.getSymbol());
        }
        if (sourceUnit.getLabel() != null) {
            setLabel(sourceUnit.getLabel());
        }
        if (sourceUnit.getQuantityType() != null) {
            setQuantityType(sourceUnit.getQuantityType());
        }
    }
}
