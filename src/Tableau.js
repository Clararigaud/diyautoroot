class Tableau{
    constructor(id, duration, layers, nclips, connector, statechangecb ){
        this.clock;
        this.count;
        this.task;
        this.id = id;
        this.done = false;
        this.duration = duration;
        this.activeClips = [];
        this.layers = layers;
        this.n_clips = nclips;
        this.statechangeemitter = statechangecb;

        this.connector = connector;
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
module.exports = Tableau