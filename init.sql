# --- First database schema
# -- 06/09/2012

CREATE TABLE movie (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  link VARCHAR(255),
  note VARCHAR(255),
  keywords VARCHAR(255)
);

CREATE TABLE venue (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  address VARCHAR(255),
  latitude NUMERIC(4,4),
  longitude NUMERIC(4,4)
);

CREATE TABLE screening (
  id SERIAL PRIMARY KEY,
  movie_id integer,
  venue_id integer,
  time timestamp,
  foreign key (movie_id) references movie(id),
  foreign key (venue_id) references venue(id)
);