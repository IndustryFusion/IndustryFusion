package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.ConnectivityProtocol;
import io.fusion.fusionbackend.model.ConnectivityType;


public class ConnectivityTypeBuilder implements Builder<ConnectivityType> {

    private Builder<ConnectivityProtocol> connectivityProtocolBuilder;

    private ConnectivityTypeBuilder() {
    }

    public static ConnectivityTypeBuilder aConnectivityType() {
        return new ConnectivityTypeBuilder();
    }


    public ConnectivityTypeBuilder withProtocol(Builder<ConnectivityProtocol> connectivityProtocolBuilder) {
        this.connectivityProtocolBuilder = connectivityProtocolBuilder;

        return this;
    }

    @Override
    public ConnectivityType build() {
        ConnectivityType connectivityType = new ConnectivityType();
        connectivityType.setName(TEST_STRING);
        connectivityType.setInfoText(TEST_STRING);


        if (connectivityProtocolBuilder != null) {
            connectivityType.getAvailableProtocols().add(connectivityProtocolBuilder.build());
        }

        return connectivityType;
    }
}
