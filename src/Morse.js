class Morse{
    constructor(myinterface){
        this.timeStart = 0;
        this.bipduration = 0;
        this.fin = null;
        this.finMot = null;
        this.currentLetter = "";
        this.display = "";
        this.interface = myinterface;
        this.sosbuffer = ["","",""];
        const EventEmitter = require('node:events');
        this.eventEmitter = new EventEmitter();
    }
    
    buttonStart(){
        this.timeStart = Date.now();
    }

    buttonStop(){
        clearTimeout(this.fin);
        clearTimeout(this.finMot);
        this.bipduration = Date.now() - this.timeStart;

        if (this.bipduration < 200) {
            this.currentLetter += ".";
            this.display = ".";
        } else {
            this.currentLetter += "-"
            this.display = "_";
        }
        if(this.currentLetter.length <= 5){
            this.interface.claraSayMorse(this.display, null, ['#','#','O'])
            this.fin = setTimeout((e) => {
                let letter = this.checkLetter(this.currentLetter);
                this.sosbuffer[0] = this.sosbuffer[1];
                this.sosbuffer[1] = this.sosbuffer[2];
                this.sosbuffer[2] = letter;
                console.log(this.sosbuffer)
                if(this.sosbuffer[0] == 's' && this.sosbuffer[1] == 'o' && this.sosbuffer[2] == 's'){
                    this.eventEmitter.emit('sos');
                }
                this.display = " ";
                if(letter){
                    this.interface.claraSayMorse(this.display, letter, ['#','#','O'])
                }
                this.currentLetter = "";
            }, 1000);
            this.finMot = setTimeout((e) => {
                this.interface.releaseMorsePart();
                this.sosbuffer = ["","",""];
            }, 5000);
        }else{
            this.currentLetter = "";
        }
    };

    checkLetter(letter){
        let code = {
            a: '.-',
            b: '-...',
            c: '-.-.',
            d: '-..',
            e: '.',
            f: '..-.',
            g: '--.',
            h: '....',
            i: '..',
            j: '.---',
            k: '-.-',
            l: '.-..',
            m: '--',
            n: '-.',
            o: '---',
            p: '.--.',
            q: '--.-',
            r: '.-.',
            s: '...',
            t: '-',
            u: '..-',
            v: '...-',
            w: '.--',
            x: '-..-',
            y: '-.--',
            z: '--..'
        }
    
        if(Object.values(code).includes(letter)){
            return Object.keys(code)[Object.values(code).indexOf(letter)];
        }
    }
}
module.exports = Morse