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

package io.fusion.fusionbackend.dto.mappers;

import io.fusion.fusionbackend.model.BaseEntity;

import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public interface EntityDtoMapper<T, U> {
    U toDto(T entity, boolean embedChildren);

    T toEntity(U dto);

    Set<U> toDtoSet(Set<T> entitySet, boolean embedChildren);

    Set<Long> toEntityIdSet(Set<T> entitySet);

    Set<T> toEntitySet(Set<U> dtoSet);

    static Set<Long> getSetOfEntityIds(final Set<? extends BaseEntity> entities) {
        if (entities == null) {
            return new LinkedHashSet<>();
        }
        return entities.stream().map(BaseEntity::getId).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    static List<Long> getListOfEntityIds(final List<? extends BaseEntity> entities) {
        if (entities == null) {
            return new LinkedList<>();
        }
        return entities.stream().map(BaseEntity::getId).collect(Collectors.toCollection(LinkedList::new));
    }


    static Long getEntityId(final BaseEntity entity) {
        if (entity == null) {
            return null;
        }
        return entity.getId();
    }
}
