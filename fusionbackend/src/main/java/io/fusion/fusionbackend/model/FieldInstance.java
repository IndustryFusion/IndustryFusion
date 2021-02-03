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
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "field_instance")
@SequenceGenerator(initialValue = 1, allocationSize = 1, name = "idgen", sequenceName = "idgen_fieldinstance")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class FieldInstance extends BaseEntity {
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "field_source_id", nullable = false)
    private FieldSource fieldSource;

    private String sourceSensorLabel;
    private String externalId;
    private String name;
    private String description;
    private String value;

    public void copyFrom(final FieldInstance sourceField) {
        if (sourceField.getName() != null) {
            setName(sourceField.getName());
        }
        if (sourceField.getDescription() != null) {
            setDescription(sourceField.getDescription());
        }
        if (sourceField.getValue() != null) {
            setValue(sourceField.getValue());
        }
        if (sourceField.getExternalId() != null) {
            setExternalId(sourceField.getExternalId());
        }
        if (sourceField.getSourceSensorLabel() != null) {
            setSourceSensorLabel(sourceField.getSourceSensorLabel());
        }
    }
}
