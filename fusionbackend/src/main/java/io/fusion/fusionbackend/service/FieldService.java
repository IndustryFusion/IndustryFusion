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

import com.amazonaws.services.pi.model.InvalidArgumentException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import io.fusion.fusionbackend.dto.FieldDto;
import io.fusion.fusionbackend.dto.mappers.FieldMapper;
import io.fusion.fusionbackend.dto.mappers.FieldOptionMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldOption;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import io.fusion.fusionbackend.model.enums.FieldDataType;
import io.fusion.fusionbackend.repository.FieldOptionRepository;
import io.fusion.fusionbackend.repository.FieldRepository;
import io.fusion.fusionbackend.repository.UnitRepository;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class FieldService {
    private final FieldRepository fieldRepository;
    private final FieldOptionRepository fieldOptionRepository;
    private final FieldMapper fieldMapper;
    private final FieldOptionMapper fieldOptionMapper;
    private final UnitService unitService;
    private final FieldOptionService fieldOptionService;

    @Autowired
    public FieldService(FieldRepository fieldRepository,
                        FieldOptionRepository fieldOptionRepository,
                        FieldMapper fieldMapper,
                        FieldOptionMapper fieldOptionMapper,
                        UnitService unitService,
                        FieldOptionService fieldOptionService) {
        this.fieldRepository = fieldRepository;
        this.fieldMapper = fieldMapper;
        this.fieldOptionMapper = fieldOptionMapper;
        this.fieldOptionRepository = fieldOptionRepository;
        this.unitService = unitService;
        this.fieldOptionService = fieldOptionService;
    }

    public Set<Field> getAllFields() {
        return Sets.newLinkedHashSet(fieldRepository.findAll(UnitRepository.DEFAULT_SORT));
    }

    public Field getField(final Long id, final boolean deep) {
        if (deep) {
            return fieldRepository.findDeepById(id).orElseThrow(ResourceNotFoundException::new);
        }
        return fieldRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
    }

    public Field createField(final Field field, final Long unitId) {
        final Unit unit = unitService.getUnit(unitId);
        field.setUnit(unit);
        return fieldRepository.save(field);
    }

    public Field createFieldWithOptions(final Field field, final Set<FieldOption> fieldOptions) {
        Field createdField = fieldRepository.save(field);
        fieldOptions.forEach(fieldOption -> fieldOption.setField(createdField));
        fieldOptionRepository.saveAll(fieldOptions);
        return createdField;
    }

    public Field linkFieldUnit(final Long fieldId, final Long unitId) {
        final Field field = getField(fieldId, false);
        final Unit unit = unitService.getUnit(unitId);
        field.setUnit(unit);
        return field;
    }

    public Field updateField(final Long fieldId, final Field sourceField, final Long unitId) {
        final Field targetField = getField(fieldId, false);
        Set<FieldOption> initialOptions = targetField.getOptions();
        targetField.copyFrom(sourceField);

        if (unitId != null) {
            final Unit unit = unitService.getUnit(unitId);
            targetField.setUnit(unit);
        }
        if (sourceField.getDataType() == FieldDataType.ENUM) {
            for (FieldOption option : initialOptions) {
                if (!sourceField.getOptions().contains(option)) {
                    fieldOptionService.deleteFieldOption(option.getId());
                }
            }
            sourceField.getOptions().forEach(option -> fieldOptionService.updateFieldOption(option.getId(), targetField,
                    option));
            targetField.setOptions(sourceField.getOptions());
        }
        return targetField;
    }

    public void deleteField(final Long id) {
        fieldRepository.delete(getField(id, false));
    }

    public byte[] exportAllToJson() throws IOException {
        ObjectMapper objectMapper = BaseZipImportExport.getNewObjectMapper();
        return objectMapper.writeValueAsBytes(BaseZipImportExport.toSortedList(getAllAsDto()));
    }

    public Boolean exportAllToJsonFile(final File file, boolean overwrite) throws IOException {
        if (file.exists() && !overwrite) {
            return false;
        }

        ObjectMapper objectMapper = BaseZipImportExport.getNewObjectMapper();
        objectMapper.writeValue(file, getAllAsDto());
        return true;
    }

    private Set<FieldDto> getAllAsDto() {
        Set<Field> fields = Sets.newLinkedHashSet(fieldRepository.findAll(FieldRepository.DEFAULT_SORT));
        return fieldMapper.toDtoSet(fields, true);
    }

    public int importMultipleFromJson(byte[] fileContent) throws IOException {
        Set<FieldDto> fieldDtos = BaseZipImportExport.fileContentToDtoSet(fileContent, new TypeReference<>() {
        });
        Set<Long> existingFieldIds = fieldRepository
                .findAll(FieldRepository.DEFAULT_SORT)
                .stream().map(BaseEntity::getId).collect(Collectors.toSet());

        int entitySkippedCount = 0;
        for (FieldDto fieldDto : BaseZipImportExport.toSortedList(fieldDtos)) {
            if (!existingFieldIds.contains(fieldDto.getId())) {
                Field field = fieldMapper.toEntity(fieldDto);

                if (fieldDto.getEnumOptions() != null && fieldDto.getDataType() == FieldDataType.ENUM) {
                    createFieldWithOptions(field, fieldOptionMapper.toEntitySet(fieldDto.getEnumOptions()));
                } else if (fieldDto.getUnitId() != null) {
                    createField(field, fieldDto.getUnitId());
                } else {
                    throw new InvalidArgumentException("Field with the id " + fieldDto.getId() + " misses a unit.");
                }
            } else {
                log.warn("Field with the id " + fieldDto.getId() + " already exists. Entry is ignored.");
                entitySkippedCount += 1;
            }
        }

        return entitySkippedCount;
    }
}
