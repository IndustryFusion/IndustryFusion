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

import io.fusion.fusionbackend.model.Location;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.Optional;
import java.util.Set;

public interface LocationRepository extends PagingAndSortingRepository<Location, Long> {
    Sort DEFAULT_SORT = Sort.by("id").ascending();

    @EntityGraph(value = "Location.allChildren")
    Set<Location> findAllByCompanyId(Sort sort, Long companyId);

    @EntityGraph(value = "Location.allChildren")
    Optional<Location> findByCompanyIdAndId(Long companyId, Long locationId);

    @EntityGraph(value = "Location.allChildrenDeep")
    Optional<Location> findDeepByCompanyIdAndId(Long companyId, Long locationId);
}
