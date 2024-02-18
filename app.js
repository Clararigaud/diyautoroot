function init(configFile){
    let co ;
    let setup;
    try {
        co = JSON.parse(fs.readFileSync("./"+String(configFile)))
        if(co.setup){
            setup = co.setup;
            if(!setup.resolumeIP){
                interface.claraSay("Il manque \"resolumeIP\" dans le fichier json", ['x','x','_'], true)
                return -1
            }
            // if(!setup.resolumeOutputPort){
            //     console.log("Il manque \"resolumeOutputPort\"")
            //     return -1
            // }
            if(!setup.resolumeInputPort){
                interface.claraSay("Il manque \"resolumeInputPort\" dans le fichier json", ['x','x','_'], true)
                return -1
            }
            resolumeConn = {
                ip: setup.resolumeIP,
                outputport: setup.resolumeOutputPort, 
                inputport : setup.resolumeInputPort 
            }
        }else{
            interface.claraSay("Il manque le setup dans le fichier json {\"setup\":..., \"tableaux\": [...]} ", ['x','x','_'], true)
            return -1
        }

        if(co.tableaux){
            let success = true;
            let myerror;
            if(Array.isArray(co.tableaux)){
                if(co.tableaux.length>0){
                    for(let i =0; i<co.tableaux.length; i++){
                        let tableau = co.tableaux[i];
                        if(tableau.id!= undefined){
                            if(typeof(tableau.id)== 'number'){
                                if(tableau.duration != undefined){
                                    if(typeof(tableau.duration)== 'number'){
                                        if(tableau.layers){
                                            if(Array.isArray(tableau.layers)){
                                                if(tableau.layers.length>0){
                                                    let ok= false;
                                                    let reason = ''
                                                    tableau.layers.forEach((layer)=>{
                                                        if(typeof(layer=='object')){
                                                            if(layer.id != undefined){
                                                                if(typeof(layer.id)== 'number'){
                                                                    if(layer.nombreClips != undefined){
                                                                        if(typeof(layer.nombreClips)== 'number'){
                                                                            ok = true
                                                                        }else{
                                                                            reason = 'layer '+layer.id+': nombreClips doit etre un nombre'
                                                                        }
                                                                    }else{
                                                                        reason = 'layer '+layer.id+': nombreClips manquant'
                                                                    }
                                                                    
                                                                    
                                                                }else{
                                                                    reason = 'id doit etre une nombre'
                                                                }
                                                            }else{
                                                                reason = 'id pas defini'
                                                            }
                                                        }else{
                                                            reason = 'Probleme de structure de layer'
                                                        }
                                                    })
                                                    success = ok;
                                                    if(!success){
                                                        myerror = [`Probleme dans les layers de tableau ${tableau.id}: ${reason}`, ['x','x','_']]
                                                    }
                                                }else{
                                                    success = false
                                                    myerror = [`Il n'y a aucunen layer dans tableau ${tableau.id}`, ['x','x','_']]
                                                    break;  
                                                }
                                            }
                                            else{
                                                success = false
                                                myerror = [`Probleme de structure des layers dans tableau ${tableau.id}`, ['x','x','_']]
                                                break;
                                            }
                                        }else{
                                            success = false;
                                            myerror = [`Il manque les 'layers' dans le tableau ${tableau.id} du fichier json`, ['x','x','_']]
                                            break;
                                        }
                                    }else{
                                        success = false
                                        myerror = [`La duration doit etre un nombre dans tableau ${tableau.id}`, ['x','x','_']]
                                        break;
                                    }
                                }else{
                                    success = false
                                    myerror = [`Il manque la 'duration' dans tableau ${tableau.id}`, ['x','x','_']]
                                    break;
                                }
                            }else{
                                success = false;
                                myerror = [`L'id du tableau doit etre un nombre danns le fichier json`, ['x','x','_']]
                                break;
                            }
                        }else{
                            success = false;
                            myerror = [`Il manque l'id dans le tableau ${tableau.id} du fichier json`, ['x','x','_']]
                            break;
                        }
                    }
                    if(success){
                        groups = co.tableaux;
                    }else{
                        interface.claraSay(myerror[0], myerror[1], true)
                        return -1
                    }
                }
                else{
                    interface.claraSay("Il n'y a aucun tableau à charger", ['x','x','_'], true)
                    return -1
                }
            }
            else{
                interface.claraSay("Probleme de structure des tableaux", ['x','x','_'], true)
                return -1
            }
        }else{
            interface.claraSay("Il manque les tableaux dans le fichier json {\"setup\":..., \"tableaux\": [{...},{...},{...},...]} ", ['x','x','_'], true)
            return -1
        }
    } catch (error) {
        interface.claraSay("Probleme à la lecture du fichier de config", ['x','x','_'], true)
        switch (error.errno) {
            case -2:
                interface.claraSay("Fichier config manquant -> "+ configFile, ['x','x','_'], true)
                break;
                default:
                    break;
        }
        return -1
    } 
    return 1
}

function start(){
    const rd = new ResolumeDirector(resolumeConn, groups, interface, false);
    interface.on( 'onoff', () => { 
        if(rd.running){
            interface.claraSay(`OK j'arrete tout ! `,['_','_','.'])
            rd.stop();
        }else{        
            interface.claraSay(`LEZGOOOOW ! `,['o','O','o'])
            rd.start()
        }
    });
    interface.on( 'quit', () => {
        interface.stop();
        rd.stop();
    });
    interface.on('tabselect', (n) => {
        rd.restartGroup(parseInt(n)-1)
    })
    interface.start();
}

const { createRequire } = require('node:module');
require = createRequire(__filename); 
const fs = require( 'fs' ) ;
const ResolumeDirector = require('./src/resolumeDirector');
const Interfaces = require("./src/Interface");

const maxStart = false;
let interface;
if(maxStart){
    const maxApi = require("max-api");
    interface = new Interfaces.InterfaceConsole();
}else{
    interface = new Interfaces.InterfaceASCII();
}

interface.claraSay("WELCOME TO DIYAUTO\\ROOT", ['°','°','o'], true)

let configFile = "config.json"
let resolumeConn = {};
let groups;
setTimeout(() => { 
    if(!process.argv[2]){
        interface.claraSay("pas de fichier config specifié, j'utilise par defaut "+ configFile, ['O','O','o'], true)
    }else{
        configFile = process.argv[2]
        interface.claraSay(`Je charge ${configFile} et je démarre`, ['O','O','o'], true)
    }
    setTimeout(() => { 
        if (init(configFile) === 1){
            start(); 
        }}, 1000);
}, 1000);