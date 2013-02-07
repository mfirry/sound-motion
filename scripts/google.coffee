doc = "0AtFF6SiRVHtIdEpzelh6S21OODNLeHpTZ2FWWjU3WWc"

_           = require("underscore")
moment      = require("moment")
rest        = require('restler')
Spreadsheet = require("spreadsheet")
async       = require("async")
database    = require('../database')

movies = {}
inserted = 0

parse = (id, venue, callback) ->

  sheet = new Spreadsheet(doc)
  sheet.worksheet id, (err,ws) ->
    console.log("=== v: " + venue)
    ws.eachRow (err,row,meta) ->
      if (err) then console.log(err)

      if (!movies[row.imdb])
        movie = {
          title: row.title,
          imdb: row.imdb,
          description: row.description,
          url: row.title.toLowerCase().replace(/\W/g, '-'),
          screenings: []
        }
        movies[row.imdb] = movie
      dates = []
      _.each [row.screening1,
        row.screening2,
        row.screening3,
        row.screening4,
        row.screening5], (s) ->
          # If typeof === object, the cell is probably empty
          if (typeof(s)!="object")
            date = moment(s, "DD/MM/YYYY HH:mm")
            dates.push(date)

      x = new database.Screening({venue: venue, dates: dates})
      movies[row.imdb].screenings.push(x)

      console.log("added to movies: " + row.title)

      if(meta.index == meta.total)
        console.log("ultima riga")
        callback(null)

insert = (callback) ->
  _.each movies, (m) ->
    console.log("inserting: " + m.title)
    movie = new database.Movie(m)
    movie.save (err) ->
      if (err)
        console.log('ERR: '+err)
        # callback(err)
      else
        console.log("inserted: " + m.title)
        imdb movie, () ->
          inserted++
          if (inserted == _.keys(movies).length)
            callback(null)

imdb = (movie, done) ->
  console.log("IMDB: " + movie.title)

  if (movie.imdb)
    query = {
      i: movie.imdb
    }
  else
    query = {
      t: movie.title
    }
  rest.get('http://www.omdbapi.com/', {
    query: query,
    parser: rest.parsers.json
  }).on 'complete', (data) ->
    if (data.Poster)
      console.log("Wgetting poster image for " + movie.title)

      tmp = data.Poster.split('http://ia.media-imdb.com/images/M/')
      exec = require('child_process').exec
      child = exec 'wget -nc -P public/img/posters/ ' + data.Poster,
        (error, stdout, stderr) ->
          # console.log('stdout: ' + stdout)
          # console.log('stderr: ' + stderr)
          if (error != null) then console.log('exec error: ' + error)

    data.Poster = tmp[1]
    movie.omdb = data
    movie.omdb.Poster = tmp[1]
    movie.save (err) ->
      if (err)
        console.log('error')
      else
        console.log("updated on db: " + movie.title)
        done()

database.Movie.remove {}, () ->
  console.log("!! Removed all movies")
  async.series [
    ((callback) -> parse(1, "anteo", callback)),
    ((callback) -> parse(2, "arcobaleno", callback)),
    ((callback) -> parse(3, "mexico", callback)),
    ((callback) -> insert(callback))
  ], (err, results) ->
    if (err) then console.log(err)
    console.log('\\m/')
    database.db.disconnect()
