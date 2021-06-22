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

package io.fusion.fusionbackend;

import io.fusion.fusionbackend.dto.*;
import io.fusion.fusionbackend.model.enums.CompanyType;
import io.fusion.fusionbackend.model.enums.FieldType;
import io.fusion.fusionbackend.model.enums.LocationType;
import io.fusion.fusionbackend.model.enums.PublicationState;
import io.restassured.http.ContentType;
import io.restassured.response.ValidatableResponse;
import org.assertj.core.groups.Tuple;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.hamcrest.CoreMatchers.equalTo;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class FusionbackendApplicationTests {
    @Value("http://localhost:${local.server.port}")
    String baseUrl;

    @Value("${embedded.keycloak.auth-server-url}")
    String keycloakUrl;

    private static String accessTokenEcoMan;
    private static String accessTokenFleetManAirist;
    private static String accessTokenFleetManLaserly;
    private static String accessTokenFabManStruump;
    private static Integer companyEcosystemId;
    private static Integer companyAiristMachId;
    private static Integer companyLaserlyMachId;
    private static Integer companySteelgradeFabId;
    private static Integer companyStruumpFabId;

    private static Integer locationStruumpHqId;
    private static Integer locationStruumpFabId;

    private static Integer roomWestStruumpFabId;
    private static Integer roomEastStruumpFabId;

    private static Integer assetRoomWestStruumpFabId;
    private static Integer assetRoomEastStruumpFabId;

    private static Integer assetTypeTemplateGasSupplyId;
    private static Integer assetTypeTemplateLaserCutterId;

    private static Integer assetSeriesAiristGasSupplyId;
    private static Integer assetSeriesLaserlyLaserCutterId;

    private static Integer assetTypeGasSupplyId;
    private static Integer assetTypeLaserCutterId;

    private static Integer quantityTypePressureId;
    private static Integer quantityTypeMassId;
    private static Integer quantityTypeCountId;
    private static Integer quantityTypeTemperatureId;

    private static Integer unitIdPa;
    private static Integer unitIdPsi;
    private static Integer unitIdMeter;
    private static Integer unitIdInch;
    private static Integer unitIdCelcius;
    private static Integer unitIdFahrenheit;
    private static Integer unitIdCount;

    private static Integer fieldIdDifferenzDruck;
    private static Integer fieldIdHeadTemperature;
    private static Integer fieldIdHeadCount;

    @Test
    @Order(10)
    void login() {
        accessTokenEcoMan = loginUser("ecoman@PUT_YOUR_DOMAIN_HERE.com");
        accessTokenFleetManAirist = loginUser("fleetmanairist@PUT_YOUR_DOMAIN_HERE.com");
        accessTokenFleetManLaserly = loginUser("fleetmanlaserly@PUT_YOUR_DOMAIN_HERE.com");
        accessTokenFabManStruump = loginUser("fabman@PUT_YOUR_DOMAIN_HERE.com");
    }

    @Test
    @Order(100)
    void testEmptyGetAllCompanies() {
        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/companies")

                .then()
                .statusCode(200)
                .body("$.size()", equalTo(0));
    }

    @Test
    @Order(200)
    void createCompanyEcosystem() {
        CompanyDto company = CompanyDto.builder()
                .description("Industry Fusion e.V.")
                .imageKey("ificon")
                .type(CompanyType.ECOSYSTEM_MANAGER)
                .name("Industry Fusion")
                .build();

        companyEcosystemId = createAndTestCompany(company);
    }

    @Test
    @Order(201)
    void createCompanyAiristMach() {
        CompanyDto company = CompanyDto.builder()
                .description("Airist GmbH")
                .imageKey("airicon")
                .type(CompanyType.MACHINE_MANUFACTURER)
                .name("Airist")
                .build();

        companyAiristMachId = createAndTestCompany(company);
    }

    @Test
    @Order(202)
    void createCompanyLaserlyMach() {
        CompanyDto company = CompanyDto.builder()
                .description("Laserly GmbH")
                .imageKey("lasicon")
                .type(CompanyType.MACHINE_MANUFACTURER)
                .name("Laserly")
                .build();

        companyLaserlyMachId = createAndTestCompany(company);
    }

    @Test
    @Order(203)
    void createCompanySteelgradeFab() {
        CompanyDto company = CompanyDto.builder()
                .description("Steelgrade GmbH")
                .imageKey("mcicon")
                .type(CompanyType.MACHINE_CUSTOMER)
                .name("Steelgrade")
                .build();

        companySteelgradeFabId = createAndTestCompany(company);
    }

    @Test
    @Order(204)
    void createCompanyStruumpFab() {
        CompanyDto company = CompanyDto.builder()
                .description("Struump GmbH")
                .imageKey("mcicon")
                .type(CompanyType.MACHINE_CUSTOMER)
                .name("Struump")
                .build();

        companyStruumpFabId = createAndTestCompany(company);
    }

    @RepeatedTest(10)
    @Order(205)
    void createCompanyMultiple(final RepetitionInfo repetitionInfo) {
        CompanyDto company = CompanyDto.builder()
                .description("Random " + repetitionInfo.getCurrentRepetition() + " GmbH")
                .imageKey("ricon" + repetitionInfo.getCurrentRepetition())
                .type(CompanyType.MACHINE_CUSTOMER)
                .name("Random " + repetitionInfo.getCurrentRepetition())
                .build();
        createAndTestCompany(company);
    }

    @Test
    @Order(209)
    void testGetAllCompanies() {
        List<Integer> companyIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/companies/")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(companyIds)
                .hasSize(15)
                .contains(companyEcosystemId, companyAiristMachId, companyLaserlyMachId, companySteelgradeFabId,
                        companyStruumpFabId);
    }

    @Test
    @Order(300)
    void createLocationStruumpHq() {
        LocationDto location = LocationDto.builder()
                .name("World Headquarter")
                .type(LocationType.HEADQUARTER)
                .line1("Sudetenstr. 1001")
                .line2("Rückgebäude")
                .city("Gräfelfing")
                .zip("90011")
                .country("Germany")
                .latitude(48.127936)
                .longitude(11.604835)
                .build();

        locationStruumpHqId = createAndTestLocation(companyStruumpFabId, location);
    }

    @Test
    @Order(301)
    void createLocationStruumpFab() {
        LocationDto location = LocationDto.builder()
                .name("Landau")
                .type(LocationType.FABRICATION)
                .line1("Kerrystr. 2001")
                .line2("Hinterhof")
                .city("Lindau")
                .zip("10011")
                .country("Germany")
                .latitude(48.024522)
                .longitude(11.679882)
                .build();

        locationStruumpFabId = createAndTestLocation(companyStruumpFabId, location);
    }

    @RepeatedTest(10)
    @Order(305)
    void createLocationMultiple(final RepetitionInfo repetitionInfo) {
        LocationDto location = LocationDto.builder()
                .name("Spandau Random " + repetitionInfo.getCurrentRepetition())
                .type(LocationType.FABRICATION)
                .line1("Clarestr. 2001")
                .line2("Hintermhof")
                .city("Spandau")
                .zip("10011")
                .country("Germany")
                .latitude(48.024522)
                .longitude(11.679882)
                .build();
        createAndTestLocation(companyStruumpFabId, location);
    }

    @Test
    @Order(309)
    void testGetAllCompanyLocations() {
        List<Integer> locationIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .get(baseUrl + "/companies/" + companyStruumpFabId + "/locations")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(locationIds)
                .hasSize(12)
                .contains(locationStruumpFabId, locationStruumpHqId);
    }

    @Test
    @Order(400)
    void createRoomEastInStruumpAiristFab() {
        RoomDto room = RoomDto.builder()
                .name("Shop Floor East")
                .description("Shop floor east room")
                .build();

        roomEastStruumpFabId = createAndTestRoom(companyStruumpFabId, locationStruumpFabId, room);
    }

    @Test
    @Order(401)
    void createRoomWestInAiristFab() {
        RoomDto room = RoomDto.builder()
                .name("Shop Floor West")
                .description("Shop floor west room")
                .build();

        roomWestStruumpFabId = createAndTestRoom(companyStruumpFabId, locationStruumpFabId, room);
    }

    @RepeatedTest(10)
    @Order(402)
    void createRoomMultiple(final RepetitionInfo repetitionInfo) {
        RoomDto room = RoomDto.builder()
                .name("Shop Floor " + repetitionInfo.getCurrentRepetition())
                .build();
        createAndTestRoom(companyStruumpFabId, locationStruumpFabId, room);
    }

    @Test
    @Order(409)
    void testGetAllLocationRooms() {
        List<Integer> locationIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .get(baseUrl + "/companies/" + companyStruumpFabId + "/locations/" + locationStruumpFabId + "/rooms")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(locationIds)
                .hasSize(12)
                .contains(roomWestStruumpFabId, roomEastStruumpFabId);
    }

    @Test
    @Order(420)
    void createQuantityTypePressure() {
        QuantityTypeDto quantityType = QuantityTypeDto.builder()
                .name("Pressure")
                .description("Pressure Quantities")
                .build();
        quantityTypePressureId = createAndTestQuantityType(quantityType);
    }

    @Test
    @Order(421)
    void createQuantityTypeMass() {
        QuantityTypeDto quantityType = QuantityTypeDto.builder()
                .name("Mass")
                .description("Mass Quantities")
                .build();
        quantityTypeMassId = createAndTestQuantityType(quantityType);
    }

    @Test
    @Order(422)
    void createQuantityTypeCount() {
        QuantityTypeDto quantityType = QuantityTypeDto.builder()
                .name("Count")
                .description("Count Quantities")
                .build();
        quantityTypeCountId = createAndTestQuantityType(quantityType);
    }

    @Test
    @Order(422)
    void createQuantityTypeTemperature() {
        QuantityTypeDto quantityType = QuantityTypeDto.builder()
                .name("Temperature")
                .description("Temperature Quantities")
                .build();
        quantityTypeTemperatureId = createAndTestQuantityType(quantityType);
    }

    @Test
    @Order(425)
    void createPressureUnits() {
        UnitDto unitDto = UnitDto.builder()
                .name("Pascal")
                .symbol("pa")
                .build();
        unitIdPa = createAndTestUnit(quantityTypePressureId, unitDto);

        unitDto = UnitDto.builder()
                .name("Pounds per square inch")
                .symbol("psi")
                .build();
        unitIdPsi = createAndTestUnit(quantityTypePressureId, unitDto);

        unitDto = UnitDto.builder()
                .name("Meter")
                .symbol("m")
                .build();
        unitIdMeter = createAndTestUnit(quantityTypeMassId, unitDto);

        unitDto = UnitDto.builder()
                .name("Inch")
                .symbol("in")
                .build();
        unitIdInch = createAndTestUnit(quantityTypeMassId, unitDto);

        unitDto = UnitDto.builder()
                .name("Count")
                .symbol("")
                .build();
        unitIdCount = createAndTestUnit(quantityTypeCountId, unitDto);

        unitDto = UnitDto.builder()
                .name("Celcius")
                .symbol("")
                .build();
        unitIdCelcius = createAndTestUnit(quantityTypeTemperatureId, unitDto);

        unitDto = UnitDto.builder()
                .name("Fahrenheit")
                .symbol("")
                .build();
        unitIdFahrenheit = createAndTestUnit(quantityTypeTemperatureId, unitDto);
    }

    @Test
    @Order(430)
    void setBaseUnits() {
        setBaseUnit(quantityTypeMassId, unitIdMeter);
        setBaseUnit(quantityTypePressureId, unitIdPa);
        setBaseUnit(quantityTypeCountId, unitIdCount);
        setBaseUnit(quantityTypeTemperatureId, unitIdCelcius);
    }

    @Test
    @Order(435)
    void createFields() {
        FieldDto fieldDto = FieldDto.builder()
                .accuracy(2.2)
                .name("Differenzdruck")
                .description("Differenz Druck...")
                .build();

        fieldIdDifferenzDruck = createAndTestField(fieldDto, unitIdPa);

        fieldDto = FieldDto.builder()
                .accuracy(2.2)
                .name("Head temperature")
                .description("Head temperature...")
                .build();

        fieldIdHeadTemperature = createAndTestField(fieldDto, unitIdCelcius);

        fieldDto = FieldDto.builder()
                .accuracy(2.2)
                .name("Number of heads")
                .description("Number of heads...")
                .build();

        fieldIdHeadCount = createAndTestField(fieldDto, unitIdCount);
    }

    @Test
    @Order(437)
    void queryFields() {
        List<Integer> assetTypeIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/fields")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(assetTypeIds)
                .hasSize(3)
                .containsExactlyInAnyOrder(fieldIdDifferenzDruck, fieldIdHeadCount, fieldIdHeadTemperature);
    }

    @Test
    @Order(440)
    void queryQuantityTypes() {
        List<QuantityTypeDto> quantityTypes = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/quantitytypes")

                .then()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getList(".");

        assertThat(quantityTypes)
                .hasSize(4)
                .extracting("id", "baseUnitId")
                .contains(
                        Tuple.tuple(quantityTypeMassId, unitIdMeter),
                        Tuple.tuple(quantityTypePressureId, unitIdPa),
                        Tuple.tuple(quantityTypeCountId, unitIdCount),
                        Tuple.tuple(quantityTypeTemperatureId, unitIdCelcius));
    }

    @Test
    @Order(445)
    void queryUnits() {
        List<Integer> unitIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/units")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(unitIds)
                .hasSize(7)
                .containsExactlyInAnyOrder(unitIdMeter, unitIdPa, unitIdInch, unitIdPsi, unitIdCount,
                        unitIdCelcius, unitIdFahrenheit);
    }

    @Test
    @Order(460)
    void createAndTestAssetTypes() {
        AssetTypeDto assetTypeDto = AssetTypeDto.builder()
                .name("Laser Cutter")
                .description("Laser Cutter Machines")
                .label("laser_cutter")
                .build();

        assetTypeLaserCutterId = createAndTestAssetType(assetTypeDto);

        assetTypeDto = AssetTypeDto.builder()
                .name("Gas Suppley")
                .description("Gas Supply Unit")
                .label("gas_supply")
                .build();

        assetTypeGasSupplyId = createAndTestAssetType(assetTypeDto);
    }

    @Test
    @Order(465)
    void queryAssetTypes() {
        List<Integer> assetTypeIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/assettypes")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(assetTypeIds)
                .hasSize(2)
                .containsExactlyInAnyOrder(assetTypeLaserCutterId, assetTypeGasSupplyId);
    }

    @Test
    @Order(500)
    void createAssetTypeTemplateGasSupply() {
        AssetTypeTemplateDto assetTypeTemplate = AssetTypeTemplateDto.builder()
                .name("Gas Supply")
                .description("ATT Gas Supply")
                .imageKey("genericgasimagekey")
                .publishedDate(OffsetDateTime.now())
                .publicationState(PublicationState.PUBLISHED)
                .build();

        assetTypeTemplateGasSupplyId = createAndTestAssetTypeTemplate(assetTypeGasSupplyId, assetTypeTemplate);
    }

    @Test
    @Order(501)
    void createAssetTypeTemplateLaserCutter() {
        AssetTypeTemplateDto assetTypeTemplate = AssetTypeTemplateDto.builder()
                .name("Laser Cutter")
                .description("ATT Laser Cutter")
                .imageKey("genericcutterimagekey")
                .publishedDate(OffsetDateTime.now())
                .publicationState(PublicationState.PUBLISHED)
                .build();

        assetTypeTemplateLaserCutterId = createAndTestAssetTypeTemplate(assetTypeLaserCutterId, assetTypeTemplate);
    }

    @RepeatedTest(9)
    @Order(502)
    void createAssetTypeTemplateMultiple(final RepetitionInfo repetitionInfo) {
        AssetTypeTemplateDto assetTypeTemplate = AssetTypeTemplateDto.builder()
                .name("Laser Cutter " + repetitionInfo.getCurrentRepetition())
                .description("ATT Laser Cutter" + repetitionInfo.getCurrentRepetition())
                .imageKey("genericcutterimagekey" + repetitionInfo.getCurrentRepetition())
                .publishedDate(OffsetDateTime.now())
                .publicationState(PublicationState.PUBLISHED)
                .build();

        createAndTestAssetTypeTemplate(assetTypeLaserCutterId, assetTypeTemplate);
    }

    @Test
    @Order(503)
    void createAssetTypeTemplateDrafts_shouldFail() {
        AssetTypeTemplateDto assetTypeTemplate = AssetTypeTemplateDto.builder()
                .name("Laser Cutter")
                .description("ATT Laser Cutter")
                .imageKey("genericcutterimagekey")
                .publicationState(PublicationState.DRAFT)
                .build();

        assetTypeTemplateLaserCutterId = createAndTestAssetTypeTemplate(assetTypeLaserCutterId, assetTypeTemplate);
        createAndTestAssetTypeTemplateExpectError(assetTypeLaserCutterId, assetTypeTemplate);
    }

    @Test
    @Order(505)
    void createAssetTypeTemplateLaserCutterFieldTargets() {
        FieldTargetDto fieldTarget = FieldTargetDto.builder()
                .name("Number of heads")
                .description("Number of cutter heads")
                .fieldType(FieldType.ATTRIBUTE)
                .mandatory(true)
                .build();

        createAndTestAssetTypeTemplateFieldTarget(assetTypeTemplateLaserCutterId, fieldIdHeadCount, fieldTarget);

        fieldTarget = FieldTargetDto.builder()
                .name("Head Temperature")
                .description("Temperature of the head")
                .fieldType(FieldType.METRIC)
                .mandatory(true)
                .build();

        createAndTestAssetTypeTemplateFieldTarget(assetTypeTemplateLaserCutterId, fieldIdHeadTemperature, fieldTarget);

        fieldTarget = FieldTargetDto.builder()
                .name("Differenzdruck Versorgung")
                .description("Differenzdruck der Versorgung")
                .fieldType(FieldType.METRIC)
                .mandatory(true)
                .build();

        createAndTestAssetTypeTemplateFieldTarget(assetTypeTemplateLaserCutterId, fieldIdDifferenzDruck, fieldTarget);
    }

    @Test
    @Order(509)
    void testGetAllAssetTypeTemplate() {
        List<Integer> assetIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/assettypetemplates")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(assetIds)
                .hasSize(12)
                .contains(assetTypeTemplateGasSupplyId, assetTypeTemplateLaserCutterId);
    }

    @Test
    @Order(600)
    void createAssetSeriesAiristGasSupply() {
        AssetSeriesDto assetSeries = AssetSeriesDto.builder()
                .name("Airist Gas Supply")
                .description("Airist Gas Supply")
                .ceCertified(true)
                .protectionClass("1c")
                .imageKey("airisgasimagekey")
                .handbookKey("airistgashandbookkey")
                .videoKey("airistgasvideokey")
                .build();

        assetSeriesAiristGasSupplyId = createAndTestAssetSeries(companyAiristMachId, companyEcosystemId,
                assetTypeTemplateGasSupplyId, assetSeries, accessTokenFleetManAirist);
    }

    @Test
    @Order(601)
    void createAssetSeriesLaserlyLaserCutter() {
        AssetSeriesDto assetSeries = AssetSeriesDto.builder()
                .name("Laserly Laser Cutter")
                .description("Laserly Laser Cutter")
                .ceCertified(true)
                .protectionClass("1c")
                .imageKey("lascutterimagekey")
                .handbookKey("lascutterhandbookkey")
                .videoKey("lascuttervideokey")
                .build();

        assetSeriesLaserlyLaserCutterId = createAndTestAssetSeries(companyLaserlyMachId, companyEcosystemId,
                assetTypeTemplateLaserCutterId, assetSeries, accessTokenFleetManLaserly);
    }

    @RepeatedTest(10)
    @Order(602)
    void createAssetSeriesMultiple(final RepetitionInfo repetitionInfo) {
        AssetSeriesDto assetSeries = AssetSeriesDto.builder()
                .name("Laserly Laser Cutter " + repetitionInfo.getCurrentRepetition())
                .description("Laserly Laser Cutter" + repetitionInfo.getCurrentRepetition())
                .ceCertified(true)
                .protectionClass("1c")
                .imageKey("genericcutterimagekey" + repetitionInfo.getCurrentRepetition())
                .handbookKey("genericcutterhandbookkey" + repetitionInfo.getCurrentRepetition())
                .videoKey("genericcuttervideokey" + repetitionInfo.getCurrentRepetition())
                .build();

        createAndTestAssetSeries(companyAiristMachId, companyEcosystemId, assetTypeTemplateGasSupplyId, assetSeries,
                accessTokenFleetManAirist);
    }

    @Test
    @Order(609)
    void testGetAllAssetSeries() {
        List<Integer> assetIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFleetManAirist)

                .when()
                .get(baseUrl + "/companies/" + companyAiristMachId + "/assetseries")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(assetIds)
                .hasSize(11)
                .contains(assetSeriesAiristGasSupplyId);
    }

    @Test
    @Order(700)
    void createAssetInRoomEastInAiristFab() {
        AssetDto asset = AssetDto.builder()
                .name("Gas Supply Oxygen")
                .externalId("ubuntu1804")
                .description("Central Gas Supply")
                .controlSystemType("PLC")
                .gatewayConnectivity("NETWORK")
                .imageKey("gskey")
                .hasGateway(true)
                .ceCertified(true)
                .build();

        assetRoomEastStruumpFabId = createAndTestAsset(companyAiristMachId, assetSeriesAiristGasSupplyId,
                companyStruumpFabId, asset, accessTokenFleetManAirist);

        assignAssetToRoomAndTest(companyStruumpFabId, locationStruumpFabId, roomEastStruumpFabId, assetRoomEastStruumpFabId);
    }

    @Test
    @Order(701)
    void createAssetInRoomWestInAiristFab() {
        AssetDto asset = AssetDto.builder()
                .name("FiberLaser Compact")
                .description("Laser Cutter")
                .controlSystemType("SQL")
                .gatewayConnectivity("NETWORK")
                .imageKey("lckey")
                .hasGateway(true)
                .ceCertified(true)
                .build();

        assetRoomWestStruumpFabId = createAndTestAsset(companyLaserlyMachId, assetSeriesLaserlyLaserCutterId,
                companyStruumpFabId, asset, accessTokenFleetManLaserly);

        assignAssetToRoomAndTest(companyStruumpFabId, locationStruumpFabId, roomWestStruumpFabId, assetRoomWestStruumpFabId);
    }

    @RepeatedTest(10)
    @Order(702)
    void createAssetsInRoomMultiple(final RepetitionInfo repetitionInfo) {
        AssetDto asset = AssetDto.builder()
                .name("Laser machine " + repetitionInfo.getCurrentRepetition())
                .description("Laser Cutter" + repetitionInfo.getCurrentRepetition())
                .controlSystemType("SQL" + repetitionInfo.getCurrentRepetition())
                .gatewayConnectivity("NETWORK" + repetitionInfo.getCurrentRepetition())
                .imageKey("gskey" + repetitionInfo.getCurrentRepetition())
                .hasGateway(repetitionInfo.getCurrentRepetition() % 2 == 0)
                .build();
        final Integer assetId = createAndTestAsset(companyLaserlyMachId, assetSeriesLaserlyLaserCutterId,
                companyStruumpFabId, asset, accessTokenFleetManLaserly);

        assignAssetToRoomAndTest(companyStruumpFabId, locationStruumpFabId, roomEastStruumpFabId, assetId);
    }

    @Test
    @Order(707)
    void testGetAllCompanyAssets() {
        List<Integer> assetIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .get(baseUrl + "/companies/" + companyStruumpFabId + "/assets")

                .then()
                .extract().path("id");

        assertThat(assetIds)
                .hasSize(12)
                .contains(assetRoomEastStruumpFabId, assetRoomWestStruumpFabId);
    }

    @Test
    @Order(708)
    void testGetAllRoomAssets() {
        List<Integer> assetIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .get(baseUrl + "/companies/" + companyStruumpFabId + "/locations/" + locationStruumpFabId + "/rooms/" + roomEastStruumpFabId + "/assets")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(assetIds)
                .hasSize(11)
                .contains(assetRoomEastStruumpFabId);
    }

    @Test
    @Order(709)
    void testGetAllLocationAssets() {
        List<Integer> assetIds = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .get(baseUrl + "/companies/" + companyStruumpFabId + "/locations/" + locationStruumpFabId + "/assets")

                .then()
                .statusCode(200)
                .extract().path("id");

        assertThat(assetIds)
                .hasSize(12)
                .contains(assetRoomEastStruumpFabId, assetRoomWestStruumpFabId);
    }

    private Integer createAndTestCompany(final CompanyDto company) {
        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .body(company)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .post(baseUrl + "/companies")

                .then()
                .statusCode(200)
                .body("name", equalTo(company.getName()))
                .body("description", equalTo(company.getDescription()))
                .body("imageKey", equalTo(company.getImageKey()));

        String type = response.extract().path("type");
        assertThat(type).isEqualTo(company.getType().name());

        Integer newCompanyId = response.extract().path("id");

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/companies/" + newCompanyId)

                .then()
                .statusCode(200)
                .body("id", equalTo(newCompanyId))
                .body("name", equalTo(company.getName()));

        return newCompanyId;
    }

    // TODO: test getter with embed
    // TODO: test create with entityDto with ID
    // TODO: Test fields in assettypetemplate, series, assets

    private Integer createAndTestLocation(final Integer companyId, final LocationDto location) {
        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .body(location)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .post(baseUrl + "/companies/" + companyId + "/locations")

                .then()
                .statusCode(200)
                .body("name", equalTo(location.getName()))
                .body("line1", equalTo(location.getLine1()))
                .body("line2", equalTo(location.getLine2()))
                .body("city", equalTo(location.getCity()))
                .body("zip", equalTo(location.getZip()))
                .body("country", equalTo(location.getCountry()));

        Float longitude = response.extract().path("longitude");
        Float latitude = response.extract().path("latitude");
        assertThat(longitude.doubleValue()).isCloseTo(location.getLongitude(), within(0.001));
        assertThat(latitude.doubleValue()).isCloseTo(location.getLatitude(), within(0.001));
        String type = response.extract().path("type");
        assertThat(type).isEqualTo(location.getType().name());

        Integer newLocationId = response.extract().path("id");

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .get(baseUrl + "/companies/" + companyId + "/locations/" + newLocationId)

                .then()
                .statusCode(200)
                .body("name", equalTo(location.getName()))
                .body("line1", equalTo(location.getLine1()))
                .body("line2", equalTo(location.getLine2()))
                .body("city", equalTo(location.getCity()))
                .body("zip", equalTo(location.getZip()))
                .body("country", equalTo(location.getCountry()));

        return newLocationId;
    }

    private Integer createAndTestRoom(final Integer companyId, final Integer locationId, final RoomDto room) {
        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .body(room)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .post(baseUrl + "/companies/" + companyId + "/locations/" + locationId + "/rooms")

                .then()
                .statusCode(200)
                .body("name", equalTo(room.getName()))
                .body("description", equalTo(room.getDescription()));

        Integer newRoomId = response.extract().path("id");

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .get(baseUrl + "/companies/" + companyId + "/locations/" + locationId + "/rooms/" + newRoomId)

                .then()
                .statusCode(200)
                .body("name", equalTo(room.getName()))
                .body("description", equalTo(room.getDescription()));

        return newRoomId;
    }

    private Integer createAndTestQuantityType(final QuantityTypeDto quantityType) {
        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .body(quantityType)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .post(baseUrl + "/quantitytypes/")

                .then()
                .statusCode(200)
                .body("name", equalTo(quantityType.getName()));

        Integer newQuantityTypeId = response.extract().path("id");

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/quantitytypes/" + newQuantityTypeId)

                .then()
                .statusCode(200)
                .body("name", equalTo(quantityType.getName()));

        return newQuantityTypeId;
    }

    private Integer createAndTestField(final FieldDto fieldDto, final Integer unitId) {
        // TODO: validateFieldDto below
        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .body(fieldDto)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .queryParam("unitId", unitId)
                .post(baseUrl + "/fields")

                .then()
                .statusCode(200)
                .body("name", equalTo(fieldDto.getName()));

        Integer newFieldId = response.extract().path("id");

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/fields/" + newFieldId)

                .then()
                .statusCode(200)
                .body("name", equalTo(fieldDto.getName()));

        return newFieldId;
    }

    private Integer createAndTestUnit(final Integer quantityTypeId, final UnitDto unitDto) {
        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .body(unitDto)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .post(baseUrl + "/quantitytypes/" + quantityTypeId + "/units")

                .then()
                .statusCode(200)
                .body("name", equalTo(unitDto.getName()));

        Integer newUnitId = response.extract().path("id");

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/quantitytypes/" + quantityTypeId + "/units/" + newUnitId)

                .then()
                .statusCode(200)
                .body("name", equalTo(unitDto.getName()));

        return newUnitId;
    }

    private void setBaseUnit(final Integer quantityTypeId, final Integer baseUnitId) {
        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .queryParam("baseUnitId", baseUnitId)
                .put(baseUrl + "/quantitytypes/" + quantityTypeId)

                .then()
                .statusCode(200);

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/quantitytypes/" + quantityTypeId)

                .then()
                .statusCode(200)
                .body("baseUnitId", equalTo(baseUnitId));
    }

    private void createAndTestAssetTypeTemplateExpectError(final Integer assetTypeId,
                                                   final AssetTypeTemplateDto assetTypeTemplate) {

        given()
            .contentType(ContentType.JSON)
            .body(assetTypeTemplate)
            .header("Authorization", "Bearer " + accessTokenEcoMan)

            .when()
            .queryParam("assetTypeId", assetTypeId)
            .post(baseUrl + "/assettypetemplates")

            .then()
            .statusCode(500);
    }

    private Integer createAndTestAssetTypeTemplate(final Integer assetTypeId,
                                                   final AssetTypeTemplateDto assetTypeTemplate) {

        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .body(assetTypeTemplate)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .queryParam("assetTypeId", assetTypeId)
                .post(baseUrl + "/assettypetemplates")

                .then()
                .statusCode(200);

        validateBaseAssetDto(response, assetTypeTemplate);

        Integer newAssetTypeTemplateId = response.extract().path("id");

        response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/assettypetemplates/" + newAssetTypeTemplateId)

                .then()
                .statusCode(200);
        validateBaseAssetDto(response, assetTypeTemplate);

        return newAssetTypeTemplateId;
    }

    private Integer createAndTestAssetTypeTemplateFieldTarget(final Integer assetTypeTemplateId,
                                                              final Integer fieldId,
                                                              final FieldTargetDto fieldTarget) {
        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .body(fieldTarget)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .queryParam("fieldId", fieldId)
                .post(baseUrl + "/assettypetemplates/" + assetTypeTemplateId + "/fieldtargets")

                .then()
                .statusCode(200);

        Integer newFieldId = response.extract().path("id");

        response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/assettypetemplates/" + assetTypeTemplateId + "/fieldtargets/" + newFieldId)

                .then()
                .statusCode(200)
                .body("name", equalTo(fieldTarget.getName()))
                .body("description", equalTo(fieldTarget.getDescription()));
        String fieldType = response.extract().path("fieldType");
        assertThat(fieldType).isEqualTo(fieldTarget.getFieldType().name());

        return newFieldId;
    }

    private Integer createAndTestAssetType(final AssetTypeDto assetType) {
        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .body(assetType)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .post(baseUrl + "/assettypes")

                .then()
                .statusCode(200)
                .body("name", equalTo(assetType.getName()))
                .body("description", equalTo(assetType.getDescription()));

        Integer newAssetTypeId = response.extract().path("id");

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenEcoMan)

                .when()
                .get(baseUrl + "/assettypes/" + newAssetTypeId)

                .then()
                .statusCode(200)
                .body("name", equalTo(assetType.getName()))
                .body("description", equalTo(assetType.getDescription()));

        return newAssetTypeId;
    }

    private void validateBaseAssetDto(ValidatableResponse response, BaseAssetDto dto) {
        if (dto.getName() != null) {
            response.body("name", equalTo(dto.getName()));
        }
        if (dto.getDescription() != null) {
            response.body("description", equalTo(dto.getDescription()));
        }
        if (dto.getImageKey() != null) {
            response.body("imageKey", equalTo(dto.getImageKey()));
        }
    }

    private void validateFieldDto(ValidatableResponse response, FieldDto dto) {
        if (dto.getName() != null) {
            response.body("name", equalTo(dto.getName()));
        }
        if (dto.getDescription() != null) {
            response.body("description", equalTo(dto.getDescription()));
        }
        if (dto.getUnit() != null) {
            response.body("unit", equalTo(dto.getUnit()));
        }

        Float accuracy = response.extract().path("accuracy");
        assertThat(accuracy.doubleValue()).isCloseTo(dto.getAccuracy(), within(0.001));
    }

    private Integer createAndTestAssetSeries(final Integer companyId, final Integer assetTypeTemplateCompanyId,
                                             final Integer assetTypeTemplateId, final AssetSeriesDto assetSeries,
                                             final String accessToken) {

        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessToken)

                .when()
                .queryParam("assetTypeTemplateCompanyId", assetTypeTemplateCompanyId)
                .queryParam("assetTypeTemplateId", assetTypeTemplateId)
                .post(baseUrl + "/companies/" + companyId + "/assetseries")

                .then()
                .statusCode(200);

        Integer newAssetSeriesId = response.extract().path("id");

        response = given()
                .contentType(ContentType.JSON)
                .body(assetSeries)
                .header("Authorization", "Bearer " + accessToken)

                .when()
                .patch(baseUrl + "/companies/" + companyId + "/assetseries/" + newAssetSeriesId)

                .then()
                .statusCode(200);

        validateBaseAssetDto(response, assetSeries);

        response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessToken)

                .when()
                .get(baseUrl + "/companies/" + companyId + "/assetseries/" + newAssetSeriesId)

                .then()
                .statusCode(200);

        validateBaseAssetDto(response, assetSeries);

        return newAssetSeriesId;
    }

    private Integer createAndTestAsset(final Integer companyId, final Integer assetSeriesId,
                                       final Integer targetCompanyId, final AssetDto asset,
                                       final String accessToken) {

        ValidatableResponse response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessToken)

                .when()
                .post(baseUrl + "/companies/" + companyId + "/assetseries/" + assetSeriesId +
                        "/assets?targetCompanyId=" + targetCompanyId)

                .then()
                .statusCode(200);

        Integer newAssetId = response.extract().path("id");

        response = given()
                .contentType(ContentType.JSON)
                .body(asset)
                .header("Authorization", "Bearer " + accessToken)

                .when()
                .patch(baseUrl + "/companies/" + companyId + "/assetseries/" + assetSeriesId + "/assets/" + newAssetId)

                .then()
                .statusCode(200)
                .body("controlSystemType", equalTo(asset.getControlSystemType()))
                .body("hasGateway", equalTo(asset.getHasGateway()))
                .body("gatewayConnectivity", equalTo(asset.getGatewayConnectivity()));

        validateBaseAssetDto(response, asset);

        response = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessToken)

                .when()
                .get(baseUrl + "/companies/" + companyId + "/assetseries/" + assetSeriesId + "/assets/" + newAssetId)

                .then()
                .statusCode(200)
                .body("controlSystemType", equalTo(asset.getControlSystemType()))
                .body("hasGateway", equalTo(asset.getHasGateway()))
                .body("gatewayConnectivity", equalTo(asset.getGatewayConnectivity()));

        validateBaseAssetDto(response, asset);

        return newAssetId;
    }

    private void assignAssetToRoomAndTest(final Integer companyId, final Integer locationId, final Integer roomId,
                                          final Integer assetId) {
        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .put(baseUrl + "/companies/" + companyId + "/locations/" + locationId + "/rooms/" + roomId + "/assets/" + assetId)

                .then()
                .statusCode(200);

        given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + accessTokenFabManStruump)

                .when()
                .get(baseUrl + "/companies/" + companyId + "/locations/" + locationId + "/rooms/" + roomId +
                        "/assets/" + assetId)

                .then()
                .statusCode(200)
                .body("id", equalTo(assetId));
    }

    private String loginUser(String username) {
        ValidatableResponse response = given()
                .contentType(ContentType.URLENC)
                .formParam("grant_type", "password")
                .formParam("client_id", "fusion-frontend")
                .formParam("username", username)
                .formParam("password", "testadmin")

                .when()
                .post(keycloakUrl + "/realms/OISP/protocol/openid-connect/token")

                .then()
                .statusCode(200);

        return response.extract().path("access_token");
    }

    private void assertOffsetDateTimesEqualToSecond(final OffsetDateTime odt1, final OffsetDateTime odt2) {
        OffsetDateTime convertedOdt1 = odt1.withOffsetSameInstant(ZoneOffset.UTC).truncatedTo(ChronoUnit.SECONDS);
        OffsetDateTime convertedOdt2 = odt2.withOffsetSameInstant(ZoneOffset.UTC).truncatedTo(ChronoUnit.SECONDS);
        assertThat(convertedOdt1).isAtSameInstantAs(convertedOdt2);
    }
}
