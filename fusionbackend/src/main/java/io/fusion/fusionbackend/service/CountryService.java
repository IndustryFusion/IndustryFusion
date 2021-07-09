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
import io.fusion.fusionbackend.model.Country;
import io.fusion.fusionbackend.repository.CountryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class CountryService {
    private final CountryRepository countryRepository;

    @Autowired
    public CountryService(CountryRepository countryRepository) {
        this.countryRepository = countryRepository;
    }

    public Set<Country> getAllCountries() {
        return Sets.newLinkedHashSet(countryRepository.findAll(CountryRepository.DEFAULT_SORT));
    }

    public Country getCountry(final Long countryId) {
        return countryRepository.findById(countryId).orElseThrow(ResourceNotFoundException::new);
    }

    public Country createCountry(final Country country) {
        return countryRepository.save(country);
    }

    public Country updateCountry(final Long countryId, final Country sourceCountry) {
        final Country targetCountry = getCountry(countryId);

        targetCountry.copyFrom(sourceCountry);

        return targetCountry;
    }

    public void deleteCountry(final Long countryId) {
        final Country country = getCountry(countryId);

        countryRepository.delete(country);
    }
}
