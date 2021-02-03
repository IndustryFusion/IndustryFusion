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

import io.fusion.fusionbackend.dto.BaseAssetDto;
import io.fusion.fusionbackend.model.BaseAsset;
import org.springframework.stereotype.Component;

@Component
public class BaseAssetMapper {
    public void copyToDto(final BaseAsset entity, final BaseAssetDto dto) {
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setImageKey(entity.getImageKey());
    }

    public void copyToEntity(final BaseAssetDto dto, final BaseAsset entity) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setImageKey(dto.getImageKey());
    }
}
