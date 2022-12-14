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

package io.fusion.fusionbackend.service.export;

import io.fusion.fusionbackend.dto.ImportResultDto;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.service.AssetService;
import io.fusion.fusionbackend.service.CompanyService;
import io.fusion.fusionbackend.service.ngsild.NgsiLdMapper;
import io.fusion.fusionbackend.service.shacl.ShaclService;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Objects;

@Service
@Transactional
@Slf4j
public class FactoryImportExportService {

    private final NgsiLdMapper ngsiLdMapper;
    private final AssetService assetService;
    private final CompanyService companyService;
    private final ShaclService shaclService;

    public FactoryImportExportService(NgsiLdMapper ngsiLdMapper,
                                      AssetService assetService,
                                      CompanyService companyService,
                                      ShaclService shaclService) {
        this.ngsiLdMapper = ngsiLdMapper;
        this.assetService = assetService;
        this.companyService = companyService;
        this.shaclService = shaclService;
    }

    public ImportResultDto importAsset(MultipartFile file, Long companyId) throws IOException, ParseException {
        Path tempFile;
        if (Objects.requireNonNull(file.getOriginalFilename()).toLowerCase(Locale.ROOT).endsWith(".zip")) {
            tempFile = shaclService.handleDependenciesAndReturnFile(file, companyId, ".json");
        } else {
            tempFile = Files.write(Files.createTempFile(null, ".json"),
                    file.getInputStream().readAllBytes());
        }
        JSONParser jsonParser = new JSONParser();
        JSONObject jsonAsset = (JSONObject) jsonParser
                .parse(new InputStreamReader(new FileInputStream(tempFile.toFile()), StandardCharsets.UTF_8));
        Asset asset = ngsiLdMapper.mapAssetFromJson(jsonAsset, companyService.getCompany(companyId, true));
        assetService.createFactoryAssetAggregateWithGlobalId(companyId, asset.getAssetSeries().getGlobalId(), asset);
        return new ImportResultDto("Asset " + asset.getExternalName() + " added successfully");

    }
}
