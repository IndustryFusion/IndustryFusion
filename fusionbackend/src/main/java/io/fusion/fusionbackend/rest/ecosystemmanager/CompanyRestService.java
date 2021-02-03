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

package io.fusion.fusionbackend.rest.ecosystemmanager;

import io.fusion.fusionbackend.dto.CompanyDto;
import io.fusion.fusionbackend.dto.mappers.CompanyMapper;
import io.fusion.fusionbackend.rest.annotations.IsEcosystemUser;
import io.fusion.fusionbackend.rest.annotations.IsAnyFusionUser;
import io.fusion.fusionbackend.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
public class CompanyRestService {
    private final CompanyService companyService;
    private final CompanyMapper companyMapper;

    @Autowired
    public CompanyRestService(CompanyService companyService, CompanyMapper companyMapper) {
        this.companyService = companyService;
        this.companyMapper = companyMapper;
    }

    @IsEcosystemUser
    @GetMapping(path = "/companies")
    public Set<CompanyDto> getCompanies() {
        return companyMapper.toDtoSet(companyService.getAllCompanies());
    }

    @IsAnyFusionUser
    @GetMapping(path = "/companies/{companyId}")
    public CompanyDto getCompany(@PathVariable final Long companyId,
                                 @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return companyMapper.toDto(companyService.getCompany(companyId, embedChildren), embedChildren);
    }

    @IsEcosystemUser
    @PostMapping(path = "/companies")
    public CompanyDto createCompany(@RequestBody final CompanyDto companyDto) {
        return companyMapper.toDto(companyService.createCompany(companyMapper.toEntity(companyDto)), false);
    }

    @IsEcosystemUser
    @PatchMapping(path = "/companies/{companyId}")
    public CompanyDto updateCompany(@PathVariable final Long companyId,
                                    @RequestBody final CompanyDto companyDto) {
        return companyMapper.toDto(companyService.updateCompany(companyId, companyMapper.toEntity(companyDto)), false);
    }

    @IsEcosystemUser
    @DeleteMapping(path = "/companies/{companyId}")
    public void deleteCompany(@PathVariable final Long companyId) {
        companyService.deleteCompany(companyId);
    }
}
