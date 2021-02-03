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

import io.fusion.fusionbackend.model.Company;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.Optional;

public interface CompanyRepository extends PagingAndSortingRepository<Company, Long> {
    Sort DEFAULT_SORT = Sort.by("id").ascending();

    @EntityGraph(value = "Company.allChildren")
    Iterable<Company> findAll(Sort sort);

    @EntityGraph(value = "Company.allChildren")
    Optional<Company> findById(Long id);

    @EntityGraph(value = "Company.allChildrenDeep")
    Optional<Company> findDeepById(Long id);
}
