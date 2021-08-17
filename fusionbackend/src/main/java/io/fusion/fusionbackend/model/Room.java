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
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@NamedEntityGraph(name = "Room.allChildren",
        attributeNodes = {
                @NamedAttributeNode(value = "assets")})
@NamedEntityGraph(name = "Room.allChildrenDeep",
        attributeNodes = {
                @NamedAttributeNode(value = "assets", subgraph = "assetChildren")},
        subgraphs = {
                @NamedSubgraph(name = "assetChildren", attributeNodes = {
                        @NamedAttributeNode("fieldInstances")})})
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_room")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class Room extends BaseEntity {
    public static final String NO_SPECIFIC_ROOM_NAME = "No specific room";

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "factory_site_id", nullable = false)
    private FactorySite factorySite;
    @OneToMany(mappedBy = "room")
    @Builder.Default
    private Set<Asset> assets = new LinkedHashSet<>();
    private String name;
    private String imageKey;
    private String description;

    public static Room getUnspecificRoomInstance() {
        Room unspecificRoom = new Room();
        unspecificRoom.name = NO_SPECIFIC_ROOM_NAME;
        unspecificRoom.description = NO_SPECIFIC_ROOM_NAME;
        return unspecificRoom;
    }

    public void copyFrom(final Room sourceRoom) {
        if (sourceRoom.getName() != null) {
            setName(sourceRoom.getName());
        }
        if (sourceRoom.getImageKey() != null) {
            setImageKey(sourceRoom.getImageKey());
        }
        if (sourceRoom.getDescription() != null) {
            setDescription(sourceRoom.getDescription());
        }
        if (sourceRoom.getFactorySite() != null) {
            setFactorySite(sourceRoom.getFactorySite());
        }
    }
}
