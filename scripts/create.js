// Run on heroku with:
// heroku run:detached node scripts/create

var database = require('../database');
var de = require('../data_entry');
var _ = require('underscore');


database.Movie.remove({}, function(){
  console.log("== REMOVED ALL MOVIES ==")
  // Fill it with the objects from the data_entry file
  _.each(de.movies, function(m) {
    console.log('inserting :' + m.title);
    // database.Movie.create(m);
    var p = new database.Movie(m);
    // console.log(p);
    p.save(function(err){
      if (!err) {
        console.log('Success!');
      } else {
        console.log("ERROR");
      }
    });
  });
  console.log("ok");
});

