var doc = "0AtFF6SiRVHtIdEpzelh6S21OODNLeHpTZ2FWWjU3WWc";

var           _ = require("underscore");
var      moment = require("moment");
var Spreadsheet = require("spreadsheet");
var async       = require("async");
var database    = require('../database');

var movies = {};

function parse(id, venue, callback) {
  var sheet = new Spreadsheet(doc);
  sheet.worksheet(id, function(err,ws){
    console.log("=== v: " + venue);
    ws.eachRow(function(err,row,meta){
      if(err) {console.log(err);}

      if (!movies[row.imdb]) {
        movie = {
          title: row.title,
          imdb: row.imdb,
          description: row.description,
          url: row.title.toLowerCase().replace(/\W/g, '-'),
          screenings: []
        };
        movies[row.imdb] = movie;
      }
      var dates = [];
      _.each([row.screening1, row.screening2, row.screening3, row.screening4,
             row.screening5], function(s) {
         // If typeof === object, the cell is probably empty
         if (typeof(s)!=="object") {
           var date = moment(s, "DD/MM/YYYY HH:mm");
           dates.push(date);
         }
      });

      var x = new database.Screening({venue: venue, dates: dates});
      movies[row.imdb].screenings.push(x);

      console.log("added to movies: " + row.title)

      if(meta.index === meta.total){
        // movie.last_row = true;
        console.log("ultima riga")
        callback(null);
      }

      // database.Movie.create(movie, function(err){
      //   console.log("!!"+movie.last_row);
      //   if (err) {
      //     console.log('ERR: '+err);
      //     //callback(err);
      //   } else {
      //     console.log("Inserted: " + venue + " - " + movie.title + ", " + movie.url);
      //     if (movie.last_row) {console.log('fine'); callback(null);}
      //   }
      // });
      // database.Movie.update({title: movie.title}, movie, {upsert: true}, function(err){
      //   console.log("- " + movie.title);
      //   if (err) console.log(err);
      // });
    })
  });

};

database.Movie.remove({}, function(){
  console.log("!! Removed all movies");
  async.series([
    function(callback){ parse(1, "anteo", callback) },
    function(callback){ parse(2, "arcobaleno", callback) },
    function(callback){ parse(3, "mexico", callback) },
  ], function(err, results){
    console.log(err);
    console.log('\\m/');
    console.log(movies);
    database.db.disconnect();
  })
});
