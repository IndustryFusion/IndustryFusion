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

import io.fusion.fusionbackend.model.enums.CompanyType;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedSubgraph;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@NamedEntityGraph(name = "Company.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "factorySites"),
                @NamedAttributeNode(value = "assetSeries"),
                @NamedAttributeNode(value = "assets")})
@NamedEntityGraph(name = "Company.allChildrenDeep",
        attributeNodes = {
                @NamedAttributeNode(value = "factorySites", subgraph = "factorySitesChildren"),
                @NamedAttributeNode(value = "assetSeries", subgraph = "assetSeriesChildren"),
                @NamedAttributeNode(value = "assets")},
        subgraphs = {
                @NamedSubgraph(name = "factorySiteChildren", attributeNodes = {
                        @NamedAttributeNode(value = "rooms")
                }),
                @NamedSubgraph(name = "assetSeriesChildren", attributeNodes = {
                        @NamedAttributeNode(value = "assets"),
                        @NamedAttributeNode(value = "fieldSources")})})
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_company")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class Company extends BaseEntity {
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CompanyType type;

    @OneToMany(mappedBy = "company")
    @Builder.Default
    private Set<FactorySite> factorySites = new LinkedHashSet<>();

    @OneToMany(mappedBy = "company")
    @Builder.Default
    private Set<AssetSeries> assetSeries = new LinkedHashSet<>();

    @OneToMany(mappedBy = "company")
    @Builder.Default
    private Set<Asset> assets = new LinkedHashSet<>();

    private String name;
    private String description;
    private String imageKey;

    public void copyFrom(final Company sourceCompany) {
        if (sourceCompany.getType() != null) {
            setType(sourceCompany.getType());
        }
        if (sourceCompany.getDescription() != null) {
            setDescription(sourceCompany.getDescription());
        }
        if (sourceCompany.getImageKey() != null) {
            setImageKey(sourceCompany.getImageKey());
        }
        if (sourceCompany.getName() != null) {
            setName(sourceCompany.getName());
        }
    }
}
