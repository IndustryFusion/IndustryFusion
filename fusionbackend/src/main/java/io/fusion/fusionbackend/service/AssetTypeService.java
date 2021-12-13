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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import io.fusion.fusionbackend.dto.AssetTypeDto;
import io.fusion.fusionbackend.dto.mappers.AssetTypeMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.repository.AssetTypeRepository;
import io.fusion.fusionbackend.repository.CompanyRepository;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetTypeService {
    private final AssetTypeRepository assetTypeRepository;
    private final AssetTypeMapper assetTypeMapper;

    private static final Logger LOG = LoggerFactory.getLogger(AssetTypeService.class);

    @Autowired
    public AssetTypeService(AssetTypeRepository assetTypeRepository, AssetTypeMapper assetTypeMapper) {
        this.assetTypeRepository = assetTypeRepository;
        this.assetTypeMapper = assetTypeMapper;
    }

    public Set<AssetType> getAllAssetTypes() {
        return Sets.newLinkedHashSet(assetTypeRepository.findAll(CompanyRepository.DEFAULT_SORT));
    }

    public AssetType getAssetType(final Long assetTypeId) {
        return assetTypeRepository.findById(assetTypeId).orElseThrow(ResourceNotFoundException::new);
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

    public byte[] exportAllToJson() throws IOException {
        Set<AssetType> assetTypes = Sets.newLinkedHashSet(assetTypeRepository
                .findAll(AssetTypeRepository.DEFAULT_SORT));

        Set<AssetTypeDto> assetTypeDtos = assetTypeMapper.toDtoSet(assetTypes, true);

        ObjectMapper objectMapper = BaseZipImportExport.getNewObjectMapper();
        return objectMapper.writeValueAsBytes(BaseZipImportExport.toSortedList(assetTypeDtos));
    }

    public int importMultipleFromJson(byte[] fileContent) throws IOException {
        Set<AssetTypeDto> assetTypeDtos = BaseZipImportExport.fileContentToDtoSet(fileContent, new TypeReference<>(){});
        Set<Long> existingAssetTypeIds = assetTypeRepository
                .findAll(AssetTypeRepository.DEFAULT_SORT)
                .stream().map(BaseEntity::getId).collect(Collectors.toSet());

        int entitySkippedCount = 0;
        for (AssetTypeDto assetTypeDto : BaseZipImportExport.toSortedList(assetTypeDtos)) {
            if (!existingAssetTypeIds.contains(assetTypeDto.getId())) {
                AssetType assetType = assetTypeMapper.toEntity(assetTypeDto);
                createAssetType(assetType);
            } else {
                LOG.warn("Asset type with the id " + assetTypeDto.getId()
                        + " already exists. Entry is ignored.");
                entitySkippedCount += 1;
            }
        }

        return entitySkippedCount;
    }
}
