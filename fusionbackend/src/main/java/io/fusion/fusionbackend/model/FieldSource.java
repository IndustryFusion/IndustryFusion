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

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;


@Entity
@Table(name = "field_source")
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_fieldsource")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class FieldSource extends BaseEntity {
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "asset_series_id", nullable = false)
    private AssetSeries assetSeries;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "field_target_id", nullable = false)
    private FieldTarget fieldTarget;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "source_unit_id", nullable = false)
    private Unit sourceUnit;

    private String sourceSensorLabel;
    private String name;
    private String description;
    private String value;
    private String register;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "absolute_threshold_id")
    private Threshold absoluteThreshold;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "ideal_threshold_id")
    private Threshold idealThreshold;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "critical_threshold_id")
    private Threshold criticalThreshold;

    public void copyFrom(final FieldSource sourceField) {
        if (sourceField.getSourceSensorLabel() != null) {
            setSourceSensorLabel(sourceField.getSourceSensorLabel());
        }
        if (sourceField.getName() != null) {
            setName(sourceField.getName());
        }
        if (sourceField.getDescription() != null) {
            setDescription(sourceField.getDescription());
        }
        if (sourceField.getValue() != null) {
            setValue(sourceField.getValue());
        }
        if (sourceField.getRegister() != null) {
            setRegister(sourceField.getRegister());
        }
        if (sourceField.getAbsoluteThreshold() != null) {
            setAbsoluteThreshold(sourceField.getAbsoluteThreshold());
        }
        if (sourceField.getIdealThreshold() != null) {
            setIdealThreshold(sourceField.getIdealThreshold());
        }
        if (sourceField.getCriticalThreshold() != null) {
            setCriticalThreshold(sourceField.getCriticalThreshold());
        }
    }
}
