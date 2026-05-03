const express = require("express");
const path = require("path");
const fs = require("fs");

const vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let folder of vect_foldere) {
    const folderPath = path.join(__dirname, folder);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
}

let gallery = JSON.parse(fs.readFileSync("gallery.json"));

function getImagesByTime() {
    const hour = new Date().getHours();

    let period =
        hour >= 5 && hour < 12 ? "dimineata" :
            hour >= 12 && hour < 20 ? "zi" :
                "noapte";

    let imgs = gallery.images.filter(img => img.time === period);

    imgs = imgs.slice(0, imgs.length - (imgs.length % 3));

    return imgs;
}

function verificaFisierErori() {
    const eroriPath = path.join(__dirname, "erori.json");

    if (!fs.existsSync(eroriPath)) {
        console.error("ERROR: erori.json file is missing.");
        console.error("Server cannot start without it.");
        process.exit(1);
    }

    const raw = fs.readFileSync(eroriPath, "utf-8");
    const data = JSON.parse(raw);

    if (!data.info_erori) {
        console.error("ERROR: Missing property 'info_erori' in erori.json.");
        process.exit(1);
    }

    if (!data.cale_baza) {
        console.error("ERROR: Missing property 'cale_baza' in erori.json.");
        process.exit(1);
    }

    if (!data.eroare_default) {
        console.error("ERROR: Missing property 'eroare_default' in erori.json.");
        process.exit(1);
    }


    if (!data.eroare_default.titlu) {
        console.error("ERROR: Missing 'titlu' in eroare_default.");
        process.exit(1);
    }

    if (!data.eroare_default.text) {
        console.error("ERROR: Missing 'text' in eroare_default.");
        process.exit(1);
    }

    if (!data.eroare_default.imagine) {
        console.error("ERROR: Missing 'imagine' in eroare_default.");
        process.exit(1);
    }
}

global.obGlobal = { obErori: null };

app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

function initErori() {
    const eroriPath = path.join(__dirname, "resourses/json/erori.json");
    const raw = fs.readFileSync(eroriPath, "utf-8");
    const data = JSON.parse(raw);
    obGlobal.obErori = data;
}

verificaFisierErori();
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
    const finalImagine = entry.imagine;

    let statusCode = 200;
    if (entry.status) {
        statusCode = identificator;
    }
    res.status(statusCode).render('error', {
        titlu: finalTitlu,
        text: finalText,
        imagine: finalImagine
    });
}

app.use((req, res, next) => {
    if (req.path.endsWith('.ejs')) {
        afisareEroare(res, 400);
    } else {
        next();
    }
});

app.use("/resourses", (req, res, next) => {
    const requestedPath = path.join(__dirname, "resourses", req.path);

    if (fs.existsSync(requestedPath) && fs.lstatSync(requestedPath).isDirectory()) {
        afisareEroare(res, 403);
    } else {
        next();
    }
});

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

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'resourses', 'ico', 'favicon.ico'));
});

app.get(["/", "/index", "/home"], (req, res) => {
    res.render("pagini/index", {
        images: getImagesByTime(),
        path: gallery.gallery_path
    });
});

app.get('/*page', function (req, res) {
    const page = req.path.substring(1);
    const view = `pagini/${page}`;
    res.render(view, { images: getImagesByTime(), path: gallery.gallery_path }, function (eroare, rezultatRandare) {
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