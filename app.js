module.exports = function () {

  var express = require('express');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var mongoose = require('mongoose');
  var session = require('express-session');
  var MongoStore = require('connect-mongo')(session);
  var main = require('./routes/main');
  var authenticate = require('./routes/authenticate');
  var sites = require('../bin/siteManager.json');
  port = sites.Astroweb.port;
  subRoute = sites.Astroweb.subRoute;

  var app = express();

  // mongodb connection
  mongoose.connect("mongodb://localhost:27017/astroweb");
  var db = mongoose.connection;
  // mongo error
  db.on('error', console.error.bind(console, 'connection error:'));

  // use sessions for tracking logins
  app.use(session({
    secret: 'pitaya',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
  }));

  // make user ID available in templates
  app.use(function (req, res, next) {
    res.locals.currentUser = req.session.userId;
    res.locals.subRoute = subRoute;
    next();
  });

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use('/static', express.static(__dirname + '/public'));

  app.use(subRoute, main());
  app.use(subRoute, authenticate());

  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });


  app.set('port', port);

  console.log("Serving page at :" + port);

  return app;
}
