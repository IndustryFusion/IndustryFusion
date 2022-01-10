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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.fusion.fusionbackend.dto.AssetDto;
import io.fusion.fusionbackend.dto.FieldInstanceDto;
import io.fusion.fusionbackend.dto.mappers.AssetMapper;
import io.fusion.fusionbackend.dto.mappers.FieldSourceMapper;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.FieldSource;
import io.fusion.fusionbackend.model.Room;
import io.fusion.fusionbackend.repository.AssetRepository;
import io.fusion.fusionbackend.repository.FieldInstanceRepository;
import io.fusion.fusionbackend.service.export.BaseZipImportExport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class AssetService {
    private final AssetRepository assetRepository;
    private final AssetMapper assetMapper;
    private final FieldInstanceRepository fieldInstanceRepository;
    private final RoomService roomService;
    private final AssetSeriesService assetSeriesService;
    private final CompanyService companyService;
    private final FactorySiteService factorySiteService;
    private final FieldInstanceService fieldInstanceService;
    private final FieldSourceMapper fieldSourceMapper;
    private final NgsiLdSerializer ngsiLdSerializer;
    private final NgsiLdBrokerService ngsiLdBrokerService;

    @Autowired
    public AssetService(AssetRepository assetRepository,
                        @Lazy AssetMapper assetMapper,
                        FieldInstanceRepository fieldInstanceRepository,
                        RoomService roomService,
                        AssetSeriesService assetSeriesService,
                        CompanyService companyService,
                        FactorySiteService factorySiteService,
                        FieldInstanceService fieldInstanceService,
                        FieldSourceMapper fieldSourceMapper,
                        NgsiLdSerializer ngsiLdSerializer,
                        NgsiLdBrokerService ngsiLdBrokerService) {
        this.assetRepository = assetRepository;
        this.assetMapper = assetMapper;
        this.fieldInstanceRepository = fieldInstanceRepository;
        this.roomService = roomService;
        this.assetSeriesService = assetSeriesService;
        this.companyService = companyService;
        this.factorySiteService = factorySiteService;
        this.fieldInstanceService = fieldInstanceService;
        this.fieldSourceMapper = fieldSourceMapper;
        this.ngsiLdSerializer = ngsiLdSerializer;
        this.ngsiLdBrokerService = ngsiLdBrokerService;
    }

    public Asset getAssetById(final Long assetId) {
        return assetRepository.findById(assetId).orElseThrow(ResourceNotFoundException::new);
    }

    private Set<Asset> getAssetsByAssetSeries(final Long assetSeriesId) {
        return assetRepository.findAllByAssetSeriesId(AssetRepository.DEFAULT_SORT, assetSeriesId);
    }

    private Asset getAssetByAssetSeries(final Long assetSeriesId, final Long assetId) {
        return assetRepository.findByAssetSeriesIdAndId(assetSeriesId, assetId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    private Set<Asset> getAssetsByRoom(final Long roomId) {
        return assetRepository.findAllByRoomId(AssetRepository.DEFAULT_SORT, roomId);
    }

    private Asset getAssetByRoom(final Long roomId, final Long assetId) {
        return assetRepository.findByRoomIdAndId(roomId, assetId).orElseThrow(ResourceNotFoundException::new);
    }

    public Set<Asset> getAssetsByCompany(final Long companyId) {
        return assetRepository.findAllByCompanyId(AssetRepository.DEFAULT_SORT, companyId);
    }

    public Asset getAssetByCompanyAndGlobalId(final Long companyId, final String assetGlobalId) {
        return assetRepository.findByCompanyIdAndGlobalId(companyId, assetGlobalId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    public Set<Asset> getAssetsByFactorySite(final Long companyId, final Long factorySiteId) {
        // Make sure factory site belongs to company
        factorySiteService.getFactorySiteByCompany(companyId, factorySiteId, false);
        return assetRepository.findAllByFactorySiteId(AssetRepository.DEFAULT_SORT, factorySiteId);
    }

    public Asset getAssetByCompany(final Long companyId, final Long assetId) {
        return assetRepository.findByCompanyIdAndId(companyId, assetId).orElseThrow(ResourceNotFoundException::new);
    }

    public Set<Asset> getAssetsCheckFullPath(final Long companyId, final Long factorySiteId, final Long roomId) {
        // Make sure room and factory site belongs to company
        roomService.getRoomCheckFullPath(companyId, factorySiteId, roomId, false);
        return getAssetsByRoom(roomId);
    }

    public Asset getAssetCheckFullPath(final Long companyId, final Long factorySiteId, final Long roomId,
                                       final Long assetId) {
        final Asset foundAsset = getAssetByRoom(roomId, assetId);
        if (!foundAsset.getRoom().getFactorySite().getId().equals(factorySiteId)
                || !foundAsset.getRoom().getFactorySite().getCompany().getId().equals(companyId)) {
            throw new ResourceNotFoundException();
        }
        return foundAsset;
    }

    public Set<Asset> getAssetsOverAssetSeries(final Long companyId, final Long assetSeriesId) {
        assetSeriesService.getAssetSeriesByCompany(companyId, assetSeriesId); // Make asset series belongs to company
        return getAssetsByAssetSeries(assetSeriesId);
    }

    public Asset getAssetOverAssetSeries(final Long companyId, final Long assetSeriesId, final Long assetId) {
        assetSeriesService.getAssetSeriesByCompany(companyId, assetSeriesId); // Make asset series belongs to company
        return getAssetByAssetSeries(assetSeriesId, assetId);
    }

    public Asset moveAssetCompany(final Long companyId, final Long assetId, final Long targetCompanyId) {
        final Asset asset = getAssetByCompany(companyId, assetId);
        final Company targetCompany = companyService.getCompany(targetCompanyId, false);

        if (asset.getRoom() != null) {
            asset.getRoom().getAssets().remove(asset);
            asset.setRoom(null);
        }

        asset.getCompany().getAssets().remove(asset);

        asset.setCompany(targetCompany);
        targetCompany.getAssets().add(asset);

        return asset;
    }

    public void createFactoryAssetAggregateWithGlobalId(final Long companyId,
                                                        final String assetSeriesGlobalId,
                                                        final Asset asset) {
        final AssetSeries assetSeries = assetSeriesService.getAssetSeriesByCompanyAndGlobalId(companyId,
                assetSeriesGlobalId);
        final Company companyDifferentToAssetSeries = companyService.getCompany(companyId, false);
        createAssetAggregate(companyId, companyDifferentToAssetSeries, assetSeries, asset);
    }

    public Asset createFleetAssetAggregate(final Long companyId, final Long assetSeriesId, final Asset asset) {
        final AssetSeries assetSeries = assetSeriesService.getAssetSeriesByCompany(companyId, assetSeriesId);
        final Company companyEqualToAssetSeries = assetSeries.getCompany();
        return createAssetAggregate(companyId, companyEqualToAssetSeries, assetSeries, asset);
    }

    @Transactional
    protected Asset createAssetAggregate(final Long companyId,
                                         Company targetCompany,
                                         final AssetSeries assetSeries,
                                         final Asset asset) {
        targetCompany.getAssets().add(asset);
        asset.setCompany(targetCompany);
        assetSeries.getAssets().add(asset);
        asset.setAssetSeries(assetSeries);

        asset.getFieldInstances().forEach(fieldInstance -> {
            fieldInstance.setAsset(asset);
            fieldInstance.setFieldSource(assetSeries.getFieldSources().stream()
                    .filter(value -> value.getId().equals(fieldInstance.getFieldSource().getId()))
                    .findFirst()
                    .get()
            );
        });

        if (asset.getRoom() != null && asset.getRoom().getFactorySite() != null) {
            final Room newRoom = roomService.createRoomAndFactorySite(companyId, asset.getRoom(),
                    asset.getRoom().getFactorySite());
            asset.setRoom(newRoom);
            newRoom.getAssets().add(asset);
        }

        boolean wasGlobalIdUnset = false;
        if (asset.getGlobalId() == null) {
            asset.setGlobalId(UUID.randomUUID().toString());
            for (FieldInstance fieldInstance : asset.getFieldInstances()) {
                fieldInstance.setGlobalId(UUID.randomUUID().toString());
            }
            wasGlobalIdUnset = true;
        }

        validate(asset);

        Asset persistedAsset = assetRepository.save(asset);
        if (wasGlobalIdUnset) {
            persistedAsset.setGlobalId(generateGlobalId(companyId, persistedAsset.getId()));
            for (FieldInstance fieldInstance : asset.getFieldInstances()) {
                fieldInstance.setGlobalId(fieldInstanceService.generateGlobalId(fieldInstance));
            }
        }
        return persistedAsset;
    }

    private String generateGlobalId(final Long companyId, final Long assetId) {
        return companyId + "/" + assetId;
    }

    public void validate(final Asset asset) {
        if (asset.getGlobalId() == null) {
            throw new RuntimeException("Global id has to exist in an Asset");
        }
        if (asset.getCompany() == null) {
            throw new RuntimeException("Company has to exist in an Asset");
        }
        if (asset.getFieldInstances() == null) {
            throw new RuntimeException("FieldInstances has to exist in an Asset");
        }
        if (asset.getAssetSeries() == null) {
            throw new RuntimeException("AssetSeries has to exist in an Asset");
        }
        if (asset.getConstructionDate() == null) {
            throw new RuntimeException("ConstructionDate has to exist in an Asset");
        }
        if (asset.getGuid() == null) {
            throw new RuntimeException("GUID has to exist in an Asset");
        }
        if (asset.getName() == null) {
            throw new RuntimeException("Asset must have a name");
        }

        asset.getFieldInstances().forEach(fieldInstanceService::validate);

        validateSubsystems(asset);
    }

    private void validateSubsystems(Asset asset) {
        for (Asset subsystem : asset.getSubsystems()) {
            if (subsystem.getId().equals(asset.getId())) {
                throw new RuntimeException("An asset is not allowed to be a subsystem of itself.");
            }
            if (subsystem.getAssetSeries().getId().equals(asset.getAssetSeries().getId())) {
                throw new RuntimeException("A subsystem has to be of another asset series than the parent asset.");
            }
        }
    }

    public void deleteAsset(final Long companyId, final Long assetId) {
        final Asset asset = getAssetByCompany(companyId, assetId);

        if (asset.getRoom() != null) {
            asset.getRoom().getAssets().remove(asset);
            asset.setRoom(null);
        }

        asset.getCompany().getAssets().remove(asset);
        asset.setCompany(null);

        asset.getAssetSeries().getAssets().remove(asset);
        asset.setAssetSeries(null);

        fieldInstanceRepository.deleteAll(asset.getFieldInstances());
        assetRepository.delete(asset);
    }

    public Asset removeAssetFromRoom(final Long companyId, final Long factorySiteId, final Long roomId,
                                     final Long assetId) {
        final Asset asset = getAssetCheckFullPath(companyId, factorySiteId, roomId, assetId);
        final Room room = asset.getRoom();

        room.getAssets().remove(asset);
        asset.setRoom(null);

        return asset;
    }

    public Set<Asset> moveAssetsToRoom(final Long companyId, final Long factorySiteId, final Long roomId,
                                       final Asset[] assets) {
        Set<Asset> assetSet = new HashSet<>();
        this.moveUnselectedAssetsToNoSpecificRoom(companyId, factorySiteId, roomId, assets);
        for (Asset asset : assets) {
            assetSet.add(this.moveAssetToRoom(companyId, factorySiteId, roomId, asset.getId()));
        }
        return assetSet;
    }

    public void moveUnselectedAssetsToNoSpecificRoom(final Long companyId, final Long factorySiteId, final Long roomId,
                                                     final Asset[] updatedAssets) {
        Set<Asset> previouslyAssets = this.roomService.getRoomCheckFullPath(companyId, factorySiteId,
                roomId, true).getAssets();
        Set<Asset> updatedAssetsSet = new HashSet<>(Arrays.asList(updatedAssets));
        Asset[] unselectedAssets = previouslyAssets.stream().filter(asset -> !updatedAssetsSet.contains(asset))
                .toArray(Asset[]::new);

        if (unselectedAssets.length > 0) {
            Set<Room> factoryRooms = this.factorySiteService.getFactorySiteByCompany(companyId,
                    factorySiteId, true).getRooms();
            Room noSpecificRoom = getOrCreateNoSpecificRoom(companyId, factorySiteId, factoryRooms);
            for (Asset asset : unselectedAssets) {
                Room oldAssetRoom = this.roomService.getRoomCheckFullPath(companyId, factorySiteId, roomId, true);
                if (oldAssetRoom != null) {
                    oldAssetRoom.getAssets().remove(asset);
                }
                noSpecificRoom.getAssets().add(asset);
                asset.setRoom(noSpecificRoom);
            }
        }
    }

    private Room getOrCreateNoSpecificRoom(Long companyId, Long factorySiteId, Set<Room> factoryRooms) {
        Room noSpecificRoom = factoryRooms.stream().filter(factoryRoom -> factoryRoom.getName()
                .equals(Room.NO_SPECIFIC_ROOM_NAME)).findFirst().orElse(null);
        if (noSpecificRoom == null) {
            noSpecificRoom = Room.getUnspecificRoomInstance();
            this.roomService.createRoom(companyId, factorySiteId, noSpecificRoom);
        }
        return noSpecificRoom;
    }

    public Asset moveAssetToRoom(final Long companyId, final Long factorySiteId, final Long newRoomId,
                                 final Long assetId) {
        final Asset asset = getAssetByCompany(companyId, assetId);

        final Room oldAssetRoom = asset.getRoom();
        final Room newAssetRoom = roomService.getRoomCheckFullPath(companyId, factorySiteId, newRoomId, false);

        if (oldAssetRoom != null) {
            oldAssetRoom.getAssets().remove(asset);
            asset.setRoom(null);
        }

        newAssetRoom.getAssets().add(asset);
        asset.setRoom(newAssetRoom);

        return asset;
    }

    public Asset updateAssetSeriesAsset(final Long companyId, final Long assetSeriesId, final Long assetId,
                                        final Asset sourceAsset) {
        final Asset targetAsset = getAssetOverAssetSeries(companyId, assetSeriesId, assetId);

        targetAsset.copyFrom(sourceAsset);

        validate(targetAsset);

        return targetAsset;
    }

    public Asset transferFromFleetToFactory(final Long companyId, final Long targetCompanyId, final Long assetSeriesId,
                                            final Long assetId) {
        final Asset targetAsset = getAssetOverAssetSeries(companyId, assetSeriesId, assetId);

        targetAsset.setCompany(companyService.getCompany(targetCompanyId, false));

        return targetAsset;
    }

    public Asset updateRoomAsset(final Long companyId, final Long factorySiteId, final Long roomId, final Long assetId,
                                 final Asset sourceAsset) {
        final Asset targetAsset = getAssetCheckFullPath(companyId, factorySiteId, roomId, assetId);

        targetAsset.copyFrom(sourceAsset);

        validate(targetAsset);

        ngsiLdBrokerService.installAssetOnBroker(targetAsset);

        return targetAsset;
    }

    public Asset updateAsset(final Asset sourceAsset) {
        final Asset targetAsset = getAssetById(sourceAsset.getId());
        Room oldAssetRoom = targetAsset.getRoom();
        Room newAssetRoom = this.roomService.getRoomById(sourceAsset.getRoom().getId());

        ngsiLdBrokerService.installAssetOnBroker(targetAsset);
        targetAsset.copyFrom(sourceAsset);

        return updateRoom(oldAssetRoom, newAssetRoom, targetAsset);
    }

    private Asset updateRoom(Room oldAssetRoom, Room newAssetRoom, Asset targetAsset) {

        targetAsset.setRoom(newAssetRoom);
        if (oldAssetRoom != null) {
            oldAssetRoom.getAssets().remove(targetAsset);
        }
        newAssetRoom.getAssets().add(targetAsset);

        return targetAsset;
    }

    public Set<FieldInstance> getFieldInstancesCheckFullPath(final Long companyId, final Long factorySiteId,
                                                             final Long roomId, final Long assetId) {
        final Asset asset = getAssetCheckFullPath(companyId, factorySiteId, roomId, assetId);
        return asset.getFieldInstances();
    }

    public Set<FieldInstance> getFieldInstances(final Long companyId, final Long assetId) {
        final Asset asset = getAssetByCompany(companyId, assetId);
        return asset.getFieldInstances();
    }

    public FieldInstance getFieldInstance(final Long companyId, final Long assetId, final Long fieldInstanceId) {
        final Asset assetSeries = getAssetByCompany(companyId, assetId);
        return assetSeries.getFieldInstances().stream()
                .filter(field -> field.getId().equals(fieldInstanceId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public FieldInstance getFieldInstance(final Asset assetSeries, final Long fieldInstanceId) {
        return assetSeries.getFieldInstances().stream()
                .filter(field -> field.getId().equals(fieldInstanceId))
                .findAny()
                .orElseThrow(ResourceNotFoundException::new);
    }

    public Set<Asset> findSubsystemCandidates(Long companyId, Long parentAssetSeriesId) {
        return assetRepository.findSubsystemCandidates(parentAssetSeriesId, companyId);
    }

    public String getAssetByIdAsNgsiLD(Long assetId) throws IOException {
        Asset asset = getAssetById(assetId);

        return ngsiLdSerializer.getAssetByIdAsNgsiLD(asset);
    }

    public byte[] exportAllFleetAssetsToJson(final Long companyId) throws IOException {
        Set<Asset> assets = assetRepository
                .findAllByCompanyId(AssetRepository.DEFAULT_SORT, companyId);

        Set<Asset> assetsOfFleetManager = assets.stream()
                .filter(asset -> asset.getAssetSeries().getCompany() == asset.getCompany())
                .collect(Collectors.toSet());

        Set<AssetDto> assetDtos = assetMapper.toDtoSet(assetsOfFleetManager, true);
        return exportFleetAssetDtosToJson(assetDtos);
    }

    public byte[] exportFleetAssetsToJson(final Long companyId, final Long assetId) throws IOException {
        if (companyId == null || assetId == null) {
            throw new NullPointerException();
        }

        Asset asset = assetRepository.findByCompanyIdAndId(companyId, assetId).orElseThrow();
        if (asset.getAssetSeries().getCompany() != asset.getCompany()) {
            throw new RuntimeException("Only asset of fleet manager can be exported");
        }

        Set<AssetDto> assetDtos = new LinkedHashSet<>();
        assetDtos.add(assetMapper.toDto(asset, true));
        return exportFleetAssetDtosToJson(assetDtos);
    }

    private byte[] exportFleetAssetDtosToJson(Set<AssetDto> assetDtos) throws JsonProcessingException {
        assetDtos = removeUnnecessaryItems(assetDtos);
        sortFieldInstances(assetDtos);

        ObjectMapper objectMapper = BaseZipImportExport.getNewObjectMapper();
        return objectMapper.writeValueAsBytes(BaseZipImportExport.toSortedList(assetDtos));
    }

    private Set<AssetDto> removeUnnecessaryItems(Set<AssetDto> assetDtos) {
        Set<AssetDto> resultAssetDtos = new LinkedHashSet<>();
        for (AssetDto assetDto : assetDtos) {
            assetDto.setCompanyId(null);
            assetDto.setRoom(null);
            assetDto.setRoomId(null);
            assetDto.setSubsystemIds(null);
            assetDto.getFieldInstances().forEach(fieldInstanceDto -> fieldInstanceDto.setFieldSource(null));
            resultAssetDtos.add(assetDto);
        }
        return resultAssetDtos;
    }

    private void sortFieldInstances(Set<AssetDto> assetDtos) {
        for (AssetDto assetDto : assetDtos) {
            assetDto.setFieldInstanceIds(null);
            Set<FieldInstanceDto> sortedFieldInstanceDtos = new LinkedHashSet<>(BaseZipImportExport
                    .toSortedList(assetDto.getFieldInstances()));
            assetDto.setFieldInstances(sortedFieldInstanceDtos);
        }
    }

    public int importMultipleFromJsonToFactoryManager(byte[] fileContent,
                                                      final Long companyId,
                                                      final Long factorySiteId) throws IOException {
        Set<AssetDto> assetDtos = BaseZipImportExport.fileContentToDtoSet(fileContent, new TypeReference<>() {
        });
        Set<String> existingGlobalAssetIds = assetRepository
                .findAllByCompanyId(AssetRepository.DEFAULT_SORT, companyId)
                .stream().map(Asset::getGlobalId).collect(Collectors.toSet());

        Map<String, Set<String>> assetSubsystemMap = new HashMap<>();

        int entitySkippedCount = 0;
        for (AssetDto assetDto : BaseZipImportExport.toSortedList(assetDtos)) {
            if (!existingGlobalAssetIds.contains(assetDto.getGlobalId())) {

                addFieldSourceToFieldInstanceDtos(assetDto, companyId);
                removeAndCacheSubsystems(assetSubsystemMap, assetDto);
                sortFieldInstancesInAssetDto(assetDto);
                assetDto.setInstallationDate(OffsetDateTime.now());

                // Info: field instances are created automatically with cascade-all
                Asset asset = assetMapper.toEntity(assetDto);
                createFactoryAssetAggregateWithGlobalId(companyId, assetDto.getAssetSeriesGlobalId(), asset);
            } else {
                log.warn("Asset with the id " + assetDto.getId() + " already exists. Entry is ignored.");
                entitySkippedCount += 1;
            }
        }

        addCachedSubsystemsAndRoomsToAssets(assetSubsystemMap, companyId, factorySiteId);

        return entitySkippedCount;
    }

    private void addFieldSourceToFieldInstanceDtos(AssetDto assetDto, final Long companyId) {
        for (FieldInstanceDto fieldInstanceDto : BaseZipImportExport.toSortedList(assetDto.getFieldInstances())) {
            FieldSource fieldSource = assetSeriesService.getFieldSourceByGlobalId(
                    companyId,
                    assetDto.getAssetSeriesGlobalId(),
                    fieldInstanceDto.getFieldSourceGlobalId()
            );
            fieldInstanceDto.setFieldSource(fieldSourceMapper.toDto(fieldSource, false));
        }
    }

    private void removeAndCacheSubsystems(Map<String, Set<String>> assetSubsystemMap, AssetDto assetDto) {
        assetSubsystemMap.put(assetDto.getGlobalId(), assetDto.getSubsystemGlobalIds());
        assetDto.setSubsystemIds(null);
        assetDto.setSubsystemGlobalIds(null);
    }

    private void sortFieldInstancesInAssetDto(AssetDto assetDto) {
        Set<FieldInstanceDto> sortedFieldInstanceDtos =
                new LinkedHashSet<>(BaseZipImportExport.toSortedList(assetDto.getFieldInstances()));
        assetDto.setFieldInstances(sortedFieldInstanceDtos);
    }

    private void addCachedSubsystemsAndRoomsToAssets(Map<String, Set<String>> assetSubsystemMap,
                                                     final Long companyId, final Long factorySiteId) {

        Room noSpecificRoomOfFactorySite = getOrCreateNoSpecificRoom(companyId, factorySiteId,
                roomService.getRoomsByFactorySite(factorySiteId));

        assetSubsystemMap.forEach((assetGlobalId, subsystemGlobalIds) -> {
            Asset asset = getAssetByCompanyAndGlobalId(companyId, assetGlobalId);
            Set<Asset> subsystems = subsystemGlobalIds.stream()
                    .map(globalId -> getAssetByCompanyAndGlobalId(companyId, globalId))
                    .collect(Collectors.toSet());

            asset.setRoom(noSpecificRoomOfFactorySite);
            asset.setSubsystems(subsystems);
            updateAsset(asset);
        });
    }

}
