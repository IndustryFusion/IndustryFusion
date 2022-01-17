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
import io.fusion.fusionbackend.dto.ProcessingResultDto;
import io.fusion.fusionbackend.dto.QuantityTypeDto;
import io.fusion.fusionbackend.dto.UnitDto;
import io.fusion.fusionbackend.dto.mappers.QuantityTypeMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.QuantityType;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.repository.QuantityTypeRepository;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class QuantityTypeService {
    private final QuantityTypeRepository quantityTypeRepository;
    private final QuantityTypeMapper quantityTypeMapper;
    private final UnitService unitService;

    @Autowired
    public QuantityTypeService(QuantityTypeRepository quantityTypeRepository,
                               QuantityTypeMapper quantityTypeMapper,
                               @Lazy UnitService unitService) {
        this.quantityTypeRepository = quantityTypeRepository;
        this.quantityTypeMapper = quantityTypeMapper;
        this.unitService = unitService;
    }

    public Set<QuantityType> getAllQuantityTypes() {
        return Sets.newLinkedHashSet(quantityTypeRepository.findAll(QuantityTypeRepository.DEFAULT_SORT));
    }

    public QuantityType getQuantityType(final Long quantityTypeId) {
        return quantityTypeRepository.findById(quantityTypeId).orElseThrow(ResourceNotFoundException::new);
    }

    public QuantityType createQuantityType(final QuantityType newQuantityType, final Long baseUnitId) {
        final QuantityType persistedQuantityType = quantityTypeRepository.save(newQuantityType);
        if (baseUnitId != null && baseUnitId > 0) {
            return setQuantityTypeBaseUnit(persistedQuantityType.getId(), baseUnitId);
        } else {
            return persistedQuantityType;
        }
    }

    public QuantityType updateQuantityType(final Long unitId, final QuantityType sourceQuantityType) {
        final QuantityType targetQuantityType = getQuantityType(unitId);

        targetQuantityType.copyFrom(sourceQuantityType);

        return targetQuantityType;
    }

    public void deleteQuantityType(final Long id) {
        quantityTypeRepository.delete(getQuantityType(id));
    }

    public QuantityType setQuantityTypeBaseUnit(final Long quantityTypeId, final Long baseUnitId) {
        final QuantityType quantityType = getQuantityType(quantityTypeId);
        final Unit baseUnit = unitService.getUnit(baseUnitId);
        quantityType.setBaseUnit(baseUnit);
        return quantityType;
    }

    public ProcessingResultDto createQuantityTypesFromUnitDtos(Set<UnitDto> unitDtos) {
        final ProcessingResultDto result = new ProcessingResultDto();
        Set<QuantityTypeDto> quantityTypeDtos = unitDtos.stream().map(UnitDto::getQuantityType)
                .collect(Collectors.toSet());
        Set<Long> existingQuantityTypeIds = quantityTypeRepository
                .findAll(QuantityTypeRepository.DEFAULT_SORT)
                .stream().map(BaseEntity::getId).collect(Collectors.toSet());

        for (QuantityTypeDto quantityTypeDto : BaseZipImportExport.toSortedList(quantityTypeDtos)) {
            if (!existingQuantityTypeIds.contains(quantityTypeDto.getId())) {
                QuantityType quantityType = quantityTypeMapper.toEntity(quantityTypeDto);
                Long noBaseUnitYetDueToCyclicDependency = null;

                createQuantityType(quantityType, noBaseUnitYetDueToCyclicDependency);
                result.incHandled();
            } else {
                log.warn("Quantity Type with the id " + quantityTypeDto.getId() + " already exists. Entry is ignored.");
                result.incSkipped();
            }
        }

        return result;
    }
}
