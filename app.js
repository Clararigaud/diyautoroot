
class Interface{
    constructor(){
        this.maxHeight = 40;
        this.done = true;
        this.restingFace = ['○','○','3']
        this.claraface = this.restingFace
        this.clarawords = '';
        this.lastTableauxstate = [];
    }

    header(){ // 15 lignes
        let bubble = '';
        let bubbletop = '';
        let bubblebottom = '';
        if(this.clarawords != ''){
            bubble = '<│'+ this.clarawords+'│';
            bubbletop = '     ┌'+'─'.repeat(this.clarawords.length)+'┐'
            bubblebottom = ' └'+'─'.repeat(this.clarawords.length)+'┘'
        }

        console.log(`┌┬─┬─┐       ┌────────────────┬─┬─┐
││.│┼┼─────┬─┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼│.│┼┼┬─┬────┐
└┼─┴───────┘ └───────┼┼───────┴─┴──┘ │    │
 │ ▲ |---   *  |   | ││  -     ---   │  +++++
 │ │ |   |     |   | ││ / \\   |   |  │ +++++++
 │ │ |   |  |   \\ /  └┘|   |  |   |  │ ++${this.claraface[0]}  ${this.claraface[1]}+${bubbletop} 
 │ │ |   |  |    |     |---|  |. .|  │ ++  ${this.claraface[2]} + ◄─┐${bubble}
 │ │ |   |  |    |     |   |  | 0 |  │ +┌──┐ +   │${bubblebottom} 
 │ │ |   |  |    |     |   |  |   |  ├──┼┼┼┴──── │
 │ │ |---   |    |     |   |   ---   └────┘claRa─┘
 │ │                                           i
 └─┼───────────┬─┬───────────────────┐  <3      g
   └──────┼┼┼┼┼│.│┼┼┼┼┼────────────┼┼│           o
          └────┴─┴────┘            └─┴──────────.`)
        console.log("s: \"start\/stop\" || 1 pour demarrer le tableau [1], 2 pour le tab [2] ... || q pour quitter")
    }

    outLayer(clips, c=""){
        let s = 5;
        let charis = "□";
        let stri = charis.repeat(clips.nclips)
        stri = stri.split('');
        if(clips.selected != -1){
            stri[clips.selected] = '■';
        }
        stri = stri.join('');
        return `${stri} ${' '.repeat(s-clips.nclips)} <-  layer ${clips.layerid}   ${c}`;
    }

    draw(tableaux){
        if(this.done){
        this.lastTableauxstate = tableaux;
        this.done = false

        console.log("─".repeat(100))
        this.header() // 15 lignes
        let tabHeight = 0;
        let j =0
        tableaux.forEach((tableau)=>{ // n tab + nlayers
            console.log(`[${j+1}]Tableau: ${tableau.id}`)
            tabHeight +=1;
            if(tableau.activeclips){
                let i =0;
                tableau.activeclips.forEach(clips => {
                    if(i == Math.round(tableau.activeclips.length/2)){
                        console.log(this.outLayer(clips, String(tableau.duration-tableau.count)))
                    }else{
                        console.log(this.outLayer(clips))
                    }
                    i++
                    tabHeight +=1;
                })
                }else{
                    console.log("no active clips")
                }
                j++;
            })
        let remain = this.maxHeight - 15 - tabHeight;
        if(remain<0){
            this.maxHeight +=Math.abs(remain);
            remain = this.maxHeight - 15 - tabHeight;
        }
        console.log("\n".repeat(remain))
        this.done = true;
        }
    }

    claraSay(s, f){
        this.claraSayLong(s,f)
        setTimeout( () => {
            this.clarawords = '';
            this.claraface = this.restingFace;
            this.draw(this.lastTableauxstate)
        }, 1000 );
    }
    claraSayLong(s, f){
        this.clarawords = s;
        this.claraface = f;
        this.draw(this.lastTableauxstate)
    }
}

