const express = require("express");
const app = express();
const port = 3000;
const fs = require('fs');

app.use("/", express.static("public"));

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.get("/budget", (req, res) => {
  fs.readFile("budget-data.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
