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

import com.google.common.collect.Sets;
import io.fusion.fusionbackend.exception.ResourceNotFoundException;
import io.fusion.fusionbackend.model.AssetType;
import io.fusion.fusionbackend.repository.AssetTypeRepository;
import io.fusion.fusionbackend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class AssetTypeService {
    private final AssetTypeRepository assetTypeRepository;

    @Autowired
    public AssetTypeService(AssetTypeRepository assetTypeRepository) {
        this.assetTypeRepository = assetTypeRepository;
    }

    public Set<AssetType> getAllAssetTypes() {
        return Sets.newLinkedHashSet(assetTypeRepository.findAll(CompanyRepository.DEFAULT_SORT));
    }

    public AssetType getAssetType(final Long assetTypeId) {
        return assetTypeRepository.findById(assetTypeId).orElseThrow(ResourceNotFoundException::new);
    }

    public AssetType createAssetType(final AssetType assetType) {
        return assetTypeRepository.save(assetType);
    }

    public AssetType deleteAssetType(final Long assetTypeId) {
        final AssetType assetType = getAssetType(assetTypeId);

        // TODO: check it is not bound to any ATT
        assetTypeRepository.delete(assetType);

        return assetType;
    }

    public AssetType updateAssetType(final Long assetTypeId, final AssetType sourceAssetType) {
        final AssetType targetAssetType = getAssetType(assetTypeId);

        targetAssetType.copyFrom(sourceAssetType);

        return targetAssetType;
    }

}
