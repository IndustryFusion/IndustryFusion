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
import com.fasterxml.jackson.databind.SerializationFeature;
import com.google.common.collect.Sets;
import io.fusion.fusionbackend.dto.AssetTypeDto;
import io.fusion.fusionbackend.dto.FieldDto;
import io.fusion.fusionbackend.dto.mappers.FieldMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldOption;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import io.fusion.fusionbackend.model.enums.FieldDataType;
import io.fusion.fusionbackend.repository.FieldOptionRepository;
import io.fusion.fusionbackend.repository.FieldRepository;
import io.fusion.fusionbackend.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Set;

@Service
@Transactional
public class FieldService {
    private final FieldRepository fieldRepository;
    private final FieldOptionRepository fieldOptionRepository;
    private final FieldMapper fieldMapper;
    private final UnitService unitService;
    private final FieldOptionService fieldOptionService;

    @Autowired
    public FieldService(FieldRepository fieldRepository, FieldOptionRepository fieldOptionRepository, FieldMapper fieldMapper,
                        UnitService unitService, FieldOptionService fieldOptionService) {
        this.fieldRepository = fieldRepository;
        this.fieldMapper = fieldMapper;
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

    public Field createField(final Field field, final Set<FieldOption> fieldOptions) {
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

    public byte[] getAllFieldDtosExtendedJson() throws IOException {
        Set<Field> fields = Sets.newLinkedHashSet(fieldRepository
                .findAll(FieldRepository.DEFAULT_SORT));

        Set<FieldDto> fieldDtos = fieldMapper.toDtoSet(fields, true);

        ObjectMapper objectMapper = new ObjectMapper()
                .findAndRegisterModules().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        String serialized = objectMapper.writeValueAsString(fieldDtos);
        Set<FieldDto> deserialized = objectMapper.readerFor(new TypeReference<Set<FieldDto>>(){})
                .readValue(serialized);

        if (fieldDtos.hashCode() == deserialized.hashCode()) {
            System.out.println("Test passed");
        }

        return objectMapper.writeValueAsBytes(fieldDtos);
    }
}
