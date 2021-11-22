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

import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldOption;
import io.fusion.fusionbackend.repository.FieldOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FieldOptionService {

    private final FieldOptionRepository fieldOptionRepository;

    @Autowired
    public FieldOptionService(FieldOptionRepository fieldOptionRepository) {
        this.fieldOptionRepository = fieldOptionRepository;
    }

    public FieldOption getFieldOption(final Long id) {
        return fieldOptionRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
    }

    public void deleteFieldOption(final Long id) {
        fieldOptionRepository.deleteById(id);
    }

    public FieldOption updateFieldOption(final Long fieldOptionId, final Field field,
                                         final FieldOption sourceFieldOption) {
        if (fieldOptionId == null) {
            sourceFieldOption.setField(field);
            return fieldOptionRepository.save(sourceFieldOption);
        } else {
            final FieldOption targetFieldOption = getFieldOption(fieldOptionId);
            targetFieldOption.copyFrom(sourceFieldOption);
            return targetFieldOption;
        }
    }
}
