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

package io.fusion.fusionbackend.rest.fleetmanager;

import io.fusion.fusionbackend.dto.AssetDetailsDto;
import io.fusion.fusionbackend.dto.AssetDto;
import io.fusion.fusionbackend.dto.FieldInstanceDto;
import io.fusion.fusionbackend.dto.mappers.AssetDetailsMapper;
import io.fusion.fusionbackend.dto.mappers.AssetMapper;
import io.fusion.fusionbackend.dto.mappers.FieldInstanceMapper;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.ontology.OntologyUtil;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.AssetService;
import org.apache.jena.ontology.OntModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

@RestController
@IsFleetUser
public class FleetAssetRestService {
    private final AssetService assetService;
    private final AssetMapper assetMapper;
    private final FieldInstanceMapper fieldInstanceMapper;
    private final AssetDetailsMapper assetDetailsMapper;


    @Autowired
    public FleetAssetRestService(AssetService assetService,
                                 AssetMapper assetMapper,
                                 FieldInstanceMapper fieldInstanceMapper,
                                 AssetDetailsMapper assetDetailsMapper) {
        this.assetService = assetService;
        this.assetMapper = assetMapper;
        this.fieldInstanceMapper = fieldInstanceMapper;
        this.assetDetailsMapper = assetDetailsMapper;
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/")
    public Set<AssetDto> getAssets(@PathVariable final Long companyId,
                                   @PathVariable final Long assetSeriesId,
                                   @RequestParam(defaultValue = "true") final boolean embedChildren) {
        return assetMapper.toDtoSet(assetService.getAssetsOverAssetSeries(companyId, assetSeriesId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/{assetId}")
    public AssetDto getAsset(@PathVariable final Long companyId,
                             @PathVariable final Long assetSeriesId,
                             @PathVariable final Long assetId,
                             @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetMapper.toDto(assetService.getAssetOverAssetSeries(companyId, assetSeriesId, assetId),
                embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/{assetId}/export")
    public void getAsRdfExport(@PathVariable final Long companyId,
                               @PathVariable final Long assetSeriesId,
                               @PathVariable final Long assetId,
                               HttpServletResponse response) throws IOException {

        OntModel model = assetService.getAssetSeriesRdf(companyId, assetSeriesId, assetId);
        OntologyUtil.writeOwlOntologyModelToStreamUsingJena(model, response.getOutputStream());
    }

    @GetMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/subsystemcandidates")
    public Set<AssetDetailsDto> getSubsystemCandidates(@PathVariable final Long companyId,
                                  @PathVariable final Long assetSeriesId) {
        return assetDetailsMapper.toDtoSet(assetService.findSubsystemCandidates(companyId, assetSeriesId), true);
    }

    @GetMapping(path = "/companies/{companyId}/fleetassetdetails")
    public Set<AssetDetailsDto> getAssetDetails(@PathVariable final Long companyId,
                                                @RequestParam(defaultValue = "true") final boolean embedChildren) {
        Set<Asset> assetSet = assetService.getAssetsByCompany(companyId);
        return assetDetailsMapper.toDtoSet(assetSet, embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/fleetassetdetails/{assetDetailsId}")
    public AssetDetailsDto getSingleAssetDetails(@PathVariable final Long companyId,
                                                 @PathVariable final Long assetDetailsId,
                                                 @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetDetailsMapper.toDto(assetService.getAssetById(assetDetailsId), embedChildren);
    }

    @PutMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/{assetId}")
    public AssetDto updateAsset(@PathVariable final Long companyId,
                                @PathVariable final Long assetSeriesId,
                                @PathVariable final Long assetId,
                                @RequestBody final AssetDto assetDto,
                                @RequestParam(defaultValue = "true") final boolean embedChildren) {
        return assetMapper.toDto(assetService.updateAssetSeriesAsset(companyId, assetSeriesId, assetId,
                assetMapper.toEntity(assetDto)),
                embedChildren);
    }

    @PatchMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets/{assetId}/company-transfer")
    public AssetDto transferFleetAssetToFactory(@PathVariable final Long companyId,
                                                @PathVariable final Long assetSeriesId,
                                                @PathVariable final Long assetId,
                                                @RequestBody final Long targetCompanyId,
                                                @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetMapper.toDto(assetService.transferFromFleetToFactory(companyId, targetCompanyId,
                assetSeriesId, assetId),
                embedChildren);
    }

    @PostMapping(path = "/companies/{companyId}/assetseries/{assetSeriesId}/assets")
    public AssetDto createAsset(@PathVariable final Long companyId,
                                @PathVariable final Long assetSeriesId,
                                @RequestBody final AssetDto assetDto) {
        return assetMapper.toDto(
                assetService.createFleetAssetAggregate(companyId, assetSeriesId, assetMapper.toEntity(assetDto)),
                true);
    }

    @GetMapping(path = "/companies/{companyId}/factorysites/{factorySiteId}/rooms/{roomId}/assets/{assetId}/"
            + "fieldinstances")
    public Set<FieldInstanceDto> getFieldInstancesCheckFullPath(
            @PathVariable final Long companyId,
            @PathVariable final Long factorySiteId,
            @PathVariable final Long roomId,
            @PathVariable final Long assetId,
            @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return fieldInstanceMapper.toDtoSet(
                assetService.getFieldInstancesCheckFullPath(companyId, factorySiteId, roomId, assetId), embedChildren);
    }

    @GetMapping(path = "/companies/{companyId}/assets/{assetId}/fieldinstances")
    public List<FieldInstanceDto> getFieldInstances(@PathVariable final Long companyId,
                                                   @PathVariable final Long assetId,
                                                   @RequestParam(defaultValue = "false") final boolean embedChildren) {
        Set<FieldInstanceDto> unsortedFieldInstances = fieldInstanceMapper
                .toDtoSet(assetService.getFieldInstances(companyId, assetId), embedChildren);

        List<FieldInstanceDto> sortedFieldInstances = new ArrayList<>(unsortedFieldInstances);
        sortedFieldInstances.sort(Comparator.comparing(FieldInstanceDto::getId));
        return  sortedFieldInstances;
    }

    @GetMapping(path = "/companies/{companyId}/assets/{assetId}/fieldinstances/{fieldInstanceId}")
    public FieldInstanceDto getFieldInstance(@PathVariable final Long companyId,
                                             @PathVariable final Long assetId,
                                             @PathVariable final Long fieldInstanceId,
                                             @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return fieldInstanceMapper.toDto(
                assetService.getFieldInstance(companyId, assetId, fieldInstanceId), embedChildren);
    }
}
