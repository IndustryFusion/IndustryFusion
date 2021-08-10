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

import io.fusion.fusionbackend.model.enums.FactorySiteType;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedSubgraph;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "factory_site")
@NamedEntityGraph(name = "FactorySite.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "rooms")})
@NamedEntityGraph(name = "FactorySite.allChildrenDeep",
        attributeNodes = {
                @NamedAttributeNode(value = "rooms", subgraph = "roomChildren")},
        subgraphs = {
                @NamedSubgraph(name = "roomChildren", attributeNodes = {
                        @NamedAttributeNode("assets")})})
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_factory_site")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class FactorySite extends BaseEntity {
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private FactorySiteType type;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToMany(mappedBy = "factorySite")
    @Builder.Default
    private Set<Room> rooms = new LinkedHashSet<>();

    private String name;
    private String line1;
    private String line2;
    private String city;
    private String zip;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    private Double latitude;
    private Double longitude;
    private String imageKey;

    public void copyFrom(final FactorySite sourceFactorySite) {
        if (sourceFactorySite.getName() != null) {
            setName(sourceFactorySite.getName());
        }
        if (sourceFactorySite.getLine1() != null) {
            setLine1(sourceFactorySite.getLine1());
        }
        if (sourceFactorySite.getLine2() != null) {
            setLine2(sourceFactorySite.getLine2());
        }
        if (sourceFactorySite.getCity() != null) {
            setCity(sourceFactorySite.getCity());
        }
        if (sourceFactorySite.getZip() != null) {
            setZip(sourceFactorySite.getZip());
        }
        if (sourceFactorySite.getCountry() != null) {
            setCountry(sourceFactorySite.getCountry());
        }
        if (sourceFactorySite.getLatitude() != null) {
            setLatitude(sourceFactorySite.getLatitude());
        }
        if (sourceFactorySite.getLongitude() != null) {
            setLongitude(sourceFactorySite.getLongitude());
        }
        if (sourceFactorySite.getImageKey() != null) {
            setImageKey(sourceFactorySite.getImageKey());
        }
    }
}
