class ResolumeDirector{
    constructor(conn, metronomes, myinterface, verbose=true){
        const { createRequire } = require('node:module');
        require = createRequire(__filename); 
        const OSCConnector = require('./OSCConnector');
        const Tableau = require('./Tableau');
        const Morse = require('./Morse');
        this.messager = new OSCConnector(conn);
        this.running = false
        this.groups = [];
        this.interface = myinterface;
        this.verbose = verbose;
        this.morse = new Morse(myinterface);
        this.animClock = setInterval((e) => {
            this.triggerFrame(); 
        }, 100);
        
        this.changestate = (e) => {
            let group = this.groups[this.getGroupIndexfromId(e.groupid)];
            switch (e.type) {
                case "start":
                    this.interface.drawTableaux(this.groups);
                    this.sendTableauData(group.activeclips);
                    break;
                case "tick":
                    this.interface.drawTableaux(this.groups);
                    break;
                case "stop":
                    this.interface.drawTableaux(this.groups);
                    break;
                case "connector":
                    // console.log(e.message)
                    this.sendCustomMessage(e.message, e.value);
                    break;
                default:
                    break;
            }
        };
        metronomes.forEach((tableau, i) => {
            this.groups.push(new Tableau(i, tableau.duration, tableau.startdelay, tableau.layers, tableau.n_clips, tableau.connector, this.changestate))
        })
        if(this.verbose){
            console.log("Initialized randomizer, tableaux:", this.groups.length, " ResolumeIP: ", conn.ip, " ResolumeOutputPort: ", conn.outputport, " ResolumeInputPort: ", conn.inputport) 
        }

        this.messager.eventEmitter.on('/morse', (e) => {
            if(e.args[0] == 0){
                this.morse.buttonStop();
            }else if(e.args[0] == 1){
                this.morse.buttonStart();
            }
        })

        this.morse.eventEmitter.on('sos', () => {
            this.messager.messageBilly('sos', 1);
        })
    }

    triggerFrame(){
        this.interface.morseTrackNextFrame();
        this.interface.draw();
    }
    getGroupIndexfromId(id){
        let i = 0;
        while(this.groups[i].id != id){
            i++
        }
        return i
    }

    start() {
        if(!this.running){
            this.groups.forEach((tableau) => {
                tableau.start();
            })
            if(this.verbose){console.log("Randomizer started")} 
            this.running = true;
        }else{
            if(this.verbose){console.info("Déjà démarré")}
        }
    }

    stop(){
        this.groups.forEach((tableau)=>{
            tableau.stop();
        })
        this.running = false;
    }

    clearClips(){ 
        this.groups.forEach(group => {
            let msg = `/composition/groups/${group.id}/disconnectlayers`;
            this.messager.message(msg, 1);
        });
    }

    restartGroup(g){
        // if(this.groups.length>g && this.running){
        //     this.groups[g].restart();
        // }else{
        //     return
        // }
    }
    
    sendCustomMessage(message, value){
        this.messager.message(message, value);
    }

    sendTableauData(activeclips){
        activeclips.forEach(clips => {
            this.messager.message(`/composition/layers/${clips.layerid}/clips/${clips.selected+1}/connect`, 1);
        });
    }
}
module.exports = ResolumeDirector