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

package io.fusion.fusionbackend.service;

import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.AssetTypeTemplatePeer;
import io.fusion.fusionbackend.model.enums.PublicationState;
import io.fusion.fusionbackend.repository.AssetTypeTemplatePeerRepository;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class AssetTypeTemplatePeerService {

    private final AssetTypeTemplatePeerRepository assetTypeTemplatePeerRepository;
    private final AssetTypeTemplateRepository assetTypeTemplateRepository;
    private final AssetTypeTemplateService assetTypeTemplateService;

    @Autowired
    public AssetTypeTemplatePeerService(AssetTypeTemplatePeerRepository assetTypeTemplatePeerRepository,
                                        AssetTypeTemplateRepository assetTypeTemplateRepository,
                                        @Lazy AssetTypeTemplateService assetTypeTemplateService) {
        this.assetTypeTemplatePeerRepository = assetTypeTemplatePeerRepository;
        this.assetTypeTemplateRepository = assetTypeTemplateRepository;
        this.assetTypeTemplateService = assetTypeTemplateService;
    }

    public void createAssetTypeTemplatePeer(final AssetTypeTemplate assetTypeTemplate,
                                            AssetTypeTemplatePeer assetTypeTemplatePeer) {
        final AssetTypeTemplate peer = assetTypeTemplateService
                .getAssetTypeTemplate(assetTypeTemplatePeer.getPeer().getId(), false);

        assetTypeTemplatePeer.setAssetTypeTemplate(assetTypeTemplate);
        assetTypeTemplatePeer.setPeer(peer);

        validate(assetTypeTemplate, assetTypeTemplatePeer);

        AssetTypeTemplatePeer persistedPeer = assetTypeTemplatePeerRepository.save(assetTypeTemplatePeer);
        assetTypeTemplate.getPeers().add(persistedPeer);
    }

    public void validate(final AssetTypeTemplate assetTypeTemplate, final AssetTypeTemplatePeer assetTypeTemplatePeer) {
        if (assetTypeTemplatePeer.getId() != null
                && assetTypeTemplatePeer.getId().equals(assetTypeTemplate.getId())) {
            throw new RuntimeException("An asset type template is not allowed to be a peer to itself.");
        }
        if (assetTypeTemplateRepository.findAllSubsystemIds().contains(assetTypeTemplatePeer.getId())) {
            throw new RuntimeException("An asset type template peer is not allowed to be a subsystem.");
        }
        if (assetTypeTemplatePeer.getPeer().getPublicationState().equals(PublicationState.DRAFT)) {
            throw new RuntimeException("An asset type template peer can only refer to a published template.");
        }
    }

    public AssetTypeTemplatePeer getAssetTypeTemplatePeer(final Long assetTypeTemplatePeerId) {
        return assetTypeTemplatePeerRepository.findById(assetTypeTemplatePeerId).orElseThrow();
    }

    /**
     * The asset type template has to remove the link to the peer itself.
     */
    public void delete(Long assetTypeTemplatePeerId) {
        final AssetTypeTemplatePeer assetTypeTemplatePeer = getAssetTypeTemplatePeer(assetTypeTemplatePeerId);
        assetTypeTemplatePeerRepository.delete(assetTypeTemplatePeer);
    }

}
