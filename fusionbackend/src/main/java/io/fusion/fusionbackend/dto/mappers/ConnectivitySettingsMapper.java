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

import io.fusion.fusionbackend.dto.ConnectivitySettingsDto;
import io.fusion.fusionbackend.model.BaseEntity;
import io.fusion.fusionbackend.model.ConnectivityProtocol;
import io.fusion.fusionbackend.model.ConnectivitySettings;
import io.fusion.fusionbackend.model.ConnectivityType;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ConnectivitySettingsMapper implements EntityDtoMapper<ConnectivitySettings, ConnectivitySettingsDto> {

    @Override
    public ConnectivitySettingsDto toDto(ConnectivitySettings entity, boolean embedChildren) {

        ConnectivitySettingsDto dto = ConnectivitySettingsDto.builder()
                .connectionString(entity.getConnectionString())
                .build();

        ConnectivityType connectivityType = entity.getConnectivityType();
        if (connectivityType != null) {
            dto.setConnectivityTypeId(entity.getConnectivityType().getId());
        }

        ConnectivityProtocol connectivityProtocol = entity.getConnectivityProtocol();
        if (connectivityProtocol != null) {
            dto.setConnectivityProtocolId(entity.getConnectivityProtocol().getId());
        }

        return dto;
    }

    @Override
    public ConnectivitySettings toEntity(ConnectivitySettingsDto dto) {

        ConnectivitySettings connectivitySettings = new ConnectivitySettings();
        connectivitySettings.setConnectionString(dto.getConnectionString());

        return connectivitySettings;
    }

    @Override
    public Set<ConnectivitySettingsDto> toDtoSet(Set<ConnectivitySettings> entitySet, boolean embedChildren) {
        return entitySet.stream()
                .map(connectivitySettings -> toDto(connectivitySettings, false))
                .collect(Collectors.toSet());
    }

    @Override
    public Set<Long> toEntityIdSet(Set<ConnectivitySettings> entitySet) {
        return entitySet.stream()
                .map(BaseEntity::getId)
                .collect(Collectors.toSet());
    }

    @Override
    public Set<ConnectivitySettings> toEntitySet(Set<ConnectivitySettingsDto> dtoSet) {
        return dtoSet.stream()
                .map(this::toEntity)
                .collect(Collectors.toSet());
    }
}
