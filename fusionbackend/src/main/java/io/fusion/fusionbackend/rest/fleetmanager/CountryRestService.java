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

package io.fusion.fusionbackend.rest.fleetmanager;

import io.fusion.fusionbackend.dto.CountryDto;
import io.fusion.fusionbackend.dto.mappers.CountryMapper;
import io.fusion.fusionbackend.rest.annotations.IsFleetUser;
import io.fusion.fusionbackend.service.CountryService;
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
public class CountryRestService {
    private final CountryMapper countryMapper;
    private final CountryService countryService;

    @Autowired
    public CountryRestService(CountryMapper countryMapper, CountryService countryService) {
        this.countryMapper = countryMapper;
        this.countryService = countryService;
    }

    @GetMapping(path = "/countries")
    public Set<CountryDto> getCountries(@RequestParam(defaultValue = "false") final boolean embedChildren) {
        return countryMapper.toDtoSet(countryService.getAllCountries(), embedChildren);
    }

    @GetMapping(path = "/countries/{countryId}")
    public CountryDto getCountry(@PathVariable final Long countryId,
                                 @RequestParam(defaultValue = "false") final boolean embedChildren) {
        return countryMapper.toDto(countryService.getCountry(countryId), embedChildren);
    }

    @PostMapping(path = "/countries")
    public CountryDto createCountry(@RequestBody final CountryDto countryDto) {
        return countryMapper.toDto(
                countryService.createCountry(countryMapper.toEntity(countryDto)), false);
    }

    @PatchMapping(path = "/countries/{countryId}")
    public CountryDto updateCountry(@PathVariable final Long countryId,
                                @RequestBody final CountryDto countryDto) {
        return countryMapper.toDto(countryService.updateCountry(countryId, countryMapper.toEntity(countryDto)),
                false);
    }

    @DeleteMapping(path = "/countries/{countryId}")
    public void deleteCountry(@PathVariable final Long countryId) {
        countryService.deleteCountry(countryId);
    }
}
