const path = require("path");
const fs = require("fs");
const sass = require("sass");

function compileazaScss(caleScss, caleCss) {

    if (!path.isAbsolute(caleScss)) {
        caleScss = path.join(global.folderScss, caleScss);
    }

    if (!caleCss) {

        let numeFisier = path.basename(caleScss, ".scss");

        caleCss = path.join(
            global.folderCss,
            numeFisier + ".css"
        );
    }

    else if (!path.isAbsolute(caleCss)) {

        caleCss = path.join(
            global.folderCss,
            caleCss
        );
    }

    // backup old css
    if (fs.existsSync(caleCss)) {

        let folderBackupCss = path.join(
            global.folderBackup,
            "resurse/css"
        );

        fs.mkdirSync(folderBackupCss, { recursive: true });

        let numeCss = path.basename(caleCss);

        try {

            fs.copyFileSync(
                caleCss,
                path.join(folderBackupCss, numeCss)
            );

        } catch(err) {

            console.log( "Eroare backup:",  err );
        }
    }

    let rezultat = sass.compile(caleScss);

    fs.writeFileSync(caleCss, rezultat.css);

    console.log("Compilat:", caleScss);
}


function compileazaTot() {

    let fisiere = fs.readdirSync(
        global.folderScss
    );

    for (let fisier of fisiere) {

        if (path.extname(fisier) == ".scss") {

            compileazaScss(fisier);
        }
    }
}


function watchScss() {

    fs.watch(
        global.folderScss,
        function(event, filename) {

            if (!filename) return;

            if (
                path.extname(filename) == ".scss"
            ) {

                compileazaScss(filename);
            }
        }
    );
}


module.exports = {
    compileazaScss,
    compileazaTot,
    watchScss
};