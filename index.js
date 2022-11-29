const express = require("express");
const app = express();
const port = 3000;

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./slidesDB.sqlite");

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/style", (req, res) => {
  res.sendFile(__dirname + "/style.css");
});

app.get("/favicon", (req, res) => {
  res.sendFile(__dirname + "/favicon.ico");
});

app.get("/api/slides", (req, res, next) => {
  try {
    db.serialize(function () {
      db.all("SELECT * FROM slides", function (err, data) {
        let sortable = [];
        for (var slide in data) {
          sortable.push([
            data[slide]["lectureNumber"],
            data[slide]["slideNumber"],
            data[slide]["title"],
            data[slide]["path"],
          ]);
        }
        let indexed = sortable.sort(function (a, b) {
          if (a[0] == b[0]) {
            return a[1] - b[1];
          }
          return a[0] - b[0];
        });
        res.json({ slides: indexed });
      });
    });
  } catch (err) {
    console.error(`Error `, err.message);
    res.status(500).json(err);
  }
});

app.get("/:folderPath/:lecturePath/:slidePath", (req, res) => {
  folder = req.params.folderPath;
  lecture = req.params.lecturePath;
  slide = req.params.slidePath;
  res.sendFile(__dirname + "/" + folder + "/" + lecture + "/" + slide);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
