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

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedNativeQuery;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@NamedEntityGraph(name = "Asset.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "fieldInstances")})
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_asset")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@NamedNativeQuery(
        name = "Asset.findSubsystemCandidates",
        query = "select * from asset where subsystem_parent_id is null"
                + " and asset_series_id != ? and company_id = ? ",
        resultClass = Asset.class)
public class Asset extends BaseAsset {
    @Column(nullable = false, unique = true)
    protected String globalId;

    protected UUID guid;
    protected Boolean ceCertified;
    protected String serialNumber;
    protected OffsetDateTime constructionDate;
    protected String protectionClass;
    protected String handbookUrl;
    protected String videoUrl;
    protected OffsetDateTime installationDate;
    /**
     * This connectionsString attribute is derived from the {@link ConnectivitySettings#getConnectionString()}.
     * From a business point of view it is the same concept but up to now, assets do not have
     * their own {@link ConnectivitySettings}.
     */
    @Column(nullable = false)
    protected String connectionString;
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id")
    private Room room;
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "asset_series_id", nullable = false)
    private AssetSeries assetSeries;
    @OneToMany(mappedBy = "asset", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @Builder.Default
    private Set<FieldInstance> fieldInstances = new LinkedHashSet<>();
    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "subsystem_parent_id")
    @Builder.Default
    private Set<Asset> subsystems = new HashSet<>();
    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "subsystem_parent_id", nullable = true)
    private Asset subSystemParent;
    private String externalName;
    private String controlSystemType;
    private Boolean hasGateway;
    private String gatewayConnectivity;

    public void copyFrom(final Asset sourceAsset) {

        super.copyFrom(sourceAsset);

        if (sourceAsset.getExternalName() != null) {
            setExternalName(sourceAsset.getExternalName());
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
        if (sourceAsset.getHandbookUrl() != null) {
            setHandbookUrl(sourceAsset.getHandbookUrl());
        }
        if (sourceAsset.getVideoUrl() != null) {
            setVideoUrl(sourceAsset.getVideoUrl());
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
        if (sourceAsset.getSubsystems() != null) {
            setSubsystems(sourceAsset.getSubsystems());
        }
        if (sourceAsset.getConnectionString() != null) {
            setConnectionString(sourceAsset.getConnectionString());
        }
    }
}
