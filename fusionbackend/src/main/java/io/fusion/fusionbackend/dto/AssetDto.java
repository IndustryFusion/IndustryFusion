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

package io.fusion.fusionbackend.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.sun.xml.bind.v2.model.core.ID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@AllArgsConstructor
public class AssetDto extends BaseAssetDto {
    private Long id;
    private Long companyId;
    private Long assetSeriesId;
    private Long roomId;

    @Builder.Default
    private Set<Long> fieldInstanceIds = new LinkedHashSet<>();

    @Builder.Default
    private Set<FieldInstanceDto> fieldInstances = new LinkedHashSet<>();

    private String externalId;
    private String controlSystemType;
    private Boolean hasGateway;
    private String gatewayConnectivity;
    protected UUID guid;
    protected Boolean ceCertified;
    protected String serialNumber;
    protected OffsetDateTime constructionDate;
    protected String protectionClass;
    protected String handbookKey;
    protected String videoKey;
    protected OffsetDateTime installationDate;

    @JsonCreator
    public AssetDto() {
    }
}
