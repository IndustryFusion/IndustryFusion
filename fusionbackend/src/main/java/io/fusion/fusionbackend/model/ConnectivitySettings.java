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

import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "connectivity_settings")
@SequenceGenerator(allocationSize = 1, name = "idgen", sequenceName = "idgen_connectivity_settings")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class ConnectivitySettings extends BaseEntity {

    @Basic(optional = false)
    private String connectionString;

    @ManyToOne(optional = false, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "connectivity_type_id",
            foreignKey = @ForeignKey(name = "connectivity_settings_connectivity_type_id_fkey"))
    private ConnectivityType connectivityType;

    @ManyToOne(optional = false, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "connectivity_protocol_id",
            foreignKey = @ForeignKey(name = "connectivity_settings_connectivity_protocol_id_fkey"))
    private ConnectivityProtocol connectivityProtocol;

}
