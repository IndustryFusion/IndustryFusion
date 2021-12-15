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
  "/oispapi": {
    "target": "https://development.industry-fusion.com/v1/api",
    "secure": false,
    "pathRewrite": {
      "^/oispapi": ""
    }
  },
  "/kairosapi": {
    "target": "https://development.industry-fusion.com/tsdb/api/v1",
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
