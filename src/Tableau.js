class Tableau{
    constructor(id, duration, layers, nclips, connector, statechangecb ){
        this.clock;
        this.count;
        this.task;
        this.id = id;
        this.done = false;
        this.duration = duration;
        this.activeclips = [];
        this.layers = layers;
        this.n_clips = nclips;
        this.statechangeemitter = statechangecb;
        this.placeHolder = '**value**';
        this.connector = null;
        this.checkConnector(connector);
        console.log(this.connector)

    }

    checkConnector(connector){
        if(connector){
            if(typeof(connector.custom_message) === "string" && !(Array.isArray(connector.value_interval) ^ connector.custom_message.includes(this.placeHolder))){
                this.connector = JSON.parse(JSON.stringify(connector));
                if(Array.isArray(connector.value_interval) && connector.custom_message.includes(this.placeHolder)){
                    if(!connector.value_interval.length == 2){
                        this.connector = null;
                    }
                    
                }
            }
        }
    }

    start(){
        this.activeclips = [];
        let clip_number = Math.floor(Math.random() * this.n_clips);
        this.layers.slice().reverse().forEach((layer)=>{
            let clips = {layerid: layer, nclips:this.n_clips, selected: clip_number}
            this.activeclips.push(clips)
        })
        this.run();
        this.statechangeemitter({groupid:this.id, type:'start'});
        if(this.connector){
            let strmessage = this.connector.custom_message;
            if(this.connector.value_interval){
                this.connectorValue = Math.floor(Math.random() * (this.connector.value_interval[1] - this.connector.value_interval[0]) + this.connector.value_interval[0]);
                strmessage = strmessage.replace(this.placeHolder, String(this.connectorValue));
            }
            console.log(strmessage)
            this.statechangeemitter({groupid:this.id, type:'connector', message: strmessage});
        }
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
module.exports = Tableau