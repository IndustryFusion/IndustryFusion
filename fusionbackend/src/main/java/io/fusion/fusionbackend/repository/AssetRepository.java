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

package io.fusion.fusionbackend.repository;

import io.fusion.fusionbackend.model.Asset;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.Optional;
import java.util.Set;

public interface AssetRepository extends PagingAndSortingRepository<Asset, Long> {
    Sort DEFAULT_SORT = Sort.by("id").ascending();

    @EntityGraph(value = "Asset.allChildren")
    Set<Asset> findAllByCompanyId(Sort sort, Long companyId);

    @EntityGraph(value = "Asset.allChildren")
    Set<Asset> findAllByRoomId(Sort sort, Long roomId);

    @EntityGraph(value = "Asset.allChildren")
    Set<Asset> findAllByAssetSeriesId(Sort sort, Long assetSeriesId);

    @EntityGraph(value = "Asset.allChildren")
    Optional<Asset> findByCompanyIdAndId(Long companyId, Long assetId);

    @EntityGraph(value = "Asset.allChildren")
    Optional<Asset> findByRoomIdAndId(Long roomId, Long assetId);

    @EntityGraph(value = "Asset.allChildren")
    Optional<Asset> findByAssetSeriesIdAndId(Long assetSeriesId, Long assetId);

    @EntityGraph(value = "Asset.allChildren")
    @Query("from Asset asset where asset.room.factorySite.id = ?1")
    Set<Asset> findAllByFactorySiteId(Sort sort, Long factorySiteId);

    Set<Asset> findSubsystemCandidates(Long parentAssetSeriesId, Long companyId);
}
