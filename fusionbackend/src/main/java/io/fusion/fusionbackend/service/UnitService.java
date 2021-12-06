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
import io.fusion.fusionbackend.dto.FieldDto;
import io.fusion.fusionbackend.dto.UnitDto;
import io.fusion.fusionbackend.dto.mappers.UnitMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.QuantityType;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import io.fusion.fusionbackend.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Set;

@Service
@Transactional
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

    public byte[] getAllUnitDtosExtendedJson() throws IOException {
        Set<Unit> units = Sets.newLinkedHashSet(unitRepository.findAll(UnitRepository.DEFAULT_SORT));

        Set<UnitDto> unitDtos = unitMapper.toDtoSet(units, true);

        ObjectMapper objectMapper = new ObjectMapper()
                .findAndRegisterModules().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        String serialized = objectMapper.writeValueAsString(unitDtos);
        Set<UnitDto> deserialized = objectMapper.readerFor(new TypeReference<Set<UnitDto>>(){})
                .readValue(serialized);

        if (unitDtos.hashCode() == deserialized.hashCode()) {
            System.out.println("Test passed");
        }

        return objectMapper.writeValueAsBytes(unitDtos);
    }
}
