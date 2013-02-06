var doc = "0AtFF6SiRVHtIdEpzelh6S21OODNLeHpTZ2FWWjU3WWc";

var           _ = require("underscore");
var      moment = require("moment");
var        rest = require('restler');
var Spreadsheet = require("spreadsheet");
var       async = require("async");
var    database = require('../database');

var movies = {};
var inserted = 0;

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
    })
  });

};

function insert(callback) {
  _.each(movies, function(m) {
    console.log("inserting: " + m.title);
    var movie = new database.Movie(m);
    movie.save(function(err){
      if (err) {
        console.log('ERR: '+err);
        //callback(err);
      } else {
        console.log("inserted: " + m.title);
        imdb(movie);
        inserted++;
        if (inserted == _.keys(movies).length) {
          callback(null);
        }
      }
    });
  });
};

function imdb(movie) {
  console.log("IMDB: " + movie.title);

  if (movie.imdb) {
    var query = {
      i: movie.imdb
    }
  } else {
    var query = {
      t: movie.title
    }
  }
  rest.get('http://www.omdbapi.com/', {
    query: query,
    parser: rest.parsers.json
  }).on('complete', function(data) {
    if (data.Poster) {
      console.log("Wgetting poster image for " + movie.title);

      tmp = data.Poster.split('http://ia.media-imdb.com/images/M/');
      exec = require('child_process').exec, child, url = data.Poster;
      child = exec(
        'wget -nc -P public/img/posters/ ' + url,
        function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
        }
      );
    }

    data.Poster = tmp[1];
    movie.omdb = data
    movie.omdb.Poster = tmp[1];
    movie.save(function(){
      if (err) {
        console.log(err);
      } else {
        console.log("updated on db: " + movie.title);
      }
    });
  });
};

database.Movie.remove({}, function(){
  console.log("!! Removed all movies");
  async.series([
    function(callback){ parse(1, "anteo", callback) },
    function(callback){ parse(2, "arcobaleno", callback) },
    function(callback){ parse(3, "mexico", callback) },
    function(callback){ insert(callback) }
  ], function(err, results){
    if (err) {
      console.log(err);
    }
    console.log('\\m/');
    database.db.disconnect();
  })
});
