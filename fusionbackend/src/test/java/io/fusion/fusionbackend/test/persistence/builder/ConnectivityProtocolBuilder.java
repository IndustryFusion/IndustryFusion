package io.fusion.fusionbackend.test.persistence.builder;

import io.fusion.fusionbackend.model.ConnectivityProtocol;


public class ConnectivityProtocolBuilder implements Builder<ConnectivityProtocol> {

    private ConnectivityProtocolBuilder() {
    }

    public static ConnectivityProtocolBuilder aConnectivityProtocol() {
        return new ConnectivityProtocolBuilder();
    }


    @Override
    public ConnectivityProtocol build() {
        ConnectivityProtocol connectivityProtocol = new ConnectivityProtocol();
        connectivityProtocol.setName(TEST_STRING);
        return connectivityProtocol;
    }
}