function init(configFile){
    let co ;
    let setup;
    try {
        co = JSON.parse(fs.readFileSync("./"+String(configFile)))
        if(co.setup){
            setup = co.setup;
            if(!setup.resolumeIP){
                interface.claraSayLong("Il manque \"resolumeIP\" dans le fichier json", ['x','x','_'])
                return -1
            }
            // if(!setup.resolumeOutputPort){
            //     console.log("Il manque \"resolumeOutputPort\"")
            //     return -1
            // }
            if(!setup.resolumeInputPort){
                interface.claraSayLong("Il manque \"resolumeInputPort\" dans le fichier json", ['x','x','_'])
                return -1
            }
            resolumeConn = {
                ip: setup.resolumeIP,
                outputport: setup.resolumeOutputPort, 
                inputport : setup.resolumeInputPort 
            }
        }else{
            interface.claraSayLong("Il manque le setup dans le fichier json {\"setup\":..., \"tableaux\": [...]} ", ['x','x','_'])
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
                        interface.claraSayLong(myerror[0], myerror[1])
                        return -1
                    }
                }
                else{
                    interface.claraSayLong("Il n'y a aucun tableau à charger", ['x','x','_'])
                    return -1
                }
            }
            else{
                interface.claraSayLong("Probleme de structure des tableaux", ['x','x','_'])
                return -1
            }
        }else{
            interface.claraSayLong("Il manque les tableaux dans le fichier json {\"setup\":..., \"tableaux\": [{...},{...},{...},...]} ", ['x','x','_'])
            return -1
        }
    } catch (error) {
        interface.claraSayLong("Probleme à la lecture du fichier de config", ['x','x','_'])
        switch (error.errno) {
            case -2:
                interface.claraSayLong("Fichier config manquant ->"+ configFile, ['x','x','_'])
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
    
    // RUN 
    const termkit = require( 'terminal-kit' );
    let term ;
    termkit.getDetectedTerminal( function( error , detectedTerm ) {
        if ( error ) { throw new Error( 'Cannot detect terminal.' ) ; }
        term = detectedTerm ;
    });
    term.hideCursor() ;
    term.grabInput() ;
    term.on( 'key' , inputs ) ;
    function inputs( key )
    {
        if(/^[0-9]$/i.test(key)){
            rd.restartGroup(parseInt(key)-1)
        }else{        
            switch ( key )
            {
                case 's':
                    if(rd.running){
                        rd.stop();
                    }else{
                        rd.start()
                    }
                    break;
                case 'q':
                case 'CTRL_C':
                    terminate() ;
                    break ;
            }
        }
    }
    
    function terminate()
    {
        interface.claraSayLong("OK BYE !", ['♡︎','♡︎','<'])
        term.hideCursor( false ) ;
        term.grabInput( false ) ;
        setTimeout( function() {
            term.moveTo( 1 , term.height , '\n\n' ) ;
            process.exit() ;
        } , 100 ) ;
    }
    interface.claraSayLong("READY TO GO !", ['*','*','<'])
}

///////// RUN ///////////
const fs = require( 'fs' ) ;
const { createRequire } = require('node:module');
require = createRequire(__filename); 
const ResolumeDirector = require('./resolumeDirector');

const interface = new Interface();
interface.clarawords = "WELCOME TO DIYAUTO\\ROOT"
interface.claraface = ['°','°','o']
interface.draw([]);
let configFile = "config.json"
let resolumeConn = {};
let groups;

setTimeout(() => { 
    if(!process.argv[2]){
        interface.claraSayLong("pas de fichier config specifié, j'utilise par defaut "+ configFile, ['O','O','o'])
    }else{
        configFile = process.argv[2]
        interface.claraSayLong(`Je charge ${configFile} et je démarre`, ['O','O','o'])
    }
    setTimeout(() => { 
        if (init(configFile) === 1){
            start(); 
        }}, 1000);
}, 1000);