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
import io.fusion.fusionbackend.dto.UnitDto;
import io.fusion.fusionbackend.dto.mappers.UnitMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.QuantityType;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.repository.UnitRepository;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class UnitService {
    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;
    private final QuantityTypeService quantityTypeService;

    @Autowired
    public UnitService(UnitRepository unitRepository,
                       UnitMapper unitMapper,
                       @Lazy QuantityTypeService quantityTypeService) {
        this.unitRepository = unitRepository;
        this.unitMapper = unitMapper;
        this.quantityTypeService = quantityTypeService;
    }

    public Set<Unit> getAllUnits() {
        return Sets.newLinkedHashSet(unitRepository.findAll(UnitRepository.DEFAULT_SORT));
    }

    public Unit getUnit(final Long unitId) {
        return unitRepository.findById(unitId).orElseThrow(ResourceNotFoundException::new);
    }

    public Unit getUnit(final Long id, final boolean deep) {
        if (deep) {
            return unitRepository.findDeepById(id).orElseThrow(ResourceNotFoundException::new);
        }
        return unitRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
    }

    public Unit getUnit(final Long quantityTypeId, final Long unitId) {
        final QuantityType quantityType = quantityTypeService.getQuantityType(quantityTypeId);
        return quantityType.getUnits().stream()
                .filter(unit -> unit.getId().equals(unitId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }


    public Unit createUnit(final Long quantityTypeId, final Unit unit) {
        final QuantityType quantityType = quantityTypeService.getQuantityType(quantityTypeId);

        unit.setQuantityType(quantityType);
        quantityType.getUnits().add(unit);
        return unitRepository.save(unit);
    }

    public Unit updateUnit(final Long quantityTypeId, final Long unitId, final Unit sourceUnit) {
        final Unit targetUnit = getUnit(quantityTypeId, unitId);

        targetUnit.copyFrom(sourceUnit);

        return targetUnit;
    }

    public void deleteUnit(final Long quantityTypeId, final Long unitId) {
        final Unit unit = getUnit(quantityTypeId, unitId);

        unit.getQuantityType().getUnits().remove(unit);

        unitRepository.delete(unit);
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

    private Set<UnitDto> getAllAsDto() {
        Set<Unit> units = Sets.newLinkedHashSet(unitRepository.findAll(UnitRepository.DEFAULT_SORT));
        return unitMapper.toDtoSet(units, true);
    }

    public int importMultipleFromJson(byte[] fileContent) throws IOException {
        Set<UnitDto> unitDtos = BaseZipImportExport.fileContentToDtoSet(fileContent, new TypeReference<>() {
        });

        Set<Long> existingUnitIds = unitRepository
                .findAll(UnitRepository.DEFAULT_SORT)
                .stream().map(BaseEntity::getId).collect(Collectors.toSet());

        // Due to cyclic dependency of unit and quantity type first create quantity types without references to units.
        // Then we create units with setting the base unit of quantity type afterwards so that it can be persisted.
        int entitySkippedCount = quantityTypeService.createQuantityTypesFromUnitDtos(unitDtos);

        for (UnitDto unitDto : BaseZipImportExport.toSortedList(unitDtos)) {
            if (!existingUnitIds.contains(unitDto.getId())) {
                QuantityType quantityType = quantityTypeService.getQuantityType(unitDto.getQuantityTypeId());

                Unit unit = unitMapper.toEntity(unitDto);
                unit.setQuantityType(quantityType);
                createUnit(quantityType.getId(), unit);

                if (Objects.equals(unitDto.getQuantityType().getBaseUnitId(), unit.getId())) {
                    quantityTypeService.setQuantityTypeBaseUnit(quantityType.getId(), unit.getId());
                }
            } else {
                log.warn("Unit with the id " + unitDto.getId() + " already exists. Entry is ignored.");
                entitySkippedCount += 1;
            }
        }

        return entitySkippedCount;
    }
}
