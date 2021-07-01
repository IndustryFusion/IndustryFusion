package io.fusion.fusionbackend.rest.fleetmanager;

import io.fusion.fusionbackend.dto.AssetSeriesDto;
import io.fusion.fusionbackend.dto.mappers.AssetSeriesMapper;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.AssetSeriesDraftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@IsFleetUser
public class AssetSeriesDraftRestService {

    private final AssetSeriesMapper assetSeriesMapper;
    private final AssetSeriesDraftService assetSeriesDraftService;

    @Autowired
    public AssetSeriesDraftRestService(AssetSeriesMapper assetSeriesMapper, AssetSeriesDraftService assetSeriesDraftService) {
        this.assetSeriesMapper = assetSeriesMapper;
        this.assetSeriesDraftService = assetSeriesDraftService;
    }

    @GetMapping(path = "/companies/{companyId}/assettypetemplates/{assetTypeTemplateId}/init-asset-serie-draft/")
    public AssetSeriesDto getAssetSeriesFromAssetTypeTemplate(@PathVariable final Long assetTypeTemplateId,
                                                              @PathVariable final Long companyId,
                                                              @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return assetSeriesMapper.toDto(
                assetSeriesDraftService.getAssetSeriesFromAssetTypeTemplate(companyId, assetTypeTemplateId),
                embedChildren);
    }

}
