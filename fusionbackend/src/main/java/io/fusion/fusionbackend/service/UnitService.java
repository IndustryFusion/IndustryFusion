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
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.QuantityType;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Set;

@Service
@Transactional
public class UnitService {
    private final UnitRepository unitRepository;
    private final QuantityTypeService quantityTypeService;

    @Autowired
    public UnitService(UnitRepository unitRepository, @Lazy QuantityTypeService quantityTypeService) {
        this.unitRepository = unitRepository;
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
        unit.setCreationDate(new Date());
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
}
