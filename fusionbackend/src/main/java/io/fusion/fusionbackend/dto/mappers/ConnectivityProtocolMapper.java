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

import io.fusion.fusionbackend.dto.ConnectivityProtocolDto;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.ConnectivityProtocol;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ConnectivityProtocolMapper implements EntityDtoMapper<ConnectivityProtocol, ConnectivityProtocolDto> {


    @Override
    public ConnectivityProtocolDto toDto(ConnectivityProtocol entity, boolean embedChildren) {
        return ConnectivityProtocolDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .connectionStringPattern(entity.getConnectionStringPattern())
                .build();
    }

    @Override
    public ConnectivityProtocol toEntity(ConnectivityProtocolDto dto) {
        return ConnectivityProtocol.builder()
                .id(dto.getId())
                .name(dto.getName())
                .connectionStringPattern(dto.getConnectionStringPattern())
                .build();
    }

    @Override
    public Set<ConnectivityProtocolDto> toDtoSet(Set<ConnectivityProtocol> entitySet, boolean embedChildren) {
        return entitySet.stream()
                .map(connectivityProtocol -> toDto(connectivityProtocol, embedChildren))
                .collect(Collectors.toSet());
    }

    @Override
    public Set<Long> toEntityIdSet(Set<ConnectivityProtocol> entitySet) {
        return entitySet.stream()
                .map(BaseEntity::getId)
                .collect(Collectors.toSet());
    }

    @Override
    public Set<ConnectivityProtocol> toEntitySet(Set<ConnectivityProtocolDto> dtoSet) {
        return dtoSet.stream()
                .map(this::toEntity)
                .collect(Collectors.toSet());
    }
}
