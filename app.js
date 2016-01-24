/**
 * Module dependencies.
 */
var express = require('express'),
  path = require('path'),
  cons = require('consolidate'),
  moment = require('moment'),
  _ = require('underscore');

/**
 * Internal modules
 */
var database = require("./database.js");

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.engine('.html', cons.mustache);
  app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
  app.use(express.logger('default'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

function render(res, movies, all) {
  console.log('movies.length:', movies.length);
  _.each(movies, function(m) {
    m.today = false;
    _.each(m.screenings, function(s) {
      s.today = false;
      var sdate = moment(new Date(s.dates[0]));
      if (0 === moment(sdate)
        .day(0)
        .startOf('day')
        .diff(moment()
        .day(0)
        .startOf('day'))) {
        m.this_week = true;
      }
      if (0 === moment(sdate)
        .day(0)
        .startOf('day')
        .diff(moment()
        .day(7)
        .startOf('day'))) {
        m.next_week = true;
      }
      if (0 === moment(sdate)
        .startOf('day')
        .diff(moment()
        .startOf('day'))) {
        s.today = true;
        m.today = true;
      }
    });
  });

  res.render('index', {
    movies: movies,
    poster_url: function() {
      return function(text, render) {
        var filename = render(text).split(
          'http:&#x2F;&#x2F;ia.media-imdb.com&#x2F;images&#x2F;M&#x2F;'
          )[1];
        return 'img/posters/' + filename;
      }
    },
    date_month: function() {
      return function(text, render) {
        var date = moment(new Date(render(text)));
        return date.format("MMMM");
      }
    },
    date_day: function() {
      return function(text, render) {
        var date = moment(new Date(render(text)));
        return date.format("D");
      }
    },
    time_hour: function() {
      return function(text, render) {
        var date = moment(new Date(render(text)));
        return date.format("HH");
      }
    },
    time_mins: function() {
      return function(text, render) {
        var date = moment(new Date(render(text)));
        return date.format("mm");
      }
    },
    anchor: movies[0].url || '',
    show_all: all
  });
};

function all(res) {
  var query = database.Movie.find();
  query.sort({
    "screenings.dates": 1
  });

  query.exec(function(err, movies) {
    render(res, movies, 'none');
  });
};

app.get('/', function(req, res) {
  console.log('HERE I AM');
  var lastSunday = moment(new Date())
    .day(0)
    .toDate();
  var nextSunday = moment(new Date())
    .day(14)
    .toDate();

  var query = database.Movie.where("screenings.dates")
    .gte(lastSunday)
    .lte(nextSunday);
  query.sort({
    "screenings.dates": 1
  });
  query.exec(function(err, movies) {
    render(res, movies, 'show');
  });
});

app.get('/movie/:name', function(req, res) {
  var query = database.Movie.findOne({
    "url": req.params.name
  });
  query.exec(function(err, movie) {
    if (err) res.send(404);
    else {
      res.render("detail", {
        movie: movie,
        poster_url: function() {
          return function(text, render) {
            var filename = render(text).split(
              'http:&#x2F;&#x2F;ia.media-imdb.com&#x2F;images&#x2F;M&#x2F;'
              )[1];
            return '/img/posters/' + filename;
          }
        },
        date_month: function() {
          return function(text, render) {
            var date = moment(new Date(render(text)));
            return date.format("MMMM");
          }
        },
        date_day: function() {
          return function(text, render) {
            var date = moment(new Date(render(text)));
            return date.format("D");
          }
        },
        time_hour: function() {
          return function(text, render) {
            var date = moment(new Date(render(text)));
            return date.format("HH");
          }
        },
        time_mins: function() {
          return function(text, render) {
            var date = moment(new Date(render(text)));
            return date.format("mm");
          }
        }
      });
    }
  });
});

app.get('/all', function(req, res) {
  all(res);
});

app.listen(app.get('port') || process.env.PORT || 3000, function() {
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
