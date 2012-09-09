require('date-utils');

var DBTYPE_POSTGRES = 'pg';
var DBTYPE_MYSQL = 'mysql';

var USE_DBTYPE = DBTYPE_MYSQL;

var DB = function(config) {
	this.config = config || {};
	var defaultConfig = {
		engineType: DBTYPE_POSTGRES,
		host: 'localhost',
		port: '5432',
		database: 'sound_motion',
		user: 'root',
		password: 'root'
	};
	for (var field in defaultConfig)
		if (!this.config[field])
			this.config[field] = defaultConfig[field];

	this.engine = require(this.config.engineType);
	
	if (this.config.engineType == DBTYPE_POSTGRES) {
		this.client = this.engine;
		this.connectionString = 'postgres://' + this.config.user + ':' + this.config.password + '@' + this.config.host + ':' + this.config.port + '/' + this.config.database;
		this.query = function(query, callback, errorCallback) {
			this.engine.connect(this.connectionString, function(error, client) {
				if (error) {
					if (errorCallback) {
						errorCallback(error);
					} else {
						console.log(error);
					}
				} else {
					client.query(query, function(error, result) {
						if (error) {
							if (errorCallback) {
								errorCallback(error);
							} else {
								console.log(error);
							}
						} else {
							callback(result.rows);
						}
					});
				}
			});
		};
	} else if (this.config.engineType == DBTYPE_MYSQL) {
		this.client = this.engine.createClient({
			host: this.config.host,
			port: this.config.port,
			database: this.config.database,
			user: this.config.user,
			password: this.config.password
		});
		this.query = function(query, callback, errorCallback) {
			this.client.query(query, [], function (error, result, fields) {
				if (error) {
					if (errorCallback) {
						errorCallback(error);
					} else {
						console.log(error);
					}
				} else {
					callback(result);
				}
			});
		};
	}
}

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

	var db = new DB(USE_DBTYPE == DBTYPE_POSTGRES ? {
		engineType: DBTYPE_POSTGRES,
		host: 'localhost',
		port: '5432',
		database: 'sound_motion',
		user: 'root',
		password: 'root'
	} : {
		engineType: DBTYPE_MYSQL,
		host: 'localhost',
		port: '3306',
		database: 'sound_motion',
		user: 'root',
		password: 'root'
	});
	
	db.query('SELECT * FROM movie', function(result) {
		console.log(result);
		res.render('index', {title: 'Express', error: false, result: result, weeks: weeks});
	}, function(error) {
		console.log(error);
		res.render('index', {title: 'Express', error: error, result: false, weeks: weeks});
	});
};