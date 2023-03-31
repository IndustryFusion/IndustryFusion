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
import io.fusion.fusionbackend.model.Unit;
import io.fusion.fusionbackend.model.shacl.ShaclShape;
import io.fusion.fusionbackend.service.AssetTypeTemplateService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ShaclBuilder {

    AssetTypeTemplateService assetTypeTemplateService;
    private final ShaclMapper shaclMapper;

    public ShaclBuilder(AssetTypeTemplateService assetTypeTemplateService,
                        ShaclMapper shaclMapper
    ) {
        this.assetTypeTemplateService = assetTypeTemplateService;
        this.shaclMapper = shaclMapper;
    }

    public void buildAssetTypeTemplatePackage(OutputStream stream, AssetTypeTemplate assetTypeTemplate)
            throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        String basename = assetTypeTemplate.getName().replaceFirst(".*[/#](\\w+).*","$1");
        try (ZipOutputStream zos = new ZipOutputStream(bos)) {
            addShaclToZip(
                    zos,
                    shaclMapper.mapFromAssetTypeTemplate(assetTypeTemplate),
                    ShaclHelper.toCamelCase(basename) + "_v"
                            + assetTypeTemplate.getVersion() + ".ttl");
            addFolderToZip(zos, ShaclService.DEPENDENCIES_FOLDER + "/");
            addDependencyAssetTypeTemplates(zos, ShaclHelper.asSet(assetTypeTemplate));
        } catch (IOException ioe) {
            ioe.printStackTrace();
            throw new IOException(ioe.getMessage());
        }
        stream.write(bos.toByteArray());
        stream.close();

    }

    public void buildAssetSeriesPackage(OutputStream stream, AssetSeries assetSeries)
            throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(bos)) {
            addShaclToZip(
                    zos,
                    shaclMapper.mapFromAssetSeries(assetSeries),
                    ShaclHelper.toCamelCase(assetSeries.getName()) + "_v"
                            + assetSeries.getVersion() + ".ttl");
            addFolderToZip(zos, ShaclService.DEPENDENCIES_FOLDER + "/");
            addDependencyAssetTypeTemplates(zos, ShaclHelper.asSet(assetSeries.getAssetTypeTemplate()));
        } catch (IOException ioe) {
            ioe.printStackTrace();
            throw new IOException(ioe.getMessage());
        }
        stream.write(bos.toByteArray());
        stream.close();

    }

    public void addDependencyAssetSeries(ZipOutputStream zip, AssetSeries assetSeries) throws IOException {
        addShaclToZip(zip,
                shaclMapper.mapFromAssetSeries(assetSeries),
                ShaclService.DEPENDENCIES_FOLDER + "/" + ShaclService.SERIES_FILENAME);
        addDependencyAssetTypeTemplates(zip, ShaclHelper.findAssetSeriesDependencies(ShaclHelper.asSet(assetSeries)));
    }

    private void addDependencyAssetTypeTemplates(ZipOutputStream zip, Set<AssetTypeTemplate> assetTypeTemplates)
            throws IOException {
        addShaclToZip(zip,
                shaclMapper.mapFromAssetTypeTemplates(assetTypeTemplates),
                ShaclService.DEPENDENCIES_FOLDER + "/" + ShaclService.TEMPLATES_FILENAME);
        addDependencyAssetTypes(zip, ShaclHelper.findAssetTypeDependencies(assetTypeTemplates));
        addDependencyFields(zip, ShaclHelper.findFieldDependencies(assetTypeTemplates));
    }

    private void addDependencyAssetTypes(ZipOutputStream zip, Set<AssetType> assetTypes) throws IOException {
        addShaclToZip(zip,
                shaclMapper.mapFromAssetTypes(assetTypes),
                ShaclService.DEPENDENCIES_FOLDER + "/" + ShaclService.TYPES_FILENAME);
    }

    private void addDependencyFields(ZipOutputStream zip, Set<Field> fields) throws IOException {
        addShaclToZip(zip,
                shaclMapper.mapFromFields(fields),
                ShaclService.DEPENDENCIES_FOLDER + "/" + ShaclService.FIELDS_FILENAME);
        addDependenciyUnits(zip, ShaclHelper.findUnitDependencies(fields));
    }

    private void addDependenciyUnits(ZipOutputStream zip, Set<Unit> units) throws IOException {
        addShaclToZip(zip,
                shaclMapper.mapFromUnits(units),
                ShaclService.DEPENDENCIES_FOLDER + "/" + ShaclService.UNITS_FILENAME);
    }

    public void addFolderToZip(ZipOutputStream zip, String folder) throws IOException {
        ZipEntry entry = new ZipEntry(folder);
        entry.setComment("All needed dependencies");
        zip.putNextEntry(entry);
    }

    private void addShaclToZip(ZipOutputStream zip, ShaclShape shape, String filename)
            throws IOException {
        ZipEntry entry = new ZipEntry(filename);
        zip.putNextEntry(entry);
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        ShaclWriter.out(os, shape, ShaclPrefixes.getDefaultPrefixes());
        zip.write(os.toByteArray());
    }

    private void addShaclToZip(ZipOutputStream zip, Set<ShaclShape> shapes, String filename) throws IOException {
        ZipEntry entry = new ZipEntry(filename);
        zip.putNextEntry(entry);
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        ShaclWriter.out(os, shapes, ShaclPrefixes.getDefaultPrefixes());
        os.close();
        zip.write(os.toByteArray());
    }

}