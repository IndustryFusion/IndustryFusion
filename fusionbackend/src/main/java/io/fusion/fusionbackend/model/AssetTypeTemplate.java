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

import io.fusion.fusionbackend.model.enums.PublicationState;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedNativeQuery;
import javax.persistence.NamedSubgraph;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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
@NamedNativeQuery(
        name = "AssetTypeTemplate.findSubsystemCandidates",
        query = "select * from asset_type_template where subsystem_parent_id is null"
                + " and publication_state = 'PUBLISHED' and asset_type_id != ? and id != ?"
                + " and id not in (select distinct peer_id from asset_type_template_peer)",
        resultClass = AssetTypeTemplate.class)
@NamedNativeQuery(
        name = "AssetTypeTemplate.findAllSubsystemIds",
        query = "select id from asset_type_template where subsystem_parent_id is not null")

@NamedNativeQuery(
        name = "AssetTypeTemplate.findPeerCandidates",
        query = "select * from asset_type_template where subsystem_parent_id is null"
                + " and publication_state = 'PUBLISHED' and id != ?"
                + " and ? not in (select distinct peer_id from asset_type_template_peer)",
        resultClass = AssetTypeTemplate.class)
@NamedNativeQuery(
        name = "AssetTypeTemplate.findAllPeerIds",
        query = "select distinct peer_id from asset_type_template_peer")

@Table(name = "asset_type_template")
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_assettypetemplate")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class AssetTypeTemplate extends BaseAsset {

    @OneToMany(mappedBy = "assetTypeTemplate")
    @Builder.Default
    private Set<AssetSeries> assetSeries = new LinkedHashSet<>();

    @OneToMany(mappedBy = "assetTypeTemplate", fetch = FetchType.EAGER)
    @Builder.Default
    private Set<FieldTarget> fieldTargets = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "subsystem_parent_id")
    @Builder.Default
    private Set<AssetTypeTemplate> subsystems = new LinkedHashSet<>();

    @OneToMany(mappedBy = "assetTypeTemplate", fetch = FetchType.EAGER)
    @Builder.Default
    private Set<AssetTypeTemplatePeer> peers = new LinkedHashSet<>();

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "asset_type_id", nullable = false)
    private AssetType assetType;

    @Enumerated(EnumType.STRING)
    private PublicationState publicationState;
    private OffsetDateTime publishedDate;
    private Long publishedVersion;

    @Column(updatable = false)
    @CreationTimestamp
    private OffsetDateTime creationDate;

    public void copyFrom(final AssetTypeTemplate sourceAssetTypeTemplate) {

        super.copyFrom(sourceAssetTypeTemplate);

        if (sourceAssetTypeTemplate.getPublicationState() != null) {
            setPublicationState(sourceAssetTypeTemplate.getPublicationState());
        }
        if (sourceAssetTypeTemplate.getPublishedDate() != null) {
            setPublishedDate(sourceAssetTypeTemplate.getPublishedDate());
        }
        if (sourceAssetTypeTemplate.getPublishedVersion() != null) {
            setPublishedVersion(sourceAssetTypeTemplate.getPublishedVersion());
        }
        if (sourceAssetTypeTemplate.getCreationDate() != null) {
            setCreationDate(sourceAssetTypeTemplate.getCreationDate());
        }
        if (sourceAssetTypeTemplate.getSubsystems() != null) {
            setSubsystems(sourceAssetTypeTemplate.getSubsystems());
        }
        if (!sourceAssetTypeTemplate.getPeers().isEmpty()) {
            Map<Long, AssetTypeTemplatePeer> sourcePeersIdBasedMap = sourceAssetTypeTemplate.getPeers().stream()
                    .collect(Collectors.toMap(BaseEntity::getId, peer -> peer));
            for (AssetTypeTemplatePeer targetPeer : getPeers()) {
                AssetTypeTemplatePeer sourcePeer = sourcePeersIdBasedMap.get(targetPeer.getId());
                targetPeer.copyFrom(sourcePeer);
            }
        }
    }

    public Set<AssetTypeTemplatePeer> getPeersToCreate(AssetTypeTemplate sourceAssetTypeTemplate) {

        Set<AssetTypeTemplatePeer> sourcePeers = sourceAssetTypeTemplate.getPeers();
        Set<AssetTypeTemplatePeer> targetPeers = this.getPeers();

        return sourcePeers.stream()
                .filter(sourcePeer -> !targetPeers.contains(sourcePeer))
                .collect(Collectors.toSet());
    }

    public Set<AssetTypeTemplatePeer> getPeersToUpdate(AssetTypeTemplate sourceAssetTypeTemplate) {

        Set<AssetTypeTemplatePeer> sourcePeers = sourceAssetTypeTemplate.getPeers();
        Set<AssetTypeTemplatePeer> targetPeers = this.getPeers();

        return sourcePeers.stream()
                .filter(targetPeers::contains)
                .collect(Collectors.toSet());
    }

    public Set<AssetTypeTemplatePeer> getPeersToDelete(AssetTypeTemplate sourceAssetTypeTemplate) {

        Set<AssetTypeTemplatePeer> sourcePeers = sourceAssetTypeTemplate.getPeers();

        return this.getPeers().stream()
                .filter(targetPeer -> !sourcePeers.contains(targetPeer))
                .collect(Collectors.toSet());
    }

}
