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
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class CompanyService {
    private final CompanyRepository companyRepository;

    @Autowired
    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Set<Company> getAllCompanies() {
        return Sets.newLinkedHashSet(companyRepository.findAll(CompanyRepository.DEFAULT_SORT));
    }

    public Company getCompany(final Long id, final boolean deep) {
        if (deep) {
            return companyRepository.findDeepById(id).orElseThrow(ResourceNotFoundException::new);
        }
        return companyRepository.findById(id).orElseThrow(ResourceNotFoundException::new);
    }

    public Company createCompany(final Company company) {
        return companyRepository.save(company);
    }

    public Company updateCompany(final Long companyId, final Company sourceCompany) {
        final Company targetCompany = getCompany(companyId, false);

        targetCompany.copyFrom(sourceCompany);

        return targetCompany;
    }

    public void deleteCompany(final Long id) {
        companyRepository.delete(getCompany(id, false));
    }
}
