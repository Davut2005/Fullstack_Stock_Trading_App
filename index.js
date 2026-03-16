const express = require("express");
const path = require("path");

app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

console.log("Folder: index.js", __dirname);
console.log("Folder current", process)

app.get("/cale", function(req, res){
    res.sendFile(path.join(__dirname, "index.html"))

})

app.listen(8080)

app.get("/", (req, res) => {
    res.render("/pagini/index")
});