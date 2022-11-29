const path = require('path');
const fs = require('fs');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./slidesDB.sqlite');

db.serialize(function() {
    console.log('Creating database if it doesn\'t exist');
    db.run('CREATE TABLE if not exists lectures (id integer primary key, number text not null, title text)'); 
    db.run('CREATE TABLE if not exists slides (id integer primary key, path text not null, title text, lectureNumber int, slideNumber int, lectureId int, foreign key (lectureId) references lectures(id))'); 
});

const addLectureToDatabase = (lecture) => {
    db.run(
      'insert into lectures (number, title) values (?, ?)', 
      [lecture[0], lecture[1]], 
      function(err) {
        if (err) {
          console.error(err);
        }
      }
    );
  }

const addSlideToDatabase = (slide) => {
    db.run(
      'insert into slides (path, title, lectureNumber, slideNumber, lectureId) values (?, ?, ?, ?, ?)', 
      [slide[0], slide[1], slide[2], slide[3], slide[4]], 
      function(err) {
        if (err) {
          console.error(err);
        }
      }
    );
  }

const directoryPath = path.join(__dirname, 'slides');
let directories = []
fs.readdir(directoryPath, function (err, folders) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    folders.forEach(function (folder) {
        const [number, ...rest] = folder.split('-')
        const title = rest.join('-')
        const splitTitle = title.replaceAll('-', ' ')
        addLectureToDatabase([number, splitTitle])
        directories.push(folder)
    });
    directories.forEach(function (folder) {
        let slidesPath = path.join(__dirname, 'slides/' + folder);
        fs.readdir(slidesPath, function (err, slides) {
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } 
            slides.forEach(function (slide) {
                try {
                    db.serialize(function() {
                    const [number] = folder.split('-')
                      db.all("SELECT id, number, title FROM lectures where number = ?", number, function(err, data){
                        var lectureId = data[0]
                        const [titleSlide, ...rest] = slide.split(".")[0].split('-')
                        slideTitle = slide.split(".")[0]
                        restTitle = rest.join(' ').trim()
                        splitRest = restTitle.split(" ")
                        length = splitRest.length - 1
                        title = rest.join(' ').trim()
                        addSlideToDatabase(['slides/' + folder + '/' + slide, title, number, splitRest[length], lectureId['id']])
                      });
                    });
                  } catch(err) {
                    console.error(`Error `, err.message);
                };
            });
        });
    });
});