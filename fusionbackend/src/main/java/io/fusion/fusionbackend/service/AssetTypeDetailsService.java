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

import io.fusion.fusionbackend.dto.AssetTypeDetailsDto;
import io.fusion.fusionbackend.dto.mappers.AssetTypeDetailsMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.repository.AssetTypeRepository;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import io.fusion.fusionbackend.repository.CompanyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetTypeDetailsService {
    private final AssetTypeTemplateRepository assetTypeTemplateRepository;
    private final AssetTypeRepository assetTypeRepository;
    private final AssetTypeDetailsMapper assetTypeDetailsMapper;

    private static final Logger LOG = LoggerFactory.getLogger(AssetTypeDetailsService.class);

    @Autowired
    public AssetTypeDetailsService(AssetTypeTemplateRepository assetTypeTemplateRepository,
                                   AssetTypeRepository assetTypeRepository,
                                   AssetTypeDetailsMapper assetTypeDetailsMapper) {

        this.assetTypeTemplateRepository = assetTypeTemplateRepository;
        this.assetTypeRepository = assetTypeRepository;
        this.assetTypeDetailsMapper = assetTypeDetailsMapper;
    }

    public List<AssetTypeDetailsDto> getAllAssetTypesDetails() {
        Iterable<AssetType> assetTypes = assetTypeRepository.findAll(CompanyRepository.DEFAULT_SORT);
        List<AssetTypeDetailsDto> assetTypeDetailsDtos = new LinkedList<>();
        assetTypes.forEach( assetType -> assetTypeDetailsDtos.add(getAssetTypeDetails(assetType.getId())));

        return assetTypeDetailsDtos;
    }

    public AssetTypeDetailsDto getAssetTypeDetails(final Long assetTypeId) {
        final Optional<AssetType> assetTypeOptional = assetTypeRepository.findById(assetTypeId);
        if (assetTypeOptional.isEmpty()) {
            LOG.warn("Asset type with id {} not found", assetTypeId);
            throw new ResourceNotFoundException();
        }

        final List<AssetTypeTemplate> assetTypeTemplates =
                assetTypeTemplateRepository.findAllByAssetType(assetTypeOptional.get());
        Long templateCount = (long) assetTypeTemplates.size();

        return getAssetTypeDetailsDto(assetTypeOptional.get(), assetTypeTemplates, templateCount);
    }

    private AssetTypeDetailsDto getAssetTypeDetailsDto(AssetType assetType,
                                                       List<AssetTypeTemplate> assetTypeTemplates,
                                                       Long templateCount) {
        final Set<AssetSeries> assetSeries = assetTypeTemplates.stream()
                .map(AssetTypeTemplate::getAssetSeries)
                .flatMap(Set::stream)
                .collect(Collectors.toSet());
        long assetSeriesCount = assetSeries.size();

        final Set<Asset> assets = assetSeries.stream()
                .map(AssetSeries::getAssets)
                .flatMap(Set::stream)
                .collect(Collectors.toSet());
        long assetCount = assets.size();

        return assetTypeDetailsMapper.toDto(assetType, templateCount, assetSeriesCount, assetCount);
    }
}
