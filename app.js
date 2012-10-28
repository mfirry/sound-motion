/**
 * Module dependencies.
 */
var express = require('express')
  , path    = require('path')
  , cons    = require('consolidate')
  , moment  = require('moment');
  
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

app.get('/test', function(req, res){
  res.render('index');
});

app.get('/', function(req, res){

  var movie = new mongoose.Schema({ title: String, description: String, screenings: [screening] });
  var screening = new mongoose.Schema ({venue: String, dates: [Date]});

  var Movie = db.model('Movie',movie);
  var Screening = db.model('Screening', screening)

  // console.log(moment(new Date()));
  // console.log(moment(new Date()).day(0));
  // console.log(moment(new Date()).day(14));

  var lastSunday = moment(new Date()).day(-7).toDate();
  var nextSunday = moment(new Date()).day(14).toDate();

  Movie.find({"screenings.dates":{$gte:lastSunday, $lte:nextSunday}}, function(err, movies){
    console.log(movies[0].screenings[0].dates[0]);

    // FIXME: this is way too lame
    movies[0].class = "label";
    movies[0].week  = "Last week";
    movies[1].class = "label label-success";
    movies[1].week  = "This week";
    movies[2].class = "label label-info";
    movies[2].week  = "Next week";

    res.render('index', {
      movies: movies,
      the_date: function() {
        return function(text, render) {
          var date = moment(new Date(render(text)));
          return date.format("MMMM, D YYYY").replace(/ /g,'&nbsp;');
        }
      },
      the_time: function() {
        return function(text, render) {
          var date = moment(new Date(render(text)));
          return date.format("HH:mm");
        }
      }
    });
  });
    
  // Movie.find({}, function(err, screenings){
  //     console.log(screenings);
  //     res.send(screenings);
  // });
});

app.get('/create', function(req, res) {
    var movie = new mongoose.Schema({
        title: String,
        description: String,
        screenings: [screening]
    });
    var screening = new mongoose.Schema({
        venue: String,
        dates: [Date]
    });

    var Movie = db.model('Movie', movie);
    var Screening = db.model('Screening', screening)
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

app.listen(app.get('port') || process.env.PORT || 3000, function() {
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
