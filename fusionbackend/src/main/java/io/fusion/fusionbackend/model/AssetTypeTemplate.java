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
import javax.persistence.NamedSubgraph;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@NamedEntityGraph(name = "AssetTypeTemplate.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "assetSeries"),
                @NamedAttributeNode(value = "fieldTargets")})
@NamedEntityGraph(name = "AssetTypeTemplate.allChildrenDeep",
        attributeNodes = {
                @NamedAttributeNode(value = "assetSeries", subgraph = "assetSeriesChildren"),
                @NamedAttributeNode(value = "fieldTargets")},
        subgraphs = {
                @NamedSubgraph(name = "assetSeriesChildren", attributeNodes = {
                        @NamedAttributeNode("fieldSources")})})
@Table(name = "asset_type_template")
@SequenceGenerator(initialValue = 1, allocationSize = 1, name = "idgen", sequenceName = "idgen_assettypetemplate")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class AssetTypeTemplate extends BaseAsset {
    @OneToMany(mappedBy = "assetTypeTemplate")
    @Builder.Default
    private Set<AssetSeries> assetSeries = new LinkedHashSet<>();

    @OneToMany(mappedBy = "assetTypeTemplate")
    @Builder.Default
    private Set<FieldTarget> fieldTargets = new LinkedHashSet<>();

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "asset_type_id", nullable = false)
    private AssetType assetType;
}
