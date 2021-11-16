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
public class ObjectStorageAuth {
    private static final String API_KEY = "S3_API_KEY";
    private static final String SECRET_KEY = "S3_SECRET_KEY";

    private static String secretKey;
    private static String apiKey;

    public boolean authorize(final Long companyId, final Authentication authentication) {
        CompanyAuthz companyAuthz = new CompanyAuthz();
        if (!companyAuthz.authorize(companyId, authentication)) {
            return false;
        }

        if (authentication.getPrincipal() instanceof KeycloakPrincipal) {
            KeycloakPrincipal<KeycloakSecurityContext> keycloakPrincipal =
                    (KeycloakPrincipal<KeycloakSecurityContext>) authentication.getPrincipal();
            AccessToken accessToken = keycloakPrincipal.getKeycloakSecurityContext().getToken();
            if (accessToken != null && accessToken.getOtherClaims() != null) {
                Map<String, Object> otherClaims = accessToken.getOtherClaims();
                if ((otherClaims.containsKey(API_KEY) && otherClaims.get(API_KEY) instanceof String)
                        && (otherClaims.containsKey(SECRET_KEY) && otherClaims.get(SECRET_KEY) instanceof String)) {
                    apiKey = otherClaims.get(API_KEY).toString();
                    secretKey = otherClaims.get(SECRET_KEY).toString();
                    return apiKey.length() > 1 && secretKey.length() > 1;
                }
            }
        }
        return false;
    }

    public static String getApiKey() {
        return apiKey;
    }

    public static String getSecretKey() {
        return secretKey;
    }
}
