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

import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.Asset;
import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.FieldInstance;
import io.fusion.fusionbackend.model.Room;
import io.fusion.fusionbackend.repository.AssetRepository;
import io.fusion.fusionbackend.repository.FieldInstanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@Transactional
public class AssetService {
    private final AssetRepository assetRepository;
    private final FieldInstanceRepository fieldInstanceRepository;
    private final RoomService roomService;
    private final AssetSeriesService assetSeriesService;
    private final CompanyService companyService;
    private final LocationService locationService;

    @Autowired
    public AssetService(AssetRepository assetRepository,
                        FieldInstanceRepository fieldInstanceRepository,
                        RoomService roomService,
                        AssetSeriesService assetSeriesService,
                        CompanyService companyService,
                        LocationService locationService) {
        this.assetRepository = assetRepository;
        this.fieldInstanceRepository = fieldInstanceRepository;
        this.roomService = roomService;
        this.assetSeriesService = assetSeriesService;
        this.companyService = companyService;
        this.locationService = locationService;
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

    public Set<Asset> getAssetsByLocation(final Long companyId, final Long locationId) {
        locationService.getLocationByCompany(companyId, locationId, false); // Make sure location belongs to company
        return assetRepository.findAllByLocationId(AssetRepository.DEFAULT_SORT, locationId);
    }

    public Asset getAssetByCompany(final Long companyId, final Long assetId) {
        return assetRepository.findByCompanyIdAndId(companyId, assetId).orElseThrow(ResourceNotFoundException::new);
    }

    public Set<Asset> getAssetsCheckFullPath(final Long companyId, final Long locationId, final Long roomId) {
        // Make sure room and location belongs to company
        roomService.getRoomCheckFullPath(companyId, locationId, roomId, false);
        return getAssetsByRoom(roomId);
    }

    public Asset getAssetCheckFullPath(final Long companyId, final Long locationId, final Long roomId,
                                       final Long assetId) {
        final Asset foundAsset = getAssetByRoom(roomId, assetId);
        if (!foundAsset.getRoom().getLocation().getId().equals(locationId)
                || !foundAsset.getRoom().getLocation().getCompany().getId().equals(companyId)) {
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

    public Asset removeAssetFromRoom(final Long companyId, final Long locationId, final Long roomId,
                                     final Long assetId) {
        final Asset asset = getAssetCheckFullPath(companyId, locationId, roomId, assetId);
        final Room room = asset.getRoom();

        room.getAssets().remove(asset);
        asset.setRoom(null);

        return asset;
    }

    public Asset moveAssetToRoom(final Long companyId, final Long locationId, final Long roomId, final Long assetId) {
        final Asset asset = getAssetByCompany(companyId, assetId);
        final Room room = roomService.getRoomCheckFullPath(companyId, locationId, roomId, false);

        final Room currentAssetRoom = asset.getRoom();

        if (currentAssetRoom != null) {
            currentAssetRoom.getAssets().remove(asset);
            asset.setRoom(null);
        }

        room.getAssets().add(asset);
        asset.setRoom(room);

        return asset;
    }

    public Asset updateAssetSeriesAsset(final Long companyId, final Long assetSeriesId, final Long assetId,
                                        final Asset sourceAsset) {
        final Asset targetAsset = getAssetOverAssetSeries(companyId, assetSeriesId, assetId);

        targetAsset.copyFrom(sourceAsset);

        return targetAsset;
    }

    public Asset updateRoomAsset(final Long companyId, final Long locationId, final Long roomId, final Long assetId,
                                 final Asset sourceAsset) {
        final Asset targetAsset = getAssetCheckFullPath(companyId, locationId, roomId, assetId);

        targetAsset.copyFrom(sourceAsset);

        return targetAsset;
    }

    public Asset updateAsset(final Asset sourceAsset) {
        final Asset targetAsset = getAssetById(sourceAsset.getId());
        Room oldAssetRoom = targetAsset.getRoom();

        targetAsset.copyFrom(sourceAsset);

        return updateRoom(oldAssetRoom, sourceAsset, targetAsset);
    }

    private Asset updateRoom(Room oldAssetRoom, Asset sourceAsset, Asset targetAsset) {
        Room newAssetRoom = this.roomService.getRoomById(sourceAsset.getRoom().getId());

        targetAsset.setRoom(newAssetRoom);
        oldAssetRoom.getAssets().remove(targetAsset);
        newAssetRoom.getAssets().add(targetAsset);

        return targetAsset;
    }

    public Asset createAssetFromAssetSeries(final Long companyId, final Long assetSeriesId,
                                            final Long targetCompanyId) {
        final AssetSeries assetSeries = assetSeriesService.getAssetSeriesByCompany(companyId, assetSeriesId);
        final Company targetCompany = companyService.getCompany(targetCompanyId, false);

        final Asset newAsset = Asset.builder()
                .build();
        newAsset.copyFrom(assetSeries);

        assetSeries.getAssets().add(newAsset);
        newAsset.setAssetSeries(assetSeries);
        targetCompany.getAssets().add(newAsset);
        newAsset.setCompany(targetCompany);
        final Asset savedAsset = assetRepository.save(newAsset);

        List<FieldInstance> newFieldInstances = assetSeries.getFieldSources().stream()
                .map(fieldSource ->
                        FieldInstance.builder().fieldSource(fieldSource).asset(savedAsset).build())
                .collect(Collectors.toList());
        List<FieldInstance> savedFieldInstances =
                StreamSupport.stream(fieldInstanceRepository.saveAll(newFieldInstances).spliterator(), false)
                        .collect(Collectors.toList());
        newAsset.getFieldInstances().addAll(savedFieldInstances);

        return savedAsset;
    }

    public Set<FieldInstance> getFieldInstancesCheckFullPath(final Long companyId, final Long locationId,
                                                             final Long roomId, final Long assetId) {
        final Asset asset = getAssetCheckFullPath(companyId, locationId, roomId, assetId);
        return asset.getFieldInstances();
    }

    public Set<FieldInstance> getFieldInstances(final Long companyId, final Long assetId) {
        final Asset asset = getAssetByCompany(companyId, assetId);
        Set<FieldInstance> assetFields = asset.getFieldInstances();

        // Generate random maintenance value
        for (FieldInstance field: asset.getFieldInstances()) {
            if (field.getName().equals("Hours till maintenance")) {
                field = this.generateRandomMaintenanceValue(field);
            }
        }
        return assetFields;
    }

    public FieldInstance generateRandomMaintenanceValue(FieldInstance field) {
        final Random random = new Random();
        field.setValue(Integer.toString(random.nextInt(1500)));
        return field;
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

    public FieldInstance createFieldInstance(final Long companyId, final Long assetId,
                                             final FieldInstance fieldInstance) {
        final Asset assetSeries = getAssetByCompany(companyId, assetId);

        assetSeries.getFieldInstances().add(fieldInstance);

        return fieldInstanceRepository.save(fieldInstance);
    }

    public FieldInstance updateFieldInstance(final Long companyId, final Long assetId, final Long fieldInstanceId,
                                             final FieldInstance fieldInstance) {
        final FieldInstance targetFieldInstance = getFieldInstance(companyId, assetId, fieldInstanceId);

        targetFieldInstance.copyFrom(fieldInstance);

        return targetFieldInstance;
    }

    public void deleteFieldInstance(final Long companyId, final Long assetId, final Long fieldInstanceId) {
        final Asset assetSeries = getAssetByCompany(companyId, assetId);
        final FieldInstance fieldInstance = getFieldInstance(assetSeries, fieldInstanceId);

        assetSeries.getFieldInstances().remove(fieldInstance);

        fieldInstanceRepository.delete(fieldInstance);
    }
}
