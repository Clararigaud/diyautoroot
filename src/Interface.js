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

class InterfaceASCII extends InterfaceMama {
    constructor() {
        super()
        require('terminal-kit').getDetectedTerminal((error, detectedTerm) => {
            if (error) { throw new Error('Cannot detect terminal.'); }
            this.term = detectedTerm;
        });
        this.term.hideCursor();

        this.term.on('key', (name) => {
            this.inputs(name)
        })
        this.maxHeight = 55;
        this.maxLength = 100;
        this.done = true;
        this.restingFace = ['○', '○', '3'];
        this.claraface = this.restingFace;
        this.clarawords = '';
        this.fps = 5;
        this.tabdrawactivated = false;
        const MorseInterface = require('./MorseInterface');
        this.morseinterface = new MorseInterface(this.maxLength);
        this.showinMorseWord = false;
    }

    header() {
        if(this.showinMorseWord || this.morseinterface.letterBufferLength() > 0 ){
            this.showinMorseWord = true;
            this.claraMorse();
        }
        else{
            this.claraOneLine();
        }
        return 15
    }
    morseTrackNextFrame(){
        for(let i = 0; i< 3; i++){
            let str = this.morseinterface.morseTrack[i].split('');
            str.splice(0, 1)
            this.morseinterface.morseTrack[i] = str.join('');
        }
    }

    getRandomPhrase(){
        const phrases = ["...", "hahahahaahah"];
        return phrases[Math.floor(Math.random(1)*phrases.length)]
    }

    releaseMorsePart(){
        this.claraSay(this.getRandomPhrase(), this.restingFace, false);
        this.morseinterface.emptyLetterBuffer();
        this.draw();
        this.showinMorseWord = false;
    }

    claraMorse(){
        let bubble = '';
        let bubbleend = '';
        let bubbletop = '';
        let bubblebottom = '';
        
        if (this.morseinterface.letterBuffer[0] != '') {
            bubble = '<│';
            bubbletop = '     ┌' + '─'.repeat(this.morseinterface.letterBufferLength()) + '┐'
            bubbleend = '│';
            bubblebottom = ' └' + '─'.repeat(this.morseinterface.letterBufferLength()) + '┘'
        }

        console.log("s: \"start\/stop\" || 1 pour demarrer le tableau [1], 2 pour le tab [2] ... || q pour quitter")
        console.log(`┌┬─┬─┐       ┌────────────────┬─┬─┐
││.│┼┼─────┬─┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼│.│┼┼┬─┬────┐
└┼─┴───────┘ └───────┼┼───────┴─┴──┘ │    │      ${bubbletop}
 │ ▲ |---   *  |   | ││  -     ---   │  +++++         ${bubbleend}${this.morseinterface.letterBuffer[0]}${bubbleend}
 │ │ |   |     |   | ││ / \\   |   |  │ +++++++        ${bubbleend}${this.morseinterface.letterBuffer[1]}${bubbleend}
 │ │ |   |  |   \\ /  └┘|   |  |   |  │ ++${this.claraface[0]}  ${this.claraface[1]}+        ${bubbleend}${this.morseinterface.letterBuffer[2]}${bubbleend}
 │ │ |   |  |    |     |---|  |. .|  │ ++  ${this.claraface[2]} + ◄─┐   ${bubble}${this.morseinterface.letterBuffer[3]}${bubbleend}
 │ │ |   |  |    |     |   |  | 0 |  │ +┌──┐ +   │    ${bubbleend}${this.morseinterface.letterBuffer[4]}${bubbleend}
 │ │ |   |  |    |     |   |  |   |  ├──┼┼┼┴──── │    ${bubbleend}${this.morseinterface.letterBuffer[5]}${bubbleend}
 │ │ |---   |    |     |   |   ---   └────┘claRa─┘    ${bubbleend}${this.morseinterface.letterBuffer[6]}${bubbleend}
 │ │                                           i     ${bubblebottom}
 └─┼───────────┬─┬───────────────────┐  <3      g
   └──────┼┼┼┼┼│.│┼┼┼┼┼────────────┼┼│           o
          └────┴─┴────┘            └─┴──────────.`)
    }

