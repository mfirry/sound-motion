var DBTYPE_POSTGRES = 'pg';
var DBTYPE_MYSQL = 'mysql';

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
		this.connectionString = process.env.DATABASE_URL;
		//'postgres://' + this.config.user + ':' + this.config.password + '@' + this.config.host + ':' + this.config.port + '/' + this.config.database;
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
};

exports.DBTYPE_POSTGRES = DBTYPE_POSTGRES;
exports.DBTYPE_MYSQL = DBTYPE_MYSQL;

exports.DB = DB;
