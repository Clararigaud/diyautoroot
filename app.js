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
            if (!setup.localIp) {
                interface.claraSay("Il manque \"localIp\" dans le fichier json", ['x', 'x', '_'], true)
                return -1
            }
            if (!setup.localPort) {
                interface.claraSay("Il manque \"localPort\" dans le fichier json", ['x', 'x', '_'], true)
                return -1
            }
            OSC_infos.output = {
                ip: setup.resolumeIP,
                port: setup.resolumeInputPort
            };
            OSC_infos.input = {
                    ip: setup.localIp,
                    port: setup.localPort
                }
        } else {
            interface.claraSay("Il manque le setup dans le fichier json {\"setup\":..., \"tableaux\": [...]} ", ['x', 'x', '_'], true)
            return -1
        }

        if (co.metronomes) {
            let success = true;
            let myerror;
            if (Array.isArray(co.metronomes)) {
                if (co.metronomes.length > 0) {
                    for (let i = 0; i < co.metronomes.length; i++) {
                        let metronome = co.metronomes[i];
                        if (metronome.layer != undefined) {
                            if (typeof (metronome.layer) == 'number') {
                                if (metronome.duration != undefined) {
                                    if (typeof (metronome.duration) == 'number') {
                                        if (metronome.n_clips != undefined) {
                                            success = true;
                                        } else {
                                            success = false;
                                            myerror = [`Il manque le nombre de clips de la layer 'n_clips' dans le metronome ${i + 1} du fichier json`, ['x', 'x', '_']]
                                            break;
                                        }
                                    } else {
                                        success = false
                                        myerror = [`La duration doit etre un nombre dans metronome ${i + 1}`, ['x', 'x', '_']]
                                        break;
                                    }
                                } else {
                                    success = false
                                    myerror = [`Il manque la 'duration' dans metronome ${i + 1}`, ['x', 'x', '_']]
                                    break;
                                }
                            } else {
                                success = false;
                                myerror = [`La valeur de la layer 'layer' doit etre un nombre dans le fichier json`, ['x', 'x', '_']]
                                break;
                            }
                        } else {
                            success = false;
                            myerror = [`Il manque 'layer' dans le metronome ${i + 1} du fichier json`, ['x', 'x', '_']]
                            break;
                        }
                    }
                    if (success) {
                        metronomes = co.metronomes;
                    } else {
                        interface.claraSay(myerror[0], myerror[1], true)
                        return -1
                    }
                }
                else {
                    interface.claraSay("Il n'y a aucun metronomes à charger", ['x', 'x', '_'], true)
                    return -1
                }
            }
            else {
                interface.claraSay("Probleme de structure dans le json des metronomes", ['x', 'x', '_'], true)
                return -1
            }
        }
        if (co.connector) {
            let success = true;
            let myerror;
            let osc = Object.keys(co.connector);
            if (Array.isArray(osc)) {
                if (osc.length > 0) {
                    for (let i = 0; i < osc.length; i++) {
                        let obj = co.connector[osc[i]];
                        obj.osckey = osc[i];
                        if (obj != undefined) {
                            if (obj.layer != undefined) {
                                if (typeof (obj.layer) == 'number') {
                                    if (obj.link != undefined) {
                                        if (typeof (obj.link) == 'number') {
                                            if (obj.link > 0 && obj.link <= 8) {
                                                if (obj.dashboardlevel != undefined) {
                                                    if (obj.dashboardlevel == "clip" || obj.dashboardlevel == "layer") {
                                                        success = true;
                                                    } else {
                                                        success = false
                                                        myerror = [`La valeur de 'dashboardlevel' doit etre soit "clip" soit "layer" dans ${osc[i]} du fichier json`, ['x', 'x', '_']]
                                                        break;
                                                    }
                                                } else {
                                                    success = false
                                                    myerror = [`Le connector ${osc[i]} du fichier json n'a pas de dashboard de destination 'dashboardlevel'`, ['x', 'x', '_']]
                                                    break;
                                                }
                                            } else {
                                                success = false;
                                                myerror = [`'link' doit être un nummero de 1 à 8 dans ${osc[i]}`, ['x', 'x', '_']]
                                                break;
                                            }
                                        } else {
                                            success = false;
                                            myerror = [`'link' doit être un nummero dans le connector ${osc[i]}`, ['x', 'x', '_']]
                                            break;
                                        }
                                    } else {
                                        success = false
                                        myerror = [`Le connector ${osc[i]} du fichier json n'a pas de link de destination 'link'`, ['x', 'x', '_']]
                                        break;
                                    }
                                } else {
                                    success = false
                                    myerror = [`'layer' doit être un nummero dans le connector ${osc[i]}`, ['x', 'x', '_']]
                                    break;
                                }
                            } else {
                                success = false;
                                myerror = [`Le connector ${osc[i]} du fichier json n'a pas de layer de destination 'layer'`, ['x', 'x', '_']]
                                break;
                            }
                        } else {
                            success = false;
                            myerror = [`Le connector ${osc[i]} du fichier json est bizarre`, ['x', 'x', '_']]
                            break;
                        }
                    }
                    if (success) {
                        OSC_infos.connectors = co.connector;
                    } else {
                        interface.claraSay(myerror[0], myerror[1], true)
                        return -1
                    }
                }
                else {
                    interface.claraSay("Il n'y a aucun connectors à charger", ['x', 'x', '_'], true)
                    return -1
                }
            }
            else {
                interface.claraSay("Probleme de structure dans le json des connectors", ['x', 'x', '_'], true)
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
    const rd = new ResolumeDirector(OSC_infos, metronomes, interface, false);
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

const maxStart = false;
let interface;
if (false) {
    const maxApi = require("max-api");
    interface = new Interfaces.InterfaceConsole();
} else {
    interface = new Interfaces.InterfaceASCII();
}

interface.claraSay("WELCOME TO DIYAUTO\\ROOT", ['°', '°', 'o'], true)

let configFile = "config.json"
let OSC_infos = {
    output: {},
    input: {},
    connectors: {}
};
let metronomes = [];
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