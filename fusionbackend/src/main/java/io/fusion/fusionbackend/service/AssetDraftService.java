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

import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.FieldInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetDraftService {
    private final FieldInstanceService fieldInstanceService;
    private final AssetSeriesService assetSeriesService;

    @Autowired
    public AssetDraftService(FieldInstanceService fieldInstanceService,
                             AssetSeriesService assetSeriesService) {
        this.fieldInstanceService = fieldInstanceService;
        this.assetSeriesService = assetSeriesService;
    }

    public Asset initAssetDraft(final Long companyId, final Long assetSeriesId) {
        final AssetSeries assetSeries = this.assetSeriesService.getAssetSeriesByCompany(companyId, assetSeriesId);
        final Company company = assetSeries.getCompany();

        final Asset newAsset = Asset.builder()
                .ceCertified(assetSeries.getCeCertified())
                .handbookKey(assetSeries.getHandbookKey())
                .protectionClass(assetSeries.getProtectionClass())
                .videoKey(assetSeries.getVideoKey())
                .build();
        newAsset.copyFrom(assetSeries);

        newAsset.setAssetSeries(assetSeries);
        newAsset.setCompany(company);

        newAsset.setGuid(UUID.randomUUID());

        List<FieldInstance> newFieldInstances = assetSeries.getFieldSources().stream()
                .map(fieldInstanceService::initFieldInstanceDraft)
                .collect(Collectors.toList());
        newAsset.getFieldInstances().addAll(newFieldInstances);

        return newAsset;
    }
}
