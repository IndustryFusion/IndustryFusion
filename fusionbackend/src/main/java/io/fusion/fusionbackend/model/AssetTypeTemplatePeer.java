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

import io.fusion.fusionbackend.model.enums.CardinalityType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@NamedEntityGraph(name = "AssetTypeTemplatePeer.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "peer")})
@Table(name = "asset_type_template_peer")
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_assettypetemplatepeer")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class AssetTypeTemplatePeer extends BaseEntity {
    @ManyToOne(optional = false)
    @JoinColumn(name = "asset_type_template_id", nullable = false)
    private AssetTypeTemplate assetTypeTemplate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "peer_id", nullable = false)
    private AssetTypeTemplate peer;

    private String customName;

    @Enumerated(EnumType.STRING)
    private CardinalityType cardinality;

    private Boolean mandatory;

    public void copyFrom(final AssetTypeTemplatePeer sourceAssetTypeTemplatePeer) {

        super.copyFrom(sourceAssetTypeTemplatePeer);

        if (sourceAssetTypeTemplatePeer.getAssetTypeTemplate() != null) {
            setAssetTypeTemplate(sourceAssetTypeTemplatePeer.getAssetTypeTemplate());
        }
        if (sourceAssetTypeTemplatePeer.getPeer() != null) {
            setPeer(sourceAssetTypeTemplatePeer.getPeer());
        }
        if (sourceAssetTypeTemplatePeer.getCustomName() != null) {
            setCustomName(sourceAssetTypeTemplatePeer.getCustomName());
        }
        if (sourceAssetTypeTemplatePeer.getCardinality() != null) {
            setCardinality(sourceAssetTypeTemplatePeer.getCardinality());
        }
        if (sourceAssetTypeTemplatePeer.getMandatory() != null) {
            setMandatory(sourceAssetTypeTemplatePeer.getMandatory());
        }
    }
}
