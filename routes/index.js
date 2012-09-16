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
		{monday: lastMonday.toFormat(dateFormat), sunday: lastSunday.toFormat(dateFormat)},
		{monday: monday.toFormat(dateFormat), sunday: sunday.toFormat(dateFormat)},
		{monday: nextMonday.toFormat(dateFormat), sunday: nextSunday.toFormat(dateFormat)}
	];

	var db = new dbi.DB(USE_DBTYPE == dbi.DBTYPE_POSTGRES ? {
		engineType: DBTYPE_POSTGRES,
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
	
	var mainQuery = 'SELECT distinct movie_id AS id FROM screening where date >=\'' + lastMonday.toYMD('-') + '\' UNION SELECT distinct movie_id FROM screening where date <=\'' + nextSunday.toYMD('-') + '\'';
	db.query(mainQuery, function(results) {
		var callbacks = [];
		for (var i = 0; i < results.length; i++) {
			var secondQuery = 'SELECT * FROM movie where id = ' + results[i].id;
			(function(query) {
				callbacks.push(function(callback) {
					db.query(query, function(result) {
						callback(null, result[0]);
					});
				});
			})(secondQuery);
		}
		async.parallel(callbacks, function(error, results){
			if (error) {
				console.log(error);
				res.render('index', {title: 'Express', error: error, result: false, weeks: weeks});
			} else {
				console.log(results);
				res.render('index', {title: 'Express', error: error, result: results, weeks: weeks});
			}
		});
	}, function(error) {
		console.log(error);
		res.render('index', {title: 'Express', error: error, result: false, weeks: weeks});
	});
};