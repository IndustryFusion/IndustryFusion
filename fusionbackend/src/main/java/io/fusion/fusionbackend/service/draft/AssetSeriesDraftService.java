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

package io.fusion.fusionbackend.service.draft;

import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.ConnectivitySettings;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.enums.PublicationState;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import io.fusion.fusionbackend.service.CompanyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AssetSeriesDraftService {

    private final AssetTypeTemplateService assetTypeTemplateService;
    private final CompanyService companyService;

    private static final Logger LOG = LoggerFactory.getLogger(AssetSeriesDraftService.class);

    public AssetSeriesDraftService(AssetTypeTemplateService assetTypeTemplateService, CompanyService companyService) {
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.companyService = companyService;
    }

    public AssetSeries fromAssetTypeTemplate(final Long targetCompanyId,
                                             final Long assetTypeTemplateId) {
        final AssetTypeTemplate assetTypeTemplate =
                assetTypeTemplateService.getAssetTypeTemplate(assetTypeTemplateId, true);

        if (!assetTypeTemplate.getPublicationState().equals(PublicationState.PUBLISHED)) {
            LOG.debug("Can't create assetseries while assettyptemplate {} with id {} is in state {} not published",
                    assetTypeTemplate.getName(), assetTypeTemplateId, assetTypeTemplate.getPublicationState());
            throw new RuntimeException("Can't create assetseries while assettyptemplate not published");
        }

        final Company targetCompany = companyService.getCompany(targetCompanyId, false);

        final AssetSeries newAssetSeries = AssetSeries.builder().build();

        newAssetSeries.setName(assetTypeTemplate.getName());
        newAssetSeries.setDescription(assetTypeTemplate.getDescription());
        newAssetSeries.setImageKey(assetTypeTemplate.getImageKey());

        assetTypeTemplate.getAssetSeries().add(newAssetSeries);
        newAssetSeries.setAssetTypeTemplate(assetTypeTemplate);

        newAssetSeries.setCompany(targetCompany);
        targetCompany.getAssetSeries().add(newAssetSeries);

        Set<FieldSource> newFieldSources = assetTypeTemplate.getFieldTargets().stream()
                .map(fieldTarget ->
                        FieldSource.builder()
                                .fieldTarget(fieldTarget)
                                .assetSeries(newAssetSeries)
                                .sourceUnit(fieldTarget.getField().getUnit())
                                .name(fieldTarget.getName())
                                .description(fieldTarget.getDescription())
                                .sourceSensorLabel(fieldTarget.getLabel())
                                .build())
                .collect(Collectors.toSet());
        newAssetSeries.setFieldSources(newFieldSources);

        ConnectivitySettings connectivitySettings = new ConnectivitySettings();
        newAssetSeries.setConnectivitySettings(connectivitySettings);

        return newAssetSeries;
    }
}
