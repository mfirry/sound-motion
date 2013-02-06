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
var screening = new mongoose.Schema({venue: String, dates: [Date]});
var Movie = db.model('Movie', movie);
var Screening = db.model('Screening', screening)

exports.Movie = Movie;
exports.Screening = Screening;
exports.db = db;
