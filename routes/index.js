
exports.index = function(req, res){
	var connectionString = process.env.DATABASE_URL || 'postgres://root:root@localhost:5432/sound_motion';
	var pg = require('pg').native;
	
	pg.connect(connectionString, function(error, client) {
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
	});
};