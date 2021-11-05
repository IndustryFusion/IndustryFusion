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

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

public abstract class EntityDetailsDtoMapper<T, U> implements EntityDtoMapper<T, U> {

    protected abstract U toDtoDeep(T entity);

    @Override
    public U toDto(T entity, boolean embedChildren) {
        return toDtoDeep(entity);
    }

    @Override
    public T toEntity(U dto) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<U> toDtoSet(Set<T> entitySet, boolean embedChildren) {
        if (embedChildren) {
            return entitySet.stream().map(this::toDtoDeep).collect(Collectors.toCollection(LinkedHashSet::new));
        }
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<T> toEntitySet(Set<U> dtoSet) {
        throw new UnsupportedOperationException();
    }
}
