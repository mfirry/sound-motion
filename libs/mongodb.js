var mongoose = require('mongoose')
  , db = mongoose.createConnection('localhost', 'local');

var movie = new mongoose.Schema({ title: String, description: String, screenings: [screening] });
var screening = new mongoose.Schema ({venue: String, dates: [Date]});

var Movie = db.model('Movie',movie);
var Screening = db.model('Screening', screening)

var fluffy = new Movie({ title: 'fluffy', description: "", screenings: [] }).save();

Movie.find(function(err, screenings){
	console.log(err);
	console.log('here we are');
        console.log(screenings);
});

//Screening.find(function(err, screenings){
//	console.log(screenings);
//});
