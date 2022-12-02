module.exports = {
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    }
  },
  "/auth": {
    "target": "http://localhost:8081",
    "secure": false,
  },
  "/ngsildapi": {
    "target": "http://localhost:9090/ngsi-ld/v1/entities",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/ngsildapi": ""
    }
  },
  "/kairosapi": {
    "target": "https://test.streammyiot.com/v1/api",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/kairosapi": ""
    }
  },
  "/alertaapi": {
    "target": "http://localhost:8082/api",
    "secure": false,
    "pathRewrite": {
      "^/alertaapi": ""
    }
  },
};
