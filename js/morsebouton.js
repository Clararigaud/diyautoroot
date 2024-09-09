
document.addEventListener('DOMContentLoaded', () => {

    let timestart = 0;
    let bipduration = 0;

    let fin = null;
    let p = document.querySelector('#morse');
    let currentLetter = "";
    let display = "";

    document.addEventListener('mousedown', (e) => {
        e.preventDefault();
        timeStart = Date.now();
        
    })

    document.addEventListener('mouseup', (e) => {
        e.preventDefault();
        clearTimeout(fin)
        
        bipduration = Date.now() - timeStart;

        if (bipduration < 150) {
            currentLetter += ".";
            display += ".";
        } else {
            currentLetter += "-"
            display += "_";
        }
        p.textContent = display;
        fin = setTimeout((e) => {
            let letter = checkLetter(currentLetter);
            console.log(letter);
            currentLetter = "";
            display += " "
        }, 800);
    });
});

function checkLetter(letter){
    let code = {
        a: '.-',
        b: '-...',
        c: '-.-.',
        d: '-',
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
        console.log(Object.keys(code)[Object.values(code).indexOf(letter)])
    }
}