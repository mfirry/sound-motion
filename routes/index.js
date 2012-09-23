require('date-utils');
var async = require('async');
var dbi = require('../libs/db');

var USE_DBTYPE = dbi.DBTYPE_MYSQL;

exports.index = function(req, res){
	var dateFormat = 'YYYY-MM-DD';
	var now = new Date();
	var dayOfWeek = (now.getDay() + 6) % 7;
	var monday = now.clone();
	monday.addDays(-dayOfWeek);
	var sunday = monday.clone()
	sunday.addDays(6);
	var lastMonday = monday.clone();
	lastMonday.addDays(-7);
	var lastSunday = sunday.clone()
	lastSunday.addDays(-7);
	var nextMonday = monday.clone();
	nextMonday.addDays(7);
	var nextSunday = sunday.clone()
	nextSunday.addDays(7);
	var weeks = [
		{monday: lastMonday, sunday: lastSunday},
		{monday: monday, sunday: sunday},
		{monday: nextMonday, sunday: nextSunday}
	];

	var db = new dbi.DB(USE_DBTYPE == dbi.DBTYPE_POSTGRES ? {
		engineType: dbi.DBTYPE_POSTGRES,
		host: 'localhost',
		port: '5432',
		database: 'sound_motion',
		user: 'root',
		password: 'root'
	} : {
		engineType: dbi.DBTYPE_MYSQL,
		host: 'localhost',
		port: '3306',
		database: 'sound_motion',
		user: 'root',
		password: 'root'
	});
	
	var callbacks = [];
	for (var i = 0; i < weeks.length; i++) {
		var week = weeks[i];
		var mainQuery = 'SELECT movie.id AS id, title, link, note, date, time FROM screening JOIN movie ON screening.movie_id = movie.id WHERE date >= \'' + week.monday.toYMD() + '\' AND date <= \'' + week.sunday.toYMD() + '\'';
		(function(query) {
			callbacks.push(function(callback) {
				db.query(query, function(results) {
					var movies = {};
					for (var j = 0; j < results.length; j++) {
						var movie = results[j];
						if (!movies[movie.id]) {
							movies[movie.id] = {
								id: movie.id,
								title: movie.title,
								link: movie.link,
								note: movie.note,
								dates: {}
							};
						}
						var date = movie.date.toYMD();
						if (!movies[movie.id].dates[date]) {
							movies[movie.id].dates[date] = [];
							movies[movie.id].dates[date].date = movie.date;
						}
						movies[movie.id].dates[date].push(movie.time);
					}
					callback(null, movies);
				});
			});
		})(mainQuery);
	}
	async.parallel(callbacks, function(error, results){
		if (error) {
			console.log(error);
			res.render('index', {error: error, weeks: false});
		} else {
			console.log(results);
			res.render('index', {error: error, weeks: results});
		}
	});
};