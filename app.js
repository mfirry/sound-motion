
/**
 * Module dependencies.
 */

var moment = require('moment');

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
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

//app.get('/', routes.index);
app.get('/', function(req, res){

	var mongoose = require('mongoose')
	  , db = mongoose.createConnection('localhost', 'local');

	var movie = new mongoose.Schema({ title: String, description: String, screenings: [screening] });
	var screening = new mongoose.Schema ({venue: String, dates: [Date]});

	var Movie = db.model('Movie',movie);
	var Screening = db.model('Screening', screening)

	var fluffy = new Movie({ title: 'fluffy', description: "", screenings: [] }).save();

	console.log(moment(new Date()));
	console.log(moment(new Date()).day(14));
	console.log(moment(new Date()).day(0));

	var lastSunday = moment(new Date()).day(0).toDate();
	var nextSunday = moment(new Date()).day(14).toDate();

	Movie.find({"screenings.date":{$gte:lastSunday, $lte:nextSunday}}, function(err, screenings){
		console.log(screenings);
	    res.send(screenings);
	});
});

app.listen(3000, function(){
	console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});


/*http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});*/
