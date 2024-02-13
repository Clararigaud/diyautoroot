class Tableau{
    constructor(id, duration, layers, statechangecb){
        this.clock;
        this.count;
        this.task;
        this.id = id;
        this.done = false;
        this.duration = duration;
        this.activeClips = [];
        this.layers = layers;
        this.statechangeemitter = statechangecb;
    }

     start(){
        this.activeclips = [];
        this.layers.slice().reverse().forEach((layer)=>{
            let clips = {layerid:layer.id, nclips:layer.nombreClips, selected: Math.floor(Math.random() * layer.nombreClips)}
            this.activeclips.push(clips)
        })

            this.run()
            this.statechangeemitter({groupid:this.id, type:'start'});
        
    }

    stop(){
        this.done();
        clearInterval(this.clock)
        this.count = 0;
        this.activeclips.forEach((clips) => {
            clips.selected = -1;
        }) 
        this.statechangeemitter({groupid:this.id, type:'stop'});
    }

    async restart(){
        this.stop()
        this.start()
    }  
    
    async run(){
        this.task = new Promise((done)=> { 
            this.done = done
            this.count = 0;
            this.clock = setInterval(() => {
                if(this.count<this.duration){
                    this.statechangeemitter({groupid:this.id, type:'tick'});
                    this.count = this.count+1;
                }else{
                    clearInterval(this.clock)
                    this.restart()
                }
            }, 1000);   
        
        }, (fail) => {console.error("promise error")});
        await this.task
    }
}

class ResolumeDirector{
    constructor(conn, architecture, myinterface, verbose=false){
        const { createRequire } = require('node:module');
        require = createRequire(__filename); 
        const OSCConnector = require('./OSCConnector');
        this.messager = new OSCConnector(conn.ip, conn.inputport, conn.outputport);
        this.running = false
        this.groups = [];
        this.interface = myinterface
        this.verbose = verbose;
        this.changestate = (e) => {
            let group = this.groups[this.getGroupIndexfromId(e.groupid)]
            switch (e.type) {
                case "start":
                    if(this.running){
                        //                 console.log(`
                        //  +++++    
                        // +++++++          
                        // ++O  O+   ┌──────────────────────────────┐  
                        // ++  o +  <│   Démarrage du tableau ${group.id}
                        // ++    +   └──────────────────────────────┘
                        //                 `)
                        this.interface.claraSay(`Démarrage du tableau ${group.id}`,['^','^','O'])
                        //this.interface.draw(this.groups)
                    }
                    this.sendTableauData(group.activeclips);
                    break;
                case "tick":
                    this.interface.draw(this.groups)
                    break;
                case "stop":
                    this.interface.draw(this.groups)
                default:
                    break;
            }
        };
        architecture.forEach((tableau) => {
            this.groups.push(new Tableau(parseInt(tableau.id), tableau.duration, tableau.layers, this.changestate))
        })
        if(this.verbose){
            console.log("Initialized randomizer, tableaux:", this.groups.length, " ResolumeIP: ", conn.ip, " ResolumeOutputPort: ", conn.outputport, " ResolumeInputPort: ", conn.inputport) 
        }
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
        this.interface.claraSay(`LEZGOOOOW ! `,['o','O','o'])
    }

    stop(){
        this.groups.forEach((tableau)=>{
            tableau.stop();
        })
        this.running = false;
        this.interface.claraSay(`OK j'arrete tout ! `,['_','_','.'])
    }
 
    clearClips(){ 
        this.groups.forEach(group => {
            let msg = `/composition/groups/${group.id}/disconnectlayers`;
            this.messager.message(msg, 1);
        });
    }

    restartGroup(g){
        if(this.groups.length>g && this.running){
            this.groups[g].restart();
        }else{
            return
        }
    }
    
    sendTableauData(activeclips){
        activeclips.forEach(clips => {
            this.messager.message(`/composition/layers/${clips.layerid}/clips/${clips.selected+1}/connect`, 1);
            //console.log("sending connect message", `/composition/layers/${clips.layerid}/clips/${clips.selected+1}/connect`)
        });
    }
}

module.exports = ResolumeDirector
