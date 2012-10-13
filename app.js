
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

app.get('/', function(req, res){
    console.log('db_url: '+process.env.MONGOHQ_URL);
	var mongoose = require('mongoose');
    // try {
        db = mongoose.connect(process.env.MONGOHQ_URL);
    // } catch(e) {
    //     db = mongoose.createConnection('localhost', 'local');
    // }

	var movie = new mongoose.Schema({ title: String, description: String, screenings: [screening] });
	var screening = new mongoose.Schema ({venue: String, dates: [Date]});

	var Movie = db.model('Movie',movie);
	var Screening = db.model('Screening', screening)

	console.log(moment(new Date()));
    console.log(moment(new Date()).day(0));
	console.log(moment(new Date()).day(14));

	var lastSunday = moment(new Date()).day(0).toDate();
	var nextSunday = moment(new Date()).day(14).toDate();

    Movie.find({"screenings.dates":{$gte:lastSunday, $lte:nextSunday}}, function(err, screenings){
        console.log(screenings);
        res.send(screenings);
    });
    
    db.disconnect();
    
    // Movie.find({}, function(err, screenings){
    //     console.log(screenings);
    //     res.send(screenings);
    // });
});

app.get('/create', function(req, res) {
    var mongoose = require('mongoose');
    // try {
        db = mongoose.connect(process.env.MONGOHQ_URL);
        console.log('db_url: '+process.env.MONGOHQ_URL);
    // } catch (e) {
    //     db = mongoose.createConnection('localhost', 'local');
    // }

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

    for (k in de.movies) {
        console.log('inserting :' + de.movies[k].title);
        new Movie(de.movies[k]).save();
    }
    db.disconnect();
    res.send("ok");
});

app.listen(app.get('port') || 3000, function() {
    console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

/*http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});*/
