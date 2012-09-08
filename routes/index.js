
exports.index = function(req, res){
	var connectionString = process.env.DATABASE_URL || 'postgres://root:root@localhost:5432/sound_motion';
	var pg = require('pg');
	
	pg.connect(connectionString, function(error, client) {
		if (error) {
			console.log(error);
			res.render('index', {title: 'Express', error: error});
		} else {
			client.query('SELECT * FROM movie', function(error, result) {
				if (error) {
					console.log(error);
					res.render('index', {title: 'Express', error: error});
				} else {
					res.render('index', {title: 'Express', result: result});
				}
			});
		}
	});
};