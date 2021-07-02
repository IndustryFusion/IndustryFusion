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

import lombok.Builder;
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
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@NamedEntityGraph(name = "Asset.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "fieldInstances")})
@SequenceGenerator(initialValue = 1, allocationSize = 1, name = "idgen", sequenceName = "idgen_asset")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class Asset extends BaseAsset {
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "asset_series_id", nullable = false)
    private AssetSeries assetSeries;

    @OneToMany(mappedBy = "asset")
    @Builder.Default
    private Set<FieldInstance> fieldInstances = new LinkedHashSet<>();

    private String externalId;
    private String controlSystemType;
    private Boolean hasGateway;
    private String gatewayConnectivity;
    protected UUID guid;
    protected Boolean ceCertified;
    protected String serialNumber;
    protected OffsetDateTime constructionDate;
    protected String protectionClass;
    protected String handbookKey;
    protected String videoKey;
    protected OffsetDateTime installationDate;

    public void copyFrom(final Asset sourceAsset) {
        super.copyFrom(sourceAsset);
        if (sourceAsset.getExternalId() != null) {
            setExternalId(sourceAsset.getExternalId());
        }
        if (sourceAsset.getControlSystemType() != null) {
            setControlSystemType(sourceAsset.getControlSystemType());
        }
        if (sourceAsset.getHasGateway() != null) {
            setHasGateway(sourceAsset.getHasGateway());
        }
        if (sourceAsset.getGatewayConnectivity() != null) {
            setGatewayConnectivity(sourceAsset.getGatewayConnectivity());
        }
        if (sourceAsset.getGuid() != null) {
            setGuid(sourceAsset.getGuid());
        }
        if (sourceAsset.getCeCertified() != null) {
            setCeCertified(sourceAsset.getCeCertified());
        }
        if (sourceAsset.getSerialNumber() != null) {
            setSerialNumber(sourceAsset.getSerialNumber());
        }
        if (sourceAsset.getConstructionDate() != null) {
            setConstructionDate(sourceAsset.getConstructionDate());
        }
        if (sourceAsset.getProtectionClass() != null) {
            setProtectionClass(sourceAsset.getProtectionClass());
        }
        if (sourceAsset.getHandbookKey() != null) {
            setHandbookKey(sourceAsset.getHandbookKey());
        }
        if (sourceAsset.getVideoKey() != null) {
            setVideoKey(sourceAsset.getVideoKey());
        }
        if (sourceAsset.getInstallationDate() != null) {
            setInstallationDate(sourceAsset.getInstallationDate());
        }
        if (sourceAsset.getRoom() != null) {
            setRoom(sourceAsset.getRoom());
        }
        if (sourceAsset.getFieldInstances() != null) {
            setFieldInstances(sourceAsset.getFieldInstances());
        }
    }
}
