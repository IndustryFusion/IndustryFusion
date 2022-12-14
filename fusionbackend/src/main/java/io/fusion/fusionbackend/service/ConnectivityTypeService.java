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
import io.fusion.fusionbackend.model.ConnectivityType;
import io.fusion.fusionbackend.repository.ConnectivityTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class ConnectivityTypeService {

    private final ConnectivityTypeRepository connectivityTypeRepository;

    public ConnectivityTypeService(ConnectivityTypeRepository connectivityTypeRepository) {
        this.connectivityTypeRepository = connectivityTypeRepository;
    }

    public Set<ConnectivityType> getAll() {
        return Sets.newHashSet(connectivityTypeRepository.findAll(ConnectivityTypeRepository.DEFAULT_SORT));
    }

    public ConnectivityType createConnectivityType(String name, String infoText, Long version) {
        ConnectivityType connectivityType = new ConnectivityType();
        connectivityType.setName(name);
        connectivityType.setInfoText(infoText);
        connectivityType.setVersion(version);
        return connectivityTypeRepository.save(connectivityType);
    }
}
