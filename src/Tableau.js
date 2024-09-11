class Tableau{
    constructor(id, duration, startdelay, layers, nclips, connector, statechangecb ){
        this.clock;
        this.count;
        this.task;
        this.id = id;
        this.done = false;
        this.duration = duration;
        this.startdelay = startdelay;
        this.activeclips = [];
        this.layers = layers;
        this.n_clips = nclips;
        this.statechangeemitter = statechangecb;
        this.connector = null;
        if(connector){
            this.connector = JSON.parse(JSON.stringify(connector));
        }
    }

    startprocess(){
        this.activeclips = [];
        let clip_number = Math.floor(Math.random() * this.n_clips);
        this.layers.slice().reverse().forEach((layer)=>{
            let clips = {layerid: layer, nclips:this.n_clips, selected: clip_number}
            this.activeclips.push(clips)
        })

        this.statechangeemitter({groupid:this.id, type:'start'});
        if(this.connector){
            this.connector.forEach((connector) => {
                let strmessage = connector.custom_message;
                if(connector.value_interval_int || connector.value_interval_float){
                    let value_interval = [];
                    if(connector.value_interval_int){
                        value_interval = connector.value_interval_int;
                    }else if(connector.value_interval_float){
                        value_interval = connector.value_interval_float;
                    }
                    let connectorValue = Math.random() * (value_interval[1] - value_interval[0]) + value_interval[0];
                    if(connector.value_interval_int){
                        connectorValue =  Math.floor(connectorValue);
                    }
                    this.statechangeemitter({groupid:this.id, type:'connector', message: strmessage, value: connectorValue });
                }
            })
        }
        this.run();
    }
    start(){
        setTimeout(() => { this.startprocess();}, this.startdelay*1000);
    }

    stop(){
        if(this.done){
            this.done();
        }
        clearInterval(this.clock)
        this.count = 0;
        this.activeclips.forEach((clips) => {
            clips.selected = -1;
        }) 
        this.statechangeemitter({groupid:this.id, type:'stop'});
    }

    restart(){
        this.stop();
        this.start();
    }

    async restartprocess(){
        this.stop()
        this.startprocess()
    }  
    async run(){
        this.task = new Promise((done)=> { 
            this.done = done
            this.count = 0;
            this.clock = setInterval(() => {
                if(this.count<this.duration-1){
                    this.count = this.count+1;
                    this.statechangeemitter({groupid:this.id, type:'tick'});
                }else{
                    clearInterval(this.clock)
                    this.restartprocess()
                }
            }, 1000);   
        
        }, (fail) => {console.error("promise error")});
        await this.task
    }
}
module.exports = Tableau