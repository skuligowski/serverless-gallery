'use strict';
const swaggerParser = require('swagger-parser');
const swaggerTools = require('swagger-tools');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var session = require('express-session');
const compression = require('compression');
const db = require('./controllers/db');
const auth = require('./controllers/auth');

const app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));

auth.initialize(app);

swaggerParser.bundle('../spec/gallery-api.yaml').then(spec => {
  swaggerTools.initializeMiddleware(spec, function (middleware) {
    app.use(middleware.swaggerMetadata());
    app.use(middleware.swaggerSecurity({
      oauth2: function (req, def, scopes, callback) { }
    }));
    app.use(middleware.swaggerValidator({
      validateResponse: true
    }));
    app.use(middleware.swaggerRouter({ useStubs: false, controllers: './controllers' }));
    app.use(middleware.swaggerUi());

    app.listen(3000);
  });
});