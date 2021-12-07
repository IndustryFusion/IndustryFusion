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

import io.fusion.fusionbackend.dto.AssetTypeTemplateDto;
import io.fusion.fusionbackend.dto.FieldTargetDto;
import io.fusion.fusionbackend.dto.mappers.FieldTargetMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.repository.FieldTargetRepository;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class FieldTargetService {
    private final AssetTypeTemplateService assetTypeTemplateService;
    private final FieldTargetRepository fieldTargetRepository;
    private final FieldTargetMapper fieldTargetMapper;
    private final FieldService fieldService;

    private static final Logger LOG = LoggerFactory.getLogger(FieldTargetService.class);

    @Autowired
    public FieldTargetService(AssetTypeTemplateService assetTypeTemplateService,
                              FieldTargetRepository fieldTargetRepository,
                              FieldTargetMapper fieldTargetMapper,
                              FieldService fieldService) {
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.fieldTargetRepository = fieldTargetRepository;
        this.fieldTargetMapper = fieldTargetMapper;
        this.fieldService = fieldService;
    }

    private AssetTypeTemplate getAssetTypeTemplate(final Long assetTypeTemplateId, final boolean deep) {
        return assetTypeTemplateService.getAssetTypeTemplate(assetTypeTemplateId, deep);
    }

    public Set<FieldTarget> getFieldTargets(final Long assetTypeTemplateId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        return assetTypeTemplate.getFieldTargets();
    }

    public FieldTarget getFieldTarget(final Long assetTypeTemplateId, final Long fieldTargetId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        return assetTypeTemplate.getFieldTargets().stream()
                .filter(field -> field.getId().equals(fieldTargetId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public FieldTarget getFieldTarget(final AssetTypeTemplate assetTypeTemplate, final Long fieldTargetId) {
        return assetTypeTemplate.getFieldTargets().stream()
                .filter(field -> field.getId().equals(fieldTargetId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public FieldTarget createFieldTarget(final Long assetTypeTemplateId, final Long fieldId,
                                         final FieldTarget fieldTarget) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        final Field field = fieldService.getField(fieldId, false);

        fieldTarget.setAssetTypeTemplate(assetTypeTemplate);
        assetTypeTemplate.getFieldTargets().add(fieldTarget);
        fieldTarget.setField(field);

        return fieldTargetRepository.save(fieldTarget);
    }

    public FieldTarget updateFieldTarget(final Long assetTypeTemplateId, final Long fieldTargetId,
                                         final FieldTarget fieldTarget) {
        final FieldTarget targetFieldTarget = getFieldTarget(assetTypeTemplateId, fieldTargetId);

        targetFieldTarget.copyFrom(fieldTarget);

        return targetFieldTarget;
    }

    public void deleteFieldTarget(final Long assetTypeTemplateId, final Long fieldTargetId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        final FieldTarget fieldTarget = getFieldTarget(assetTypeTemplate, fieldTargetId);

        assetTypeTemplate.getFieldTargets().remove(fieldTarget);

        fieldTargetRepository.delete(fieldTarget);
    }

    public int createFieldTargetsFromAssetTypeTemplateDtos(Set<AssetTypeTemplateDto> assetTypeTemplateDtos) {
        Set<FieldTargetDto> fieldTargetDtos = getFieldTargetDtosFromAssetTypeTemplateDtos(assetTypeTemplateDtos);

        Set<Long> existingFieldTargetIds = fieldTargetRepository.findAll(FieldTargetRepository.DEFAULT_SORT)
                .stream().map(BaseEntity::getId).collect(Collectors.toSet());

        int entitySkippedCount = 0;
        for (FieldTargetDto fieldTargetDto : BaseZipImportExport.toSortedList(fieldTargetDtos)) {
            if (!existingFieldTargetIds.contains(fieldTargetDto.getId())) {
                FieldTarget fieldTarget = fieldTargetMapper.toEntity(fieldTargetDto);
                createFieldTarget(fieldTargetDto.getAssetTypeTemplateId(), fieldTargetDto.getFieldId(), fieldTarget);
            } else {
                LOG.warn("Field Target with the id " + fieldTargetDto.getId() + " already exists. Entry is ignored.");
                entitySkippedCount += 1;
            }
        }

        return entitySkippedCount;
    }

    private Set<FieldTargetDto> getFieldTargetDtosFromAssetTypeTemplateDtos(
            Set<AssetTypeTemplateDto> assetTypeTemplateDtos
    ) {
        Set<FieldTargetDto> fieldTargetDtos = new LinkedHashSet<>();
        for (AssetTypeTemplateDto assetTypeTemplateDto : assetTypeTemplateDtos) {
            fieldTargetDtos.addAll(assetTypeTemplateDto.getFieldTargets());
        }

        return fieldTargetDtos;
    }
}
