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

import com.google.common.collect.Sets;
import io.fusion.fusionbackend.dto.AssetTypeDetailsDto;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetTypeService {
    private final AssetTypeRepository assetTypeRepository;
    private final AssetTypeTemplateRepository assetTypeTemplateRepository;

    @Autowired
    public AssetTypeService(AssetTypeRepository assetTypeRepository,
                            AssetTypeTemplateRepository assetTypeTemplateRepository) {
        this.assetTypeRepository = assetTypeRepository;
        this.assetTypeTemplateRepository = assetTypeTemplateRepository;
    }

    public Set<AssetType> getAllAssetTypes() {
        return Sets.newLinkedHashSet(assetTypeRepository.findAll(CompanyRepository.DEFAULT_SORT));
    }

    public AssetType getAssetType(final Long assetTypeId) {
        return assetTypeRepository.findById(assetTypeId).orElseThrow(ResourceNotFoundException::new);
    }

    public AssetTypeDetailsDto getAssetTypeDetailsDto(final Long assetTypeId) {
        final AssetType assetType = this.getAssetType(assetTypeId);

        final List<AssetTypeTemplate> assetTypeTemplates = assetTypeTemplateRepository.findAllByAssetType(assetType);
        final Set<AssetSeries> assetSeries = assetTypeTemplates.stream()
                .map(AssetTypeTemplate::getAssetSeries)
                .flatMap(Set::stream)
                .collect(Collectors.toSet());
        final Set<Asset> assets = assetSeries.stream()
                .map(AssetSeries::getAssets)
                .flatMap(Set::stream)
                .collect(Collectors.toSet());

        // TODO (js): Add Mapper for dto?
        return new AssetTypeDetailsDto(assetType, (long) assetTypeTemplates.size(),
                (long) assetSeries.size(), (long) assets.size());
    }


    public AssetType createAssetType(final AssetType assetType) {
        return assetTypeRepository.save(assetType);
    }

    public AssetType deleteAssetType(final Long assetTypeId) {
        final AssetType assetType = getAssetType(assetTypeId);

        // TODO: check it is not bound to any ATT
        assetTypeRepository.delete(assetType);

        return assetType;
    }

    public AssetType updateAssetType(final Long assetTypeId, final AssetType sourceAssetType) {
        final AssetType targetAssetType = getAssetType(assetTypeId);

        targetAssetType.copyFrom(sourceAssetType);

        return targetAssetType;
    }
}
