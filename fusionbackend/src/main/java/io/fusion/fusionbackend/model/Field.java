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

import io.fusion.fusionbackend.model.enums.FieldDataType;
import io.fusion.fusionbackend.model.enums.FieldThresholdType;
import io.fusion.fusionbackend.model.enums.FieldWidgetType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedSubgraph;
import javax.persistence.SequenceGenerator;
import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@NamedEntityGraph(name = "Field.allChildrenDeep",
        attributeNodes = {
                @NamedAttributeNode(value = "unit", subgraph = "unitChildren")},
        subgraphs = {
                @NamedSubgraph(name = "unitChildren", attributeNodes = {
                        @NamedAttributeNode(value = "quantityType")})})
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_field")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class Field extends BaseEntity {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unit_id")
    private Unit unit;

    private String name;
    private String description;
    private String label;
    private Double accuracy;

    @Column(updatable = false)
    @CreationTimestamp
    private OffsetDateTime creationDate;

    @Enumerated(EnumType.STRING)
    private FieldThresholdType thresholdType;

    @Enumerated(EnumType.STRING)
    private FieldWidgetType widgetType;

    @Enumerated(EnumType.STRING)
    private FieldDataType dataType;

    @OneToMany(mappedBy = "field", fetch = FetchType.EAGER)
    private Set<FieldOption> options;

    public void copyFrom(final Field sourceField) {

        super.copyFrom(sourceField);

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
        if (sourceField.getLabel() != null) {
            setLabel(sourceField.getLabel());
        }
        if (sourceField.getThresholdType() != null) {
            setThresholdType(sourceField.getThresholdType());
        }
        if (sourceField.getWidgetType() != null) {
            setWidgetType(sourceField.getWidgetType());
        }
        if (sourceField.getCreationDate() != null) {
            setCreationDate(sourceField.getCreationDate());
        }
        if (sourceField.getDataType() != null) {
            setDataType(sourceField.getDataType());
        }
        if (sourceField.getOptions() != null) {
            setOptions(sourceField.getOptions());
        }
    }
}
