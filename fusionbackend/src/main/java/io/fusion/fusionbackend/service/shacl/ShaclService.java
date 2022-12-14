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

package io.fusion.fusionbackend.service.shacl;

import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.model.shacl.ShaclShape;
import io.fusion.fusionbackend.model.shacl.enums.QuantityTypeKeys;
import io.fusion.fusionbackend.service.AssetSeriesService;
import io.fusion.fusionbackend.service.AssetTypeService;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import io.fusion.fusionbackend.service.FieldService;
import io.fusion.fusionbackend.service.FieldTargetService;
import io.fusion.fusionbackend.service.QuantityTypeService;
import io.fusion.fusionbackend.service.UnitService;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.shared.SyntaxError;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static java.util.function.Predicate.not;

@Service
public class ShaclService {

    public static final String UNITS_FILENAME = "units.ttl";
    public static final String FIELDS_FILENAME = "fields.ttl";
    public static final String TEMPLATES_FILENAME = "asset_type_templates.ttl";
    public static final String SERIES_FILENAME = "asset_series.ttl";
    public static final String TYPES_FILENAME = "asset_types.ttl";
    public static final String DEPENDENCIES_FOLDER = "dependencies";

    private final ShaclFactory shaclFactory;
    private final ShaclMapper shaclMapper;
    private final FieldService fieldService;
    private final AssetTypeService assetTypeService;
    private final AssetTypeTemplateService assetTypeTemplateService;
    private final AssetSeriesService assetSeriesService;
    private final FieldTargetService fieldTargetService;
    private final UnitService unitService;
    private final QuantityTypeService quantityTypeService;

    public ShaclService(ShaclFactory shaclFactory,
                        ShaclMapper shaclMapper,
                        FieldService fieldService,
                        AssetTypeService assetTypeService,
                        AssetTypeTemplateService assetTypeTemplateService,
                        AssetSeriesService assetSeriesService,
                        FieldTargetService fieldTargetService,
                        UnitService unitService,
                        QuantityTypeService quantityTypeService) {
        this.shaclFactory = shaclFactory;
        this.shaclMapper = shaclMapper;
        this.fieldService = fieldService;
        this.assetTypeService = assetTypeService;
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.assetSeriesService = assetSeriesService;
        this.fieldTargetService = fieldTargetService;
        this.unitService = unitService;
        this.quantityTypeService = quantityTypeService;
    }

