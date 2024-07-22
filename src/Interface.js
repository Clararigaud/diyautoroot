class InterfaceMama{
    constructor(){
        this.actions = {
            'onoff': null,
            'quit': null,
            'tabselect': null
        };
        this.lastTableauxstate = [];
    }
    
    getMaxDurationTab(tableaux){
        let maxDur = 0;
        tableaux.forEach((t) => {
            maxDur = Math.max(maxDur, t.duration)
        })
        return maxDur;
    }

    claraSay(s, f = null, long=false){
        console.log(s)
    }

    drawTableaux(tableaux){
        this.lastTableauxstate = tableaux;
    }

    on(e, cb){
        this.actions[e] = cb;
    }

    start(){
        this.claraSay("READY TO GO !")
    }

    stop(){
        this.claraSay("OK BYE !")
    }
}

class InterfaceConsole extends InterfaceMama{
    constructor(){
        super()
        const { stdin: input, stdout: output, constrainedMemory } = require('node:process');
        this.rl = require('node:readline').createInterface({ input, output });
    }
    
    inputs(key){        
        if(/^[0-9]$/i.test(key)){
            this.actions.tabselect(key);
        }else if(key == 's'){        
            this.actions.onoff();
        }else if(key == 'q' || key == 'CTRL_C'){
            this.actions.quit();
        }
    }
    
    start(){
        super.start()
        this.rl.on('line', (key) => {this.inputs(key)})
    }

    stop(){
        super.stop()
        this.rl.close()
        process.exit();
    }
}

class InterfaceASCII extends InterfaceMama{
    constructor(){
        super()
        require( 'terminal-kit' ).getDetectedTerminal( ( error , detectedTerm ) => {
            if ( error ) { throw new Error( 'Cannot detect terminal.' ) ; }
            this.term = detectedTerm ;
        });
        this.term.hideCursor() ;
        
        this.term.on( 'key' , (name) => {
            this.inputs(name)
        }) 
        this.maxHeight = 40;
        this.done = true;
        this.restingFace = ['○','○','3']
        this.claraface = this.restingFace
        this.clarawords = '';
    }

    header(){
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

    outLayer(clips){
        let charis = "□";
        let stri = charis.repeat(clips.nclips)
        stri = stri.split('');
        if(clips.selected != -1){
            stri[clips.selected] = '■';
        }
        stri = stri.join('');
        return `Layer -> ${clips.layerid}${' '.repeat(4-String(clips.layerid).length)}${stri}`;
    }

    drawTableaux(tableaux){
        super.drawTableaux(tableaux);
        if(this.done){
        this.done = false
        console.log("─".repeat(100))
        this.header()
        let tabHeight = 0;
        let j =0
        let durOffset = 2
        let maxDur = this.getMaxDurationTab(tableaux);
        let durWidth = String(maxDur).length;
        tableaux.forEach((tableau)=>{
            console.log(`[${j+1}]`)
            tabHeight +=1;
            if(tableau.activeclips){
                let i =0;
                tableau.activeclips.forEach(clips => {
                    let strlayer = [];
                    strlayer.push(' '.repeat(durOffset))
                    if(i == Math.round(tableau.activeclips.length/2)){
                        let width = durWidth - String(tableau.duration-tableau.count).length;
                        strlayer.push(`${' '.repeat(Math.floor(width/2))}[${String(tableau.duration-tableau.count)}]${' '.repeat(Math.ceil(width/2))}`)
                    }else{
                        strlayer.push(`${' '.repeat(durWidth+2)}`)
                    }
                    strlayer.push(' '.repeat(durOffset))
                    strlayer.push(this.outLayer(clips))
                    console.log(strlayer.join(""))
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

    claraSay(s, f , long = false){
        this.clarawords = s;
        this.claraface = f;
        this.drawTableaux(this.lastTableauxstate)
        if(!long){
            setTimeout( () => {
                this.clarawords = '';
                this.claraface = this.restingFace;
                this.drawTableaux(this.lastTableauxstate)
            }, 1000 );
        }
    }

    inputs(key){        
        if(/^[0-9]$/i.test(key)){
            this.actions.tabselect(key);
        }else if(key == 's'){        
            this.actions.onoff();
        }else if(key == 'q' || key == 'CTRL_C'){
            this.actions.quit();
        }
    }

    start(){
        this.claraSay("READY TO GO !", ['*','*','<'], true)
        this.term.grabInput()
    }

    stop(){
        this.claraSay("OK BYE !", ['♡︎','♡︎','<'], true)
        this.term.hideCursor( false ) ;
        this.term.grabInput( false ) ;
        setTimeout( () => {
            this.term.moveTo( 1 , this.term.height , '\n\n' ) ;
            process.exit();
        } , 100 ) ;
    }
}
module.exports = {InterfaceConsole, InterfaceASCII}

const cool = `
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│            ;   :   ;                         .--             .-(\`  )                    │
│         .   \\_,!,_/   ,                     (   )           :(      ))                  │
│          \`.,'     \`.,'            ( )     (      )          \`(       ))                 │
│           /         \\            (_.'    (        )           \` __.:'                   │
│      ~ -- :         : -- ~     _          \`- __.'                                       │
│           \\         /        (\`  ).                                /^v^\\                │
│ /^v^\\    ,'\`._   _.'\`.      (     ).                /^v^\\                               │
│         '   / \`!\` \\   \`     (       '\`.      /\\            /^v^\\                        │
│            ;   :   ;       (      .   )     /  \\                         /^v^\\          │
│                             (..__.:'-'     /    \\                                       │
│                                           /      \\                               (__)   │
│                    _                 /\\  /        \\/\\/\\/\\  /\\            \`\\------(oo)   │
│                  <(.)__           /\\/  \\/\\  /\\  /\\/ / /  \\/  \\             ||    (__)   │
│___________\\|/_____(___/____________/___/__\\/|/\\/|/\\__/    \\ __\\___\\|/_\\|/__||w--||__\\ \\|│
└─────────────────────────────────────────────────────────────────────────────────────────┘`;