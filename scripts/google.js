var doc = "0AtFF6SiRVHtIdEpzelh6S21OODNLeHpTZ2FWWjU3WWc";

var           _ = require("underscore");
var Spreadsheet = require("spreadsheet");
var database    = require('../database');

var insert = function() {

  var sheet = new Spreadsheet(doc);
  sheet.worksheets(function(err,ws){
    console.log("=== Sheet: " + ws.title);
    var venue = ws.title;
    ws.eachRow(function(err,row,meta){
      var movie = new Object();
      movie.title = row.title;
      movie.imdb = row.imdb;
      movie.description = row.description;
      movie.screenings = [];
      //possibly useful for direct url to movie detail page
      //movie.url = row.title.toLowerCase().replace(/\W/g, '-');
      _.each([row.screening1, row.screening2, row.screening3, row.screening4,
             row.screening5], function(s) {
               // If typeof === object, the cell is probably empty
               if (typeof(s)!=="object") movie.screenings.push(s);
      });
      database.Movie.create(movie, function(err){
        if (err) console.log(err);
        else console.log("Inserted: " + venue + " - " + movie.title + ", "+movie.url);
      });
      // database.Movie.update({title: movie.title}, movie, {upsert: true}, function(err){
      //   console.log("- " + movie.title);
      //   if (err) console.log(err);
      // });
    })
  });

};

database.Movie.remove({}, function(){
  console.log("!! Removed all movies");
  insert();
});

