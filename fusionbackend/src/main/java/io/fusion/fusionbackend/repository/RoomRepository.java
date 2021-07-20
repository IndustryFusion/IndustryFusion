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

import io.fusion.fusionbackend.model.Room;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.Optional;
import java.util.Set;

public interface RoomRepository extends PagingAndSortingRepository<Room, Long> {
    Sort DEFAULT_SORT = Sort.by("id").ascending();

    @EntityGraph(value = "Room.allChildren")
    Set<Room> findAllByfactorySiteId(Sort sort, Long factorySiteId);

    @EntityGraph(value = "Room.allChildren")
    Optional<Room> findByfactorySiteIdAndId(Long factorySiteId, Long roomId);

    @EntityGraph(value = "Room.allChildrenDeep")
    Optional<Room> findDeepByfactorySiteIdAndId(Long factorySiteId, Long roomId);

    @EntityGraph(value = "Room.allChildren")
    @Query("from Room r where r.factorySite.company.id = :companyId")
    Set<Room> findAllByCompanyId(Sort sort, Long companyId);
}