    @Transactional
    public Path handleDependenciesAndReturnFile(MultipartFile zipfile, Long companyId, String returnFileType)
            throws IOException {
        Path temp = Files.createTempDirectory(UUID.randomUUID().toString());
        byte[] buffer = new byte[1024];
        ZipInputStream zis = new ZipInputStream(zipfile.getInputStream());
        ZipEntry zipEntry = zis.getNextEntry();
        while (zipEntry != null) {
            File file = new File(
                    Paths.get(temp.toAbsolutePath().toString(),
                            zipEntry.getName())
                            .toAbsolutePath().toString());
            if (zipEntry.isDirectory()) {
                if (!file.isDirectory() && !file.mkdirs()) {
                    throw new IOException("Failed to create directory " + file);
                }
            } else {
                File parent = file.getParentFile();
                if (!parent.isDirectory() && !parent.mkdirs()) {
                    throw new IOException("Failed to create directory " + parent);
                }
                FileOutputStream fos = new FileOutputStream(file);
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    fos.write(buffer, 0, len);
                }
                fos.close();
            }
            zipEntry = zis.getNextEntry();
        }
        zis.closeEntry();
        zis.close();
        Files.list(temp)
                .map(Path::toFile)
                .filter(File::isDirectory)
                .filter(f -> f.getName().toLowerCase(Locale.ROOT).equals(DEPENDENCIES_FOLDER))
                .findAny()
                .ifPresent(d -> {
                    try {
                        handleDependencyFiles(d, companyId);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
        return Files.list(temp).filter(f -> f.getFileName().toString()
                .endsWith(returnFileType)).findFirst()
                .orElseThrow(() -> new SyntaxError("Missing root file"));
    }

    private void handleDependencyFiles(File dependencies, Long companyId) throws IOException {
        Map<String, Path> files = Arrays.stream(Objects.requireNonNull(dependencies.listFiles()))
                .collect(Collectors.toMap(File::getName, File::toPath));
        if (files.containsKey(UNITS_FILENAME)) {
            handleUnitDependencies(files.get(UNITS_FILENAME));
            Files.delete(files.get(UNITS_FILENAME));
        }
        if (files.containsKey(FIELDS_FILENAME)) {
            handleFieldDependencies(files.get(FIELDS_FILENAME));
            Files.delete(files.get(FIELDS_FILENAME));
        }
        if (files.containsKey(TYPES_FILENAME)) {
            handleAssetTypeDependencies(files.get(TYPES_FILENAME));
            Files.delete(files.get(TYPES_FILENAME));
        }
        if (files.containsKey(TEMPLATES_FILENAME)) {
            handleAssetTypeTemplateDependencies(files.get(TEMPLATES_FILENAME));
            Files.delete(files.get(TEMPLATES_FILENAME));
        }
        if (files.containsKey(SERIES_FILENAME)) {
            handleAssetSeriesDependencies(files.get(SERIES_FILENAME), companyId);
            Files.delete(files.get(SERIES_FILENAME));
        }
    }

    public Collection<ShaclShape> loadShaclShapesFromFile(Path ttl) {
        return shaclFactory.graphTriplesToShaclShapes(
                RDFDataMgr.loadModel(ttl.toAbsolutePath().toString())
                        .getGraph());
    }

    public void handleUnitDependencies(Path ttl) {
        List<ShaclShape> units = new ArrayList<>(loadShaclShapesFromFile(ttl));
        Set<String> alreadyImported = new HashSet<>();
        while (units.size() > 0) {
            for (int idx = 0; idx < units.size(); ) {
                if (!units.get(idx).containsParameter(QuantityTypeKeys.BASE_UNIT)
                        || alreadyImported.contains(units.get(idx).getStringParameter(QuantityTypeKeys.BASE_UNIT))) {
                    alreadyImported.add(ShaclHelper.createUnitIri(
                            createUnitIfNeeded(shaclMapper.mapUnit(units.get(idx)))));
                    units.remove(idx);
                } else {
                    idx++;
                }
            }
        }
    }

    public void handleFieldDependencies(Path ttl) {
        loadShaclShapesFromFile(ttl).stream()
                .filter(not(shaclMapper::fieldExists))
                .map(shaclMapper::mapField)
                .forEach(this::createFieldIfNeeded);
    }

    public void handleAssetTypeDependencies(Path ttl) {
        loadShaclShapesFromFile(ttl).stream()
                .filter(not(shaclMapper::assetTypeExists))
                .map(shaclMapper::mapAssetType)
                .forEach(this::createAssetTypeIfNeeded);
    }

    public void handleAssetTypeTemplateDependencies(Path ttl) {
        loadShaclShapesFromFile(ttl).stream()
                .filter(not(shaclMapper::assetTypeTemplateExists))
                .map(shaclMapper::mapAssetTypeTemplate)
                .forEach(this::createAssetTypeTemplateIfNeeded);
    }

    public void handleAssetSeriesDependencies(Path ttl, Long companyId) {
        loadShaclShapesFromFile(ttl).stream()
                .filter(not(shaclMapper::assetSeriesExists))
                .map(as -> shaclMapper.mapAssetSeries(as, companyId))
                .forEach(as -> createAssetSeriesIfNeeded(as, companyId));
    }

    public Unit createUnitIfNeeded(Unit unit) {
        return unitService.getAllUnits().stream()
                .filter(u -> unit.getName().equalsIgnoreCase(u.getName()))
                .filter(u -> unit.getVersion().equals(u.getVersion()))
                .findAny()
                .orElse(createUnit(unit));
    }

    protected Unit createUnit(Unit unit) {
        Optional.ofNullable(unit.getQuantityType()).ifPresent(qt ->
                unit.setQuantityType(quantityTypeService.createQuantityType(qt, qt.getId())));
        return unitService.createUnit(unit.getQuantityType().getId(), unit);

    }

    public Field createFieldIfNeeded(Field field) {
        return fieldService.getAllFields().stream()
                .filter(f -> field.getName().equalsIgnoreCase(f.getName()))
                .filter(f -> field.getVersion().equals(f.getVersion()))
                .findAny()
                .orElse(createField(field));
    }

    protected Field createField(Field field) {
        return fieldService
                .createField(field, Optional.ofNullable(field.getUnit()).map(Unit::getId).orElse(null));
    }

    public FieldTarget createFieldTargetIfNeeded(FieldTarget fieldTarget, Long assetTypeTemplateId) {
        return fieldTargetService.getAllFieldTargets().stream()
                .filter(ft -> fieldTarget.getName().equalsIgnoreCase(ft.getName()))
                .filter(ft -> fieldTarget.getVersion().equals(ft.getVersion()))
                .findAny()
                .orElse(createFieldTarget(fieldTarget, assetTypeTemplateId));
    }

    private FieldTarget createFieldTarget(FieldTarget fieldTarget, Long assetTypeTemplateId) {
        return fieldTargetService
                .createFieldTarget(assetTypeTemplateId, fieldTarget.getField().getId(), fieldTarget);
    }

    public AssetType createAssetTypeIfNeeded(AssetType assetType) {
        return assetTypeService.getAllAssetTypes().stream()
                .filter(at -> assetType.getName().equalsIgnoreCase(at.getName()))
                .filter(at -> assetType.getVersion().equals(at.getVersion()))
                .findAny()
                .orElse(createAssetType(assetType));
    }

    protected AssetType createAssetType(AssetType assetType) {
        return assetTypeService.createAssetType(assetType);
    }

    public AssetTypeTemplate createAssetTypeTemplateIfNeeded(AssetTypeTemplate assetTypeTemplate) {
        return assetTypeTemplateService.getAllAssetTypeTemplates().stream()
                .filter(att -> assetTypeTemplate.getName().equalsIgnoreCase(att.getName()))
                .filter(att -> assetTypeTemplate.getVersion().equals(att.getVersion()))
                .findAny()
                .orElse(createAssetTypeTemplate(assetTypeTemplate));

    }

    protected AssetTypeTemplate createAssetTypeTemplate(AssetTypeTemplate assetTypeTemplate) {
        AssetTypeTemplate created = assetTypeTemplateService.createAssetTypeTemplateAggregate(
                assetTypeTemplate.getAssetType().getId(),
                assetTypeTemplate);
        assetTypeTemplate.getFieldTargets().forEach(fieldTarget ->
                fieldTargetService.createFieldTarget(created.getId(), fieldTarget.getField().getId(), fieldTarget));
        return created;
    }

    public AssetSeries createAssetSeriesIfNeeded(AssetSeries assetSeries, Long companyId) {
        return assetSeriesService.getAssetSeriesSetByCompany(companyId).stream()
                .filter(as -> assetSeries.getName().equalsIgnoreCase(as.getName()))
                .filter(as -> assetSeries.getVersion().equals(as.getVersion()))
                .findAny()
                .orElse(createAssetSeries(assetSeries));
    }

    protected AssetSeries createAssetSeries(AssetSeries assetSeries) {
        AssetSeries created = assetSeriesService.createAssetSeries(
                2L,
                assetSeries.getAssetTypeTemplate().getId(),
                assetSeries.getConnectivitySettings().getConnectivityType().getId(),
                assetSeries.getConnectivitySettings().getConnectivityProtocol().getId(),
                assetSeries);
        return created;
    }

}
