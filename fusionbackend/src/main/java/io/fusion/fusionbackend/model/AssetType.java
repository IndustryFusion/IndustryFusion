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
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "asset_type")
@SequenceGenerator(initialValue = 1, allocationSize = 1, name = "idgen", sequenceName = "idgen_assettype")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class AssetType extends BaseEntity {
    private String name;
    private String description;
    private String label;

    public void copyFrom(final AssetType sourceAssetType) {

        super.copyFrom(sourceAssetType);

        if (sourceAssetType.getDescription() != null) {
            setDescription(sourceAssetType.getDescription());
        }
        if (sourceAssetType.getName() != null) {
            setName(sourceAssetType.getName());
        }
        if (sourceAssetType.getLabel() != null) {
            setLabel(sourceAssetType.getLabel());
        }
    }
}
