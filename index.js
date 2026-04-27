const express = require("express");
const path = require("path");

app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use('/resourses', express.static(path.join(__dirname, 'resourses')));
app.use(express.static(path.join(__dirname, 'resourses')));

console.log("Current folder is:", __dirname);
console.log("Current file is:", __filename);
console.log("the folder, where the server was started from:", process.cwd());


app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index");
});

app.listen(8080)