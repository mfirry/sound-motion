/**
 * Module dependencies.
 */
var express = require('express')
  , path    = require('path')
  , cons    = require('consolidate')
  , moment  = require('moment')
  , _       = require('underscore');
  
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

// DB connection: connect here, use it everywhere
var mongoose = require('mongoose');

if (process.argv[2]) {
  var db = mongoose.connect(process.argv[2]);
} else if (process.env.MONGOHQ_URL) {
  var db = mongoose.connect(process.env.MONGOHQ_URL);
} else {
  var db = mongoose.connect('mongodb://localhost/local');
}

// DB Schema
var movie = new mongoose.Schema({ title: String, imdb: String, omdb: Object, description: String, screenings: [screening] });
var screening = new mongoose.Schema ({venue: String, dates: [Date]});
var Movie = db.model('Movie', movie);
var Screening = db.model('Screening', screening)

var render = function(res, movies){
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

app.get('/test', function(req, res){
  res.render('index');
});

app.get('/', function(req, res){

  var lastSunday = moment(new Date()).day(0).toDate();
  var nextSunday = moment(new Date()).day(14).toDate();

  var query = Movie.where("screenings.dates").gte(lastSunday).lte(nextSunday);
  query.sort({"screenings.dates": 1});

  query.exec(function(err, movies){
    render(res, movies);
  });

});

app.get('/create', function(req, res) {
    var de = require('./data_entry');

    // Empty the mongodb collection
    Movie.remove({}, function(){
      console.log("== REMOVED ALL MOVIES ==")
      // Fill it with the objects from the data_entry file
      for (var k in de.movies) {
        console.log('inserting :' + de.movies[k].title);
        new Movie(de.movies[k]).save();
      }
      res.send("ok");
    });
});

app.get('/all', function(req, res){
  
  var query = Movie.find();
  query.sort({"screenings.dates": 1});

  query.exec(function(err, movies){
    render(res, movies);
  });
});

app.get('/imdb', function(req,res){

  var rest = require('restler');

  Movie.find(function(err, movies) {
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
        if (data.Poster) {
          var tmp = data.Poster.split('http://ia.media-imdb.com/images/M/');
          data.Poster=tmp[1];
        }
        if(movie.title=='HOPE SPRINGS') {
          var util = require('util'),
              exec = require('child_process').exec,
              child,
              url = data.Poster;

          child = exec('wget ' + url,
            function (error, stdout, stderr) {
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);
              if (error !== null) {
                console.log('exec error: ' + error);
              }
          });  
        }
        movie.omdb = data
        movie.save();
      });
    });
  });
  res.send("ok");
});

app.get('/anteo', function(req,res){
  res.render('anteo');
});

app.get('/mexico', function(req,res){
  res.render('mexico');
});

app.get('/arcobaleno', function(req,res){
  res.render('arcobaleno');
});

app.listen(app.get('port') || process.env.PORT || 3000, function() {
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
