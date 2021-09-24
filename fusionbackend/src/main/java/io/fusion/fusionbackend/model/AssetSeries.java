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
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@NamedEntityGraph(name = "AssetSeries.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "assets"),
                @NamedAttributeNode(value = "fieldSources")})
@Table(name = "asset_series")
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_assetseries")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class AssetSeries extends BaseAsset {
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "asset_type_template_id", nullable = false)
    private AssetTypeTemplate assetTypeTemplate;

    @OneToMany(mappedBy = "assetSeries")
    @Builder.Default
    private Set<Asset> assets = new LinkedHashSet<>();

    @OneToMany(mappedBy = "assetSeries", cascade = {CascadeType.ALL})
    @Builder.Default
    private Set<FieldSource> fieldSources = new LinkedHashSet<>();

    @OneToOne(cascade = CascadeType.ALL, optional = false)
    @JoinColumn(name = "connectivity_settings_id",
            foreignKey = @ForeignKey(name = "asset_series_connectivity_settings_id_fkey"))
    private ConnectivitySettings connectivitySettings;

    protected Boolean ceCertified;
    protected String protectionClass;
    protected String handbookUrl;
    protected String videoUrl;
    protected String customScript;

    public void copyFrom(final AssetSeries sourceAssetSeries) {
        if (sourceAssetSeries.getName() != null) {
            setName(sourceAssetSeries.getName());
        }
        if (sourceAssetSeries.getDescription() != null) {
            setDescription(sourceAssetSeries.getDescription());
        }
        if (sourceAssetSeries.getImageKey() != null) {
            setImageKey(sourceAssetSeries.getImageKey());
        }
        if (sourceAssetSeries.getProtectionClass() != null) {
            setProtectionClass(sourceAssetSeries.getProtectionClass());
        }
        if (sourceAssetSeries.getCeCertified() != null) {
            setCeCertified(sourceAssetSeries.getCeCertified());
        }
        if (sourceAssetSeries.getHandbookUrl() != null) {
            setHandbookUrl(sourceAssetSeries.getHandbookUrl());
        }
        if (sourceAssetSeries.getVideoUrl() != null) {
            setVideoUrl(sourceAssetSeries.getVideoUrl());
        }
        if (sourceAssetSeries.getAssets() != null) {
            setAssets(sourceAssetSeries.getAssets());
        }
        if (sourceAssetSeries.getCompany() != null) {
            setCompany(sourceAssetSeries.getCompany());
        }
        if (sourceAssetSeries.getCustomScript() != null) {
            setCustomScript(sourceAssetSeries.getCustomScript());
        }

        if (!sourceAssetSeries.getFieldSources().isEmpty()) {
            Map<Long, FieldSource> sourceFieldSourcesIdBasedMap = sourceAssetSeries.getFieldSources().stream()
                    .collect(Collectors.toMap(BaseEntity::getId, fieldsource -> fieldsource));
            for (FieldSource targetFieldSource : getFieldSources()) {
                FieldSource sourceFieldSource = sourceFieldSourcesIdBasedMap.get(targetFieldSource.getId());
                targetFieldSource.copyFrom(sourceFieldSource);
            }
        }

        ConnectivitySettings sourceConnectivitySettings = sourceAssetSeries.getConnectivitySettings();
        if (sourceConnectivitySettings != null) {
            getConnectivitySettings().setConnectionString(sourceConnectivitySettings.getConnectionString());
            getConnectivitySettings().setConnectivityProtocol(sourceConnectivitySettings.getConnectivityProtocol());
            getConnectivitySettings().setConnectivityType(sourceConnectivitySettings.getConnectivityType());
        }
    }


    public boolean isConnectivitySettingsUnchanged(AssetSeries targetAssetSeries) {
        boolean isChanged = false;

        ConnectivitySettings sourceConnectivitySettings = this.connectivitySettings;
        ConnectivitySettings targetConnectivitySettings = targetAssetSeries.getConnectivitySettings();

        String sourceConnectionString = sourceConnectivitySettings.getConnectionString();
        String targetConnectionString = targetConnectivitySettings.getConnectionString();

        ConnectivityType sourceConnectivityType = sourceConnectivitySettings.getConnectivityType();
        ConnectivityProtocol sourceConnectivityProtocol = sourceConnectivitySettings.getConnectivityProtocol();

        ConnectivityType targetConnectivityType = targetConnectivitySettings.getConnectivityType();
        ConnectivityProtocol targetConnectivityProtocol = targetConnectivitySettings.getConnectivityProtocol();


        if (!sourceConnectivitySettings.equals(targetConnectivitySettings)) {
            isChanged = true;
        } else if (!sourceConnectionString.equals(targetConnectionString)) {
            isChanged = true;
        } else if (!sourceConnectivityType.equals(targetConnectivityType)) {
            isChanged = true;
        } else if (!sourceConnectivityProtocol.equals(targetConnectivityProtocol)) {
            isChanged = true;
        }


        return isChanged;

    }

    public List<FieldSource> calculateDeletedFieldSources(AssetSeries sourceAssetSeries) {

        Set<FieldSource> sourceFieldSources = sourceAssetSeries.getFieldSources();

        return this.getFieldSources().stream()
                .filter(targetFieldSource -> !sourceFieldSources.contains(targetFieldSource))
                .collect(Collectors.toList());
    }
}
