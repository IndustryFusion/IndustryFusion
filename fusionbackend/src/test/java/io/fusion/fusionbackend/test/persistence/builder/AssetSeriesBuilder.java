package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.AssetSeries;
import io.fusion.fusionbackend.model.AssetTypeTemplate;
import io.fusion.fusionbackend.model.Company;
import io.fusion.fusionbackend.model.ConnectivityProtocol;
import io.fusion.fusionbackend.model.ConnectivitySettings;
import io.fusion.fusionbackend.model.ConnectivityType;

public class AssetSeriesBuilder implements Builder<AssetSeries> {

    private Builder<AssetTypeTemplate> assetTypeTemplateBuilder = AssetTypeTemplateBuilder.anAssetTypeTemplate();
    private Company company;
    private ConnectivityType connectivityType;
    private ConnectivityProtocol connectivityProtocol;

    private AssetSeriesBuilder() {
    }

    public static AssetSeriesBuilder anAssetSeries() {
        return new AssetSeriesBuilder();
    }

    public AssetSeriesBuilder forCompany(Builder<Company> companyBuilder) {
        this.company = companyBuilder.build();
        return this;

    }

    public AssetSeriesBuilder forCompany(Company company) {
        this.company = company;
        return this;

    }

    public AssetSeriesBuilder basedOnTemplate(Builder<AssetTypeTemplate> assetTypeTemplateBuilder) {
        this.assetTypeTemplateBuilder = assetTypeTemplateBuilder;
        return this;
    }

    public AssetSeriesBuilder withConnectivitySettingsFor(ConnectivityType connectivityType, ConnectivityProtocol connectivityProtocol) {
        this.connectivityType  = connectivityType;
        this.connectivityProtocol = connectivityProtocol;

        return this;
    }

    @Override
    public AssetSeries build() {
        AssetSeries assetSeries = new AssetSeries();

        if (company == null) {
            company = CompanyBuilder.aCompany().build();
        }
        assetSeries.setCompany(company);
        company.getAssetSeries().add(assetSeries);

        AssetTypeTemplate assetTypeTemplate = assetTypeTemplateBuilder.build();
        assetSeries.setAssetTypeTemplate(assetTypeTemplate);
        assetTypeTemplate.getAssetSeries().add(assetSeries);

        if (this.connectivityType != null && this.connectivityProtocol != null) {
            ConnectivitySettings connectivitySettings = new ConnectivitySettings();
            connectivitySettings.setConnectionString(TEST_STRING);
            connectivitySettings.setConnectivityType(this.connectivityType);
            connectivitySettings.setConnectivityProtocol(this.connectivityProtocol);
            assetSeries.setConnectivitySettings(connectivitySettings);
        }

        return assetSeries;
    }
}
