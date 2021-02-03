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

package io.fusion.fusionbackend.auth;

import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.representations.AccessToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CompanyAuthz {
    private static final String IF_COMPANY = "IF_COMPANY";

    public boolean authorize(final Long companyId, final Authentication authentication) {
        if (authentication.getPrincipal() instanceof KeycloakPrincipal) {
            KeycloakPrincipal<KeycloakSecurityContext> keycloakPrincipal =
                    (KeycloakPrincipal<KeycloakSecurityContext>) authentication.getPrincipal();
            AccessToken accessToken = keycloakPrincipal.getKeycloakSecurityContext().getToken();
            if (accessToken != null && accessToken.getOtherClaims() != null) {
                Map<String, Object> otherClaims = accessToken.getOtherClaims();
                if (otherClaims.containsKey(IF_COMPANY) && otherClaims.get(IF_COMPANY) instanceof Integer) {
                    return ((Integer) otherClaims.get(IF_COMPANY)).longValue() == companyId;
                }
                if (otherClaims.containsKey(IF_COMPANY) && otherClaims.get(IF_COMPANY) instanceof Long) {
                    return ((Long) otherClaims.get(IF_COMPANY)).longValue() == companyId;
                }
            }
        }
        return false;
    }
}
