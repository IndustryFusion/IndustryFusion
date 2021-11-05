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

import io.fusion.fusionbackend.dto.ConnectivityTypeDto;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.ConnectivityType;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ConnectivityTypeMapper implements EntityDtoMapper<ConnectivityType, ConnectivityTypeDto> {

    private final ConnectivityProtocolMapper connectivityProtocolMapper;

    public ConnectivityTypeMapper(ConnectivityProtocolMapper connectivityProtocolMapper) {
        this.connectivityProtocolMapper = connectivityProtocolMapper;
    }

    @Override
    public ConnectivityTypeDto toDto(ConnectivityType entity, boolean embedChildren) {
        return ConnectivityTypeDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .name(entity.getName())
                .infoText(entity.getInfoText())
                .availableProtocols(connectivityProtocolMapper.toDtoSet(entity.getAvailableProtocols(), false))
                .build();
    }

    @Override
    public ConnectivityType toEntity(ConnectivityTypeDto dto) {
        return ConnectivityType.builder()
                .id(dto.getId())
                .version(dto.getVersion())
                .name(dto.getName())
                .infoText(dto.getInfoText())
                .availableProtocols(connectivityProtocolMapper.toEntitySet(dto.getAvailableProtocols()))
                .build();
    }

    @Override
    public Set<ConnectivityTypeDto> toDtoSet(Set<ConnectivityType> entitySet, boolean embedChildren) {
        return entitySet.stream()
                .map(connectivityType -> toDto(connectivityType, false))
                .collect(Collectors.toSet());
    }

    @Override
    public Set<Long> toEntityIdSet(Set<ConnectivityType> entitySet) {
        return entitySet.stream().map(BaseEntity::getId).collect(Collectors.toSet());
    }

    @Override
    public Set<ConnectivityType> toEntitySet(Set<ConnectivityTypeDto> dtoSet) {
        return dtoSet.stream()
                .map(this::toEntity)
                .collect(Collectors.toSet());
    }
}
