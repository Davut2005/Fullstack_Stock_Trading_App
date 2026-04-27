const express = require("express");
const path = require("path");
const fs = require("fs");

global.obGlobal = { obErori: null };

app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

function initErori() {
    const eroriPath = path.join(__dirname, "erori.json");
    const raw = fs.readFileSync(eroriPath, "utf-8");
    const data = JSON.parse(raw);
    // No image handling needed; keep data as is
    obGlobal.obErori = data;
}

initErori();

function afisareEroare(res, identificator = null, titlu = null, text = null) {
    const erori = obGlobal.obErori;
    let entry;
    if (identificator != null) {
        entry = erori.info_erori.find(e => e.identificator === identificator);
    }
    if (!entry) {
        entry = erori.eroare_default;
        identificator = 500;
    }
    const finalTitlu = titlu || entry.titlu;
    const finalText = text || entry.text;
    let statusCode = 200;
    if (entry.status) {
        statusCode = identificator;
    }
    res.status(statusCode).render('error', { titlu: finalTitlu, text: finalText });
}


app.use('/resourses', express.static(path.join(__dirname, 'resourses')));
app.use(express.static(path.join(__dirname, 'resourses')));

console.log("Current folder is:", __dirname);
console.log("Current file is:", __filename);
console.log("the folder, where the server was started from:", process.cwd());


// Middleware for global variables (e.g., user IP)
app.use((req, res, next) => {
    res.locals.ip = req.ip;
    next();
});

app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index");
});

app.get('/*pagina', function (req, res) {
    const page = req.path.substring(1);
    const view = `pagini/${page}`;
    res.render(view, function (eroare, rezultatRandare) {
        if (eroare) {
            if (eroare.message && eroare.message.startsWith('Failed to lookup view')) {
                afisareEroare(res, 404);
            } else {
                afisareEroare(res);
            }
        } else {
            res.send(rezultatRandare);
        }
    });
});

app.listen(8080)