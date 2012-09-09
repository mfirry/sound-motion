# --- First database schema
# -- 06/09/2012

CREATE TABLE movie (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  link VARCHAR(255),
  note VARCHAR(765),
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

INSERT INTO venue (name, address) values ('Anteo', 'Via Milazzo, 9, 20121 Milano');
INSERT INTO venue (name, address) values ('Arcobaleno', 'Viale Tunisia, 11, 20124 Milano');
INSERT INTO venue (name, address) values ('Mexico', 'Via Savona, 57, 20144 Milano');

insert into movie (title, link) values('The Amazing Spider-Man', 'http://www.imdb.com/title/tt0948470');
insert into movie (title, link) values('To Rome with Love','http://www.imdb.com/title/tt1859650');
insert into movie (title, link) values('The Way Back','http://www.imdb.com/title/tt1911653');
insert into movie (title, link) values('W.E.','http://www.imdb.com/title/tt1536048');

update movie
set note = 
E'Two love stories, one historic and one contemporary, are interwoven. The famous romance between King Edward VIII and American divorcée Wallis Simpson is juxtaposed with the affair of a Russian security guard with a New York trophy wife Wally Winstrhop. Wally is obsessed with the story of Edward and the woman he loved, and embarks on her own research of their life together, even attending the Sotheby\'s auction of the Windsor Estate.' where id=4;

update movie
set note = 
E'A story about a number of people in Italy — some American, some Italian, some residents, some visitors — and the romances and adventures and predicaments they get into. The film stars Allen, Alec Baldwin, Roberto Benigni, Penélope Cruz, Judy Davis, Jesse Eisenberg, Greta Gerwig and Ellen Page.' where id=2;

update movie
set note = 
E'Directed by six-time Academy Award nominee Peter Weir, The Way Back is an epic story of survival, solidarity and indomitable human will. Shot in Bulgaria, Morocco and India, the film stars Jim Sturgess (Across the Universe, The Other Boleyn Girl), Ed Harris (Appaloosa) and Colin Farrell (In Bruges) as prisoners of a Soviet Union labor camp, who, along with four others, flee their Siberian Gulag and begin a treacherous journey across thousands of miles of hostile terrain.' where id=3;

update movie
set note = 
E'The Amazing Spider-Man is the story of Peter Parker (Garfield), an outcast high schooler who was abandoned by his parents as a boy, leaving him to be raised by his Uncle Ben (Sheen) and Aunt May (Field). Like most teenagers, Peter is trying to figure out who he is and how he got to be the person he is today.' where id=1;

insert into screening (movie_id, venue_id, time) values(1,1,'2012/09/03 15:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(1,1,'2012/09/03 17:30'::timestamp);
insert into screening (movie_id, venue_id, time) values(1,1,'2012/09/03 20:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(1,1,'2012/09/03 22:30'::timestamp);

insert into screening (movie_id, venue_id, time) values(1,2,'2012/09/04 22:30'::timestamp);
insert into screening (movie_id, venue_id, time) values(1,2,'2012/09/04 20:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(1,2,'2012/09/04 17:30'::timestamp);
insert into screening (movie_id, venue_id, time) values(1,2,'2012/09/04 15:00'::timestamp);

insert into screening (movie_id, venue_id, time) values(1,3,'2012/09/06 22:30'::timestamp);
insert into screening (movie_id, venue_id, time) values(1,3,'2012/09/06 20:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(1,3,'2012/09/06 17:30'::timestamp);
insert into screening (movie_id, venue_id, time) values(1,3,'2012/09/06 15:00'::timestamp);

insert into screening (movie_id, venue_id, time) values(2,1,'2012/09/10 15:20'::timestamp);
insert into screening (movie_id, venue_id, time) values(2,1,'2012/09/10 17:40'::timestamp);
insert into screening (movie_id, venue_id, time) values(2,1,'2012/09/10 20:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(2,1,'2012/09/10 22:00'::timestamp);

insert into screening (movie_id, venue_id, time) values(2,2,'2012/09/11 15:20'::timestamp);
insert into screening (movie_id, venue_id, time) values(2,2,'2012/09/11 17:40'::timestamp);
insert into screening (movie_id, venue_id, time) values(2,2,'2012/09/11 20:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(2,2,'2012/09/11 22:00'::timestamp);
	
insert into screening (movie_id, venue_id, time) values(2,3,'2012/09/13 15:20'::timestamp);
insert into screening (movie_id, venue_id, time) values(2,3,'2012/09/13 17:40'::timestamp);
insert into screening (movie_id, venue_id, time) values(2,3,'2012/09/13 20:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(2,3,'2012/09/13 22:00'::timestamp);
	
insert into screening (movie_id, venue_id, time) values(3,1,'2012/09/17 12:40'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,1,'2012/09/17 15:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,1,'2012/09/17 17:30'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,1,'2012/09/17 20:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,1,'2012/09/17 22:30'::timestamp);
	
insert into screening (movie_id, venue_id, time) values(3,2,'2012/09/18 15:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,2,'2012/09/18 17:30'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,2,'2012/09/18 20:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,2,'2012/09/18 22:30'::timestamp);
	
insert into screening (movie_id, venue_id, time) values(3,3,'2012/09/17 12:40'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,3,'2012/09/17 15:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,3,'2012/09/17 17:30'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,3,'2012/09/17 20:00'::timestamp);
insert into screening (movie_id, venue_id, time) values(3,3,'2012/09/17 22:30'::timestamp);
	

	
	
