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
	//var connectionString = 'postgres://root:root@localhost:5432/sound_motion';
	//var pg = require('pg');
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
	
	/*pg.connect(connectionString, function(error, client) {
		if (error) {
			console.log(error);
			res.render('index', {title: 'Express', error: error, result: false});
		} else {
			client.query('SELECT * FROM movie', function(error, result) {
				if (error) {
					console.log(error);
					res.render('index', {title: 'Express', error: error, result: false});
				} else {
					res.render('index', {title: 'Express', error: false, result: result});
				}
			});
		}
	});*/
	
	db.query('SELECT * FROM movie', function(result) {
		console.log(result);
		res.render('index', {title: 'Express', error: false, result: result});
	}, function(error) {
		console.log(error);
		res.render('index', {title: 'Express', error: error, result: false});
	});
};