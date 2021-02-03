#!/bin/bash

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

set -e

# The root directory of packages.
# Use `.` if your packages are located in root.
ROOT="."
REPOSITORY_TYPE="github"
CIRCLE_API="https://circleci.com/api"

############################################
## 1. Generate CircleCI API parameters object
############################################
PACKAGES=$(ls ${ROOT} -l | grep ^d | awk '{print $9}')

PARAMETERS='"trigger":false'
for PACKAGE in ${PACKAGES[@]}
do
  PARAMETERS+=", \"$PACKAGE\":true"
done

############################################
## 2. CicleCI REST API call
############################################
DATA="{ \"branch\": \"$CIRCLE_BRANCH\", \"parameters\": { $PARAMETERS } }"
echo "Triggering pipeline with data:"
echo -e "  $DATA"

URL="${CIRCLE_API}/v2/project/${REPOSITORY_TYPE}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/pipeline"
HTTP_RESPONSE=$(curl -s -u ${CIRCLE_TOKEN}: -o response.txt -w "%{http_code}" -X POST --header "Content-Type: application/json" -d "$DATA" $URL)

if [ "$HTTP_RESPONSE" -ge "200" ] && [ "$HTTP_RESPONSE" -lt "300" ]; then
    echo "API call succeeded."
    echo "Response:"
    cat response.txt
else
    echo -e "\e[93mReceived status code: ${HTTP_RESPONSE}\e[0m"
    echo "Response:"
    cat response.txt
    exit 1
fi
