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

package io.fusion.fusionbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import io.fusion.fusionbackend.dto.AssetTypeTemplateDto;
import io.fusion.fusionbackend.dto.mappers.AssetTypeTemplateMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Field;
import io.fusion.fusionbackend.model.FieldTarget;
import io.fusion.fusionbackend.model.enums.PublicationState;
import io.fusion.fusionbackend.ontology.OntologyBuilder;
import io.fusion.fusionbackend.repository.AssetTypeTemplateRepository;
import io.fusion.fusionbackend.repository.FieldTargetRepository;
import org.apache.jena.ontology.OntModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetTypeTemplateService {
    private final AssetTypeTemplateRepository assetTypeTemplateRepository;
    private final AssetTypeService assetTypeService;
    private final FieldTargetRepository fieldTargetRepository;
    private final FieldService fieldService;
    private final AssetTypeTemplateMapper assetTypeTemplateMapper;
    private final OntologyBuilder ontologyBuilder;

    private static final Logger LOG = LoggerFactory.getLogger(AssetTypeTemplateService.class);

    @Autowired
    public AssetTypeTemplateService(AssetTypeTemplateRepository assetTypeTemplateRepository,
                                    AssetTypeService assetTypeService,
                                    FieldTargetRepository fieldTargetRepository,
                                    FieldService fieldService, AssetTypeTemplateMapper assetTypeTemplateMapper,
                                    OntologyBuilder ontologyBuilder) {
        this.assetTypeTemplateRepository = assetTypeTemplateRepository;
        this.assetTypeService = assetTypeService;
        this.fieldTargetRepository = fieldTargetRepository;
        this.fieldService = fieldService;
        this.assetTypeTemplateMapper = assetTypeTemplateMapper;
        this.ontologyBuilder = ontologyBuilder;
    }

    public Set<AssetTypeTemplate> getAssetTypeTemplates() {
        return assetTypeTemplateRepository.findAll(AssetTypeTemplateRepository.DEFAULT_SORT);
    }

    public AssetTypeTemplate getAssetTypeTemplate(final Long assetTypeTemplateId, final boolean deep) {
        if (deep) {
            return assetTypeTemplateRepository.findDeepById(assetTypeTemplateId)
                    .orElseThrow(getAssetTypeTemplateNotFoundException(assetTypeTemplateId));
        }
        return assetTypeTemplateRepository.findById(assetTypeTemplateId)
                .orElseThrow(getAssetTypeTemplateNotFoundException(assetTypeTemplateId));
    }

    private Supplier<ResourceNotFoundException> getAssetTypeTemplateNotFoundException(Long assetTypeTemplateId) {
        LOG.debug("AssetTypeTemplate with ID {} not found", assetTypeTemplateId);
        return ResourceNotFoundException::new;
    }

    public AssetTypeTemplate createAssetTypeTemplate(final Long assetTypeId,
                                                     final AssetTypeTemplate assetTypeTemplate) {
        final AssetType assetType = assetTypeService.getAssetType(assetTypeId);

        validate(assetTypeTemplate, assetType);

        assetTypeTemplate.setAssetType(assetType);

        return assetTypeTemplateRepository.save(assetTypeTemplate);
    }

    private void validate(AssetTypeTemplate assetTypeTemplate, AssetType assetType) {
        Objects.requireNonNull(assetTypeTemplate.getPublicationState(), "Publication state must be set but is null.");

        if (assetTypeTemplate.getPublicationState().equals(PublicationState.PUBLISHED)) {
            Objects.requireNonNull(assetTypeTemplate.getPublishedDate(),
                    "Published date must be set for publication state PUBLISHED");
        } else if (assetTypeTemplate.getPublicationState().equals(PublicationState.DRAFT)) {
            if (Objects.nonNull(assetTypeTemplate.getPublishedDate())) {
                throw new RuntimeException("Published date not allowed for publication state DRAFT");
            }
        } else {
            throw new RuntimeException("Unknown publication state: " + assetTypeTemplate.getPublicationState());
        }

        if (assetType != null && existsDraftToAssetType(assetType)) {
            String exception = "It is forbidden to create a new asset type template draft if another one exists.";
            throw new RuntimeException(exception);
        }

    }

    private boolean existsDraftToAssetType(AssetType assetType) {
        final Iterable<AssetTypeTemplate> assetTypeTemplatesOfAssetType = this.assetTypeTemplateRepository
                .findAllByAssetType(assetType);

        for (AssetTypeTemplate assetTypeTemplate : assetTypeTemplatesOfAssetType) {
            if (assetTypeTemplate.getPublicationState().equals(PublicationState.DRAFT)) {
                return true;
            }
        }

        return false;
    }

    public AssetTypeTemplate updateAssetTypeTemplate(final Long assetTypeTemplateId,
                                                     final AssetTypeTemplate sourceAssetTypeTemplate) {
        final AssetTypeTemplate targetAssetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);

        targetAssetTypeTemplate.copyFrom(sourceAssetTypeTemplate);

        return targetAssetTypeTemplate;
    }

    public Long getNextPublishVersion(final Long assetTypeId) {
        final List<AssetTypeTemplate> assetTypeTemplates = this.assetTypeTemplateRepository
                .findAllByAssetTypeId(assetTypeId);
        final Optional<Long> maxPublishedVersion = assetTypeTemplates.stream()
                .filter(assetTypeTemplate -> assetTypeTemplate.getPublicationState().equals(PublicationState.PUBLISHED)
                        && assetTypeId.equals(assetTypeTemplate.getAssetType().getId()))
                .map(AssetTypeTemplate::getPublishedVersion)
                .max(Long::compare);

        return maxPublishedVersion.isEmpty() ? 1 : maxPublishedVersion.get() + 1;
    }

    public void deleteAssetTypeTemplate(final Long assetTypeTemplateId) {

        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId,
                false);

        assetTypeTemplateRepository.delete(assetTypeTemplate);
    }

    public Set<FieldTarget> getFieldTargets(final Long assetTypeTemplateId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        return assetTypeTemplate.getFieldTargets();
    }

    public FieldTarget getFieldTarget(final Long assetTypeTemplateId, final Long fieldTargetId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        return assetTypeTemplate.getFieldTargets().stream()
                .filter(field -> field.getId().equals(fieldTargetId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public FieldTarget getFieldTarget(final AssetTypeTemplate assetTypeTemplate, final Long fieldTargetId) {
        return assetTypeTemplate.getFieldTargets().stream()
                .filter(field -> field.getId().equals(fieldTargetId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public FieldTarget createFieldTarget(final Long assetTypeTemplateId, final Long fieldId,
                                         final FieldTarget fieldTarget) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        final Field field = fieldService.getField(fieldId, false);

        fieldTarget.setAssetTypeTemplate(assetTypeTemplate);
        assetTypeTemplate.getFieldTargets().add(fieldTarget);
        fieldTarget.setField(field);

        return fieldTargetRepository.save(fieldTarget);
    }

    public FieldTarget updateFieldTarget(final Long assetTypeTemplateId, final Long fieldTargetId,
                                         final FieldTarget fieldTarget) {
        final FieldTarget targetFieldTarget = getFieldTarget(assetTypeTemplateId, fieldTargetId);

        targetFieldTarget.copyFrom(fieldTarget);

        return targetFieldTarget;
    }

    public void deleteFieldTarget(final Long assetTypeTemplateId, final Long fieldTargetId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        final FieldTarget fieldTarget = getFieldTarget(assetTypeTemplate, fieldTargetId);

        assetTypeTemplate.getFieldTargets().remove(fieldTarget);

        fieldTargetRepository.delete(fieldTarget);
    }

    public AssetTypeTemplate setAssetType(final Long assetTypeTemplateId, final Long assetTypeId) {
        final AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId,
                false);
        final AssetType assetType = assetTypeService.getAssetType(assetTypeId);

        assetTypeTemplate.setAssetType(assetType);

        return assetTypeTemplate;
    }

    public OntModel getAssetTypeTemplateRdf(Long assetTypeTemplateId) throws IOException {
        AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, false);
        OntModel model = ontologyBuilder.buildAssetTypeTemplateOntology(assetTypeTemplate);
        return model;
    }

    public void getAssetTypeTemplateExtendedJSON(Long assetTypeTemplateId, PrintWriter writer) throws IOException {
        AssetTypeTemplate assetTypeTemplate = getAssetTypeTemplate(assetTypeTemplateId, true);
        assetTypeTemplate.setAssetSeries(null);
        assetTypeTemplate.getFieldTargets().stream().forEach(fieldTarget -> {
            fieldTarget.setAssetTypeTemplate(null);
            fieldTarget.getField().getUnit().getQuantityType().setUnits(null);
            fieldTarget.getField().getUnit().getQuantityType().setBaseUnit(null);
        });
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writeValue(writer, assetTypeTemplate);
    }

    public byte[] getAllAssetTypeTemplateDtosExtendedJson() throws IOException {
        Set<AssetTypeTemplate> assetTypeTemplates = assetTypeTemplateRepository
                .findAll(AssetTypeTemplateRepository.DEFAULT_SORT)
                .stream().filter(assetTypeTemplate -> assetTypeTemplate.getPublishedDate() != null)
                .collect(Collectors.toSet());

        Set<AssetTypeTemplateDto> publishedAssetTypeTemplatesDtos = assetTypeTemplateMapper
                .toDtoSet(assetTypeTemplates, true);

        ObjectMapper objectMapper = new ObjectMapper()
                .findAndRegisterModules().disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        String serialized = objectMapper.writeValueAsString(publishedAssetTypeTemplatesDtos);
        Set<AssetTypeTemplateDto> deserialized = objectMapper
                .readerFor(new TypeReference<Set<AssetTypeTemplateDto>>(){})
                .readValue(serialized);

        if (publishedAssetTypeTemplatesDtos.hashCode() == deserialized.hashCode()) {
            System.out.println("Test passed");
        }

        return objectMapper.writeValueAsBytes(publishedAssetTypeTemplatesDtos);
    }
}
