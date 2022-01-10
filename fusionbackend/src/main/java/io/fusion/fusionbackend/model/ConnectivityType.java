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

package io.fusion.fusionbackend.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "connectivity_type")
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_connectivitytype")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class ConnectivityType extends BaseEntity {
    @Column(nullable = false)
    private String infoText;

    @Column(nullable = false)
    private String name;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "connectivity_type_connectivity_protocol",
            joinColumns =
            @JoinColumn(name = "connectivity_type_id"),
            foreignKey = @ForeignKey(name = "connectivity_type_id_fkey"),
            inverseJoinColumns =
            @JoinColumn(name = "connectivity_protocol_id"),
            inverseForeignKey = @ForeignKey(name = "connectivity_protocol_id_fkey")

    )
    private Set<ConnectivityProtocol> availableProtocols = new HashSet<>();

}
