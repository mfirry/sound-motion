/**
 * Module dependencies.
 */
var express = require('express')
  , path    = require('path')
  , cons    = require('consolidate')
  , moment  = require('moment')
  , _       = require('underscore');

/**
 * Internal deps
 */  
var database = require("./database.js");


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.engine('.html', cons.mustache);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);  
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

function render(res, movies){
  _.each(movies, function(m){
    m.today = false;
    _.each(m.screenings, function(s){
      s.today = false;
      var sdate = moment(new Date(s.dates[0]));
      if (0 === moment(sdate).day(0).startOf('day').diff(moment().day(0).startOf('day'))) {
        m.this_week = true;
      }
      if (0 === moment(sdate).day(0).startOf('day').diff(moment().day(7).startOf('day'))) {
        m.next_week = true;
      }
      if (0 === moment(sdate).startOf('day').diff(moment().startOf('day'))) {
        s.today = true;
        m.today = true;
      }
    });
  });

  res.render('index', {
    movies: movies,
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
};

function all(res) {
  var query = database.Movie.find();
  query.sort({"screenings.dates": 1});

  query.exec(function(err, movies){
    render(res, movies);
  });
};

function imdb() {
  var rest = require('restler');
  database.Movie.find(function(err, movies) {
    _.each(movies, function(movie) {
      if (movie.imdb) {
        // console.log(movie.imdb)
        var query = {
          i: movie.imdb
        }
      } else {
        var query = {
          t: movie.title
        }
      }
      rest.get('http://www.omdbapi.com/', {
        query: query,
        parser: rest.parsers.json
      }).on('complete', function(data) {
        var util = require('util'),
          tmp = data.Poster.split('http://ia.media-imdb.com/images/M/');
        exec = require('child_process').exec, child, url = data.Poster;

        child = exec('wget -nc -P public/img/posters/ ' + url,
        function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
        });  
        data.Poster = tmp[1];
        movie.omdb = data
        movie.omdb.Poster = tmp[1];
        movie.save();
      });
    });
  });
};

app.get('/', function(req, res){
  var lastSunday = moment(new Date()).day(0).toDate();
  var nextSunday = moment(new Date()).day(14).toDate();

  var query = database.Movie.where("screenings.dates").gte(lastSunday).lte(nextSunday);
  query.sort({"screenings.dates": 1});

  query.exec(function(err, movies){
    render(res, movies);
  });
});

app.get('/:name', function(req, res){
  if(req.params.name == 'imdb') imdb();
  if(req.params.name == 'all') all(res);
  else {
    var query = database.Movie.findOne({"url": req.params.name}); //TODO: maybe 'uri' is better than url
    query.exec(function(err, movie) {
      if(err) res.send(404);
      else {
        res.render("detail", movie);
      }
    });
  }
});

app.get('/create', function(req, res) {
    var de = require('./data_entry');

    // Empty the mongodb collection
    database.Movie.remove({}, function(){
      console.log("== REMOVED ALL MOVIES ==")
      // Fill it with the objects from the data_entry file
      for (var k in de.movies) {
        console.log('inserting :' + de.movies[k].title);
        new database.Movie(de.movies[k]).save();
      }
      res.send("ok");
    });
});

app.get('/all', function(req, res) { all(res); });

app.get('/imdb', function(req, res) { 
  imdb(); 
  res.send("ok"); 
});

app.get('/anteo', function(req, res) {
  res.render('anteo');
});

app.get('/mexico', function(req, res) {
  res.render('mexico');
});

app.get('/arcobaleno', function(req, res) {
  res.render('arcobaleno');
});

app.get('/entry', function(req, res) {
  res.render('entry');
});

// app.post('/entry', function(req, res){
//   console.log('title: ' + req.body.title);
//   console.log('imdb: ' + req.body.imdb);
//   console.log('description: ' + req.body.description);
//   var screenings = new Array();
//   _.each(req.body.screening, function() {
//     new Screening({venue: String, dates: [Date]});
//   });
//   var m = new database.Movie({ title: req.body.title, imdb: req.body.imdb, description: req.body.description });
//   res.send("ok");
// });

app.listen(app.get('port') || process.env.PORT || 3000, function() {
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