    claraOneLine(){
        let bubble = '';
        let bubbletop = '';
        let bubblebottom = '';
        if (this.clarawords != '') {
            bubble = '<│' + this.clarawords + '│';
            bubbletop = '     ┌' + '─'.repeat(this.clarawords.length) + '┐'
            bubblebottom = ' └' + '─'.repeat(this.clarawords.length) + '┘'
        }

        console.log("s: \"start\/stop\" || 1 pour demarrer le tableau [1], 2 pour le tab [2] ... || q pour quitter")
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

    outLayer(clips) {
        let charis = "□";
        let stri = charis.repeat(clips.nclips)
        stri = stri.split('');
        if (clips.selected != -1) {
            stri[clips.selected] = '■';
        }
        stri = stri.join('');
        return `Layer -> ${clips.layerid}${' '.repeat(4 - String(clips.layerid).length)}${stri}`;
    }

    drawTableaux(tableaux) {
        super.drawTableaux(tableaux);
        this.draw();
    }

    draw(){
        if (this.done) {
            this.done = false
            console.log("─".repeat(this.maxLength));
            let remain = this.maxHeight - this.header();
            remain -= 3;
            if(this.tabdrawactivated){
                this.drawTab()
            }
            console.log("\n".repeat(remain))
            this.drawMorse();
            console.log("─".repeat(this.maxLength));
            this.done = true;
        }
    }

    drawMorse(){
        if(this.morseinterface.morseTrack[0] != ""){
            console.log(this.morseinterface.morseTrack[0]);
            console.log(this.morseinterface.morseTrack[1]);
            console.log(this.morseinterface.morseTrack[2]);
        }
        return 3
    }

    drawTab(){
        let tableaux = this.lastTableauxstate;
        let tabHeight = 0;
        let j = 0
        tableaux.forEach((tableau) => {
            console.log(`[${j + 1}]:      ${String(tableau.duration - tableau.count)}`)
            tabHeight += 1;
            if (tableau.activeclips) {
                let i = 0;
                tableau.activeclips.forEach(clips => {
                    let strlayer = [];
                    strlayer.push(`${' '.repeat(2)}`)

                    strlayer.push(this.outLayer(clips))
                    console.log(strlayer.join(""))
                    i++
                    tabHeight += 1;
                })
                console.log('\n');
                tabHeight += 1;
            } else {
                console.log("no active clips")
            }
            j++;
        })
        return tabHeight;
    }

    claraSay(s, f, long = false) {
        if(s && f){
            this.clarawords = s;
            this.claraface = f;
            this.draw();
            if (!long) {
                setTimeout(() => {
                    this.clarawords = '';
                    this.claraface = this.restingFace;
                    this.draw();
                }, 1000);
            }
        }
    }
    
    claraSayMorse(morsechar, letter, face){
        this.claraface = face;
        this.morseinterface.addLetterToMorse(letter);
        this.morseinterface.addMorsePart(morsechar);
        this.draw();
    }
    
    inputs(key) {
        if (/^[0-9]$/i.test(key)) {
            this.actions.tabselect(key);
        } else if (key == 's') {
            this.actions.onoff();
        } else if (key == 'q' || key == 'CTRL_C') {
            this.actions.quit();
        }
    }

    start() {
        this.claraSay("READY TO GO !", ['*', '*', '<'], true)
        this.term.grabInput()
    }

    stop() {
        this.claraSay("OK BYE !", ['♡︎', '♡︎', '<'], true)
        this.term.hideCursor(false);
        this.term.grabInput(false);
        setTimeout(() => {
            this.term.moveTo(1, this.term.height, '\n\n');
            process.exit();
        }, 100);
    }
}
module.exports = { InterfaceConsole, InterfaceASCII }

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