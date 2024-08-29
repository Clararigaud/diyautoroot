function init(configFile) {
    let co;
    let setup;
    try {
        co = JSON.parse(fs.readFileSync("./" + String(configFile)))
        if (co.setup) {
            setup = co.setup;
            if (!setup.resolumeIP) {
                interface.claraSay("Il manque \"resolumeIP\" dans le fichier json", ['x', 'x', '_'], true)
                return -1
            }
            if (!setup.resolumeInputPort) {
                interface.claraSay("Il manque \"resolumeInputPort\" dans le fichier json", ['x', 'x', '_'], true)
                return -1
            }
            OSC_infos.output = {
                ip: setup.resolumeIP,
                port: setup.resolumeInputPort
            };
        } else {
            interface.claraSay("Il manque le setup dans le fichier json {\"setup\":..., \"tableaux\": [...]} ", ['x', 'x', '_'], true)
            return -1
        }

        if (co.tableaux) {
            let success = true;
            let myerror;
            if (Array.isArray(co.tableaux)) {
                if (co.tableaux.length > 0) {
                    for (let i = 0; i < co.tableaux.length; i++) {
                        let tableau = co.tableaux[i];
                        if (tableau.layers != undefined) {
                            if (Array.isArray(tableau.layers)) {
                                if (tableau.duration != undefined) {
                                    if (typeof (tableau.duration) == 'number') {
                                        if (tableau.n_clips != undefined) {
                                            success = true;
                                        } else {
                                            success = false;
                                            myerror = [`Il manque le nombre de clips de la layer 'n_clips' dans le tableau ${i + 1} du fichier json`, ['x', 'x', '_']]
                                            break;
                                        }
                                    } else {
                                        success = false
                                        myerror = [`La duration doit etre un nombre dans tableau ${i + 1}`, ['x', 'x', '_']]
                                        break;
                                    }
                                } else {
                                    success = false
                                    myerror = [`Il manque la 'duration' dans tableau ${i + 1}`, ['x', 'x', '_']]
                                    break;
                                }
                            } else {
                                success = false;
                                myerror = [`La valeur de la layer 'layer' doit etre un tableau de nombre genre [0, 1] ou [2] dans le fichier json`, ['x', 'x', '_']]
                                break;
                            }
                        } else {
                            success = false;
                            myerror = [`Il manque 'layer' dans le tableau ${i + 1} du fichier json`, ['x', 'x', '_']]
                            break;
                        }
                    }
                    if (success) {
                        tableaux = co.tableaux;
                    } else {
                        interface.claraSay(myerror[0], myerror[1], true)
                        return -1
                    }
                }
                else {
                    interface.claraSay("Il n'y a aucun tableaux à charger", ['x', 'x', '_'], true)
                    return -1
                }
            }
            else {
                interface.claraSay("Probleme de structure dans le json des tableaux", ['x', 'x', '_'], true)
                return -1
            }
        }
    } catch (error) {
        interface.claraSay("Probleme à la lecture du fichier de config", ['x', 'x', '_'], true)
        switch (error.errno) {
            case -2:
                interface.claraSay("Fichier config manquant -> " + configFile, ['x', 'x', '_'], true)
                break;
            default:
                break;
        }
        return -1
    }
    return 1
}

function start() {
    const rd = new ResolumeDirector(OSC_infos, tableaux, interface, false);
    interface.on('onoff', () => {
        if (rd.running) {
            interface.claraSay(`OK j'arrete tout ! `, ['_', '_', '.'])
            rd.stop();
        } else {
            interface.claraSay(`LEZGOOOOW ! `, ['o', 'O', 'o'])
            rd.start()
        }
    });
    interface.on('quit', () => {
        interface.stop();
        rd.stop();
    });
    interface.on('tabselect', (n) => {
        rd.restartGroup(parseInt(n) - 1)
    })
    interface.start();
}

const { createRequire } = require('node:module');
require = createRequire(__filename);
const fs = require('fs');
const ResolumeDirector = require('./src/resolumeDirector');
const Interfaces = require("./src/Interface");

let interface = new Interfaces.InterfaceASCII();

interface.claraSay("WELCOME TO DIYAUTO\\ROOT", ['°', '°', 'o'], true)

let configFile = "config.json"
let OSC_infos = {
    output: {}
};

let tableaux = [];
setTimeout(() => {
    if (!process.argv[2]) {
        interface.claraSay("pas de fichier config specifié, j'utilise par defaut " + configFile, ['O', 'O', 'o'], true)
    } else {
        configFile = process.argv[2]
        interface.claraSay(`Je charge ${configFile} et je démarre`, ['O', 'O', 'o'], true)
    }
    setTimeout(() => {
        if (init(configFile) === 1) {
            start(); 
        }
    }, 1000);
}, 1000);