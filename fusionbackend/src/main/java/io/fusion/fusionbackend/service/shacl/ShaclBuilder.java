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

package io.fusion.fusionbackend.service.shacl;

import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.shacl.NodeShape;
import io.fusion.fusionbackend.model.shacl.ShaclShape;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ShaclBuilder {

    AssetTypeTemplateService assetTypeTemplateService;
    private final ShaclMapper shaclMapper;

    public ShaclBuilder(AssetTypeTemplateService assetTypeTemplateService,
                        ShaclMapper shaclMapper
    ) {
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.shaclMapper = shaclMapper;
    }

    public Set<ShaclShape> buildEcosystemShacl() {
        try {
            return assetTypeTemplateService.getPublishedAssetTypeTemplates().stream()
                    .map(this::buildEcosystemShacl)
                    .collect(Collectors.toSet());
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    public ShaclShape buildEcosystemShacl(AssetTypeTemplate assetTypeTemplate) {
        NodeShape shape = shaclMapper.mapAssetTypeTemplate(assetTypeTemplate);
        shape.addSubShapes(shaclMapper.mapAssetTypeTemplate(assetTypeTemplate.getFieldTargets(), true));
        return shape;
    }

}