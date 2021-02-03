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

import io.fusion.fusionbackend.model.enums.LocationType;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.Column;
import javax.persistence.Entity;
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
@NamedEntityGraph(name = "Location.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "rooms")})
@NamedEntityGraph(name = "Location.allChildrenDeep",
        attributeNodes = {
                @NamedAttributeNode(value = "rooms", subgraph = "roomChildren")},
        subgraphs = {
                @NamedSubgraph(name = "roomChildren", attributeNodes = {
                        @NamedAttributeNode("assets")})})
@SequenceGenerator(initialValue = 1, allocationSize = 1, name = "idgen", sequenceName = "idgen_location")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class Location extends BaseEntity {
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LocationType type;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToMany(mappedBy = "location")
    @Builder.Default
    private Set<Room> rooms = new LinkedHashSet<>();

    private String name;
    private String line1;
    private String line2;
    private String city;
    private String zip;
    private String country;
    private Double latitude;
    private Double longitude;
    private String imageKey;

    public void copyFrom(final Location sourceLocation) {
        if (sourceLocation.getName() != null) {
            setName(sourceLocation.getName());
        }
        if (sourceLocation.getLine1() != null) {
            setLine1(sourceLocation.getLine1());
        }
        if (sourceLocation.getLine2() != null) {
            setLine2(sourceLocation.getLine2());
        }
        if (sourceLocation.getCity() != null) {
            setCity(sourceLocation.getCity());
        }
        if (sourceLocation.getZip() != null) {
            setZip(sourceLocation.getZip());
        }
        if (sourceLocation.getCountry() != null) {
            setCountry(sourceLocation.getCountry());
        }
        if (sourceLocation.getLatitude() != null) {
            setLatitude(sourceLocation.getLatitude());
        }
        if (sourceLocation.getLongitude() != null) {
            setLongitude(sourceLocation.getLongitude());
        }
        if (sourceLocation.getImageKey() != null) {
            setImageKey(sourceLocation.getImageKey());
        }
    }
}
