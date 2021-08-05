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
import java.util.Set;

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

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "connectivity_settings_id",
            foreignKey = @ForeignKey(name = "asset_series_connectivity_settings_id_fkey"))
    private ConnectivitySettings connectivitySettings;

    protected Boolean ceCertified;
    protected String protectionClass;
    protected String handbookKey;
    protected String videoKey;

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
        if (sourceAssetSeries.getHandbookKey() != null) {
            setHandbookKey(sourceAssetSeries.getHandbookKey());
        }
        if (sourceAssetSeries.getVideoKey() != null) {
            setVideoKey(sourceAssetSeries.getVideoKey());
        }
        if (sourceAssetSeries.getAssets() != null) {
            setAssets(sourceAssetSeries.getAssets());
        }
        if (sourceAssetSeries.getCompany() != null) {
            setCompany(sourceAssetSeries.getCompany());
        }
        if (sourceAssetSeries.getFieldSources() != null) {
            setFieldSources(sourceAssetSeries.getFieldSources());
        }
    }
}
