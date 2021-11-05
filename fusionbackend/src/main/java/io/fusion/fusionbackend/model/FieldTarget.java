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

import io.fusion.fusionbackend.model.enums.FieldType;
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
@Table(name = "field_target")
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_fieldtarget")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class FieldTarget extends BaseEntity {
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "asset_type_template_id", nullable = false)
    private AssetTypeTemplate assetTypeTemplate;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    private FieldType fieldType;
    private Boolean mandatory;
    private String name;
    private String description;
    private String label;
    private String dashboardGroup;

    public void copyFrom(final FieldTarget sourceFieldTarget) {

        super.copyFrom(sourceFieldTarget);

        if (sourceFieldTarget.getFieldType() != null) {
            setFieldType(sourceFieldTarget.getFieldType());
        }
        if (sourceFieldTarget.getMandatory() != null) {
            setMandatory(sourceFieldTarget.getMandatory());
        }
        if (sourceFieldTarget.getName() != null) {
            setName(sourceFieldTarget.getName());
        }
        if (sourceFieldTarget.getDescription() != null) {
            setDescription(sourceFieldTarget.getDescription());
        }
        if (sourceFieldTarget.getLabel() != null) {
            setLabel(sourceFieldTarget.getLabel());
        }
        if (sourceFieldTarget.getDashboardGroup() != null) {
            setDashboardGroup(sourceFieldTarget.getDashboardGroup());
        }
    }
}
