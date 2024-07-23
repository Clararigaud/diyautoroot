class OSCConnector {
    constructor(infos) {
        this.output = infos.output;
        this.input = infos.input;
        this.connectors = infos.connectors;
        this.OSC = require('osc-js');
        this.socket = require('dgram').createSocket("udp4");
        this.socket.on("error", function (err) {
            console.log("Socket error: " + err);
        });

        this.socket.on('message', msg => {
            const t = new DataView(msg.buffer.slice( msg.byteOffset, msg.byteOffset + msg.byteLength ));
            const oscmsg = new this.OSC.Message()
            oscmsg.unpack(t)

            var data = {
                types: oscmsg.types,
                args: oscmsg.args
            }

            if(Object.keys(this.connectors).includes(oscmsg.address)){
                const conn = this.connectors[oscmsg.address]; 
                let str = "/composition/layers/"
                str += String(conn.layer) +"/";
                if(conn.dashboardlevel == "clip"){
                    str += "clips/*/";
                }
                str += "dashboard/link" + String(conn.link) + "/";

                // console.log(str, String(oscmsg.args[0]))
                this.message(str, parseFloat(oscmsg.args[0]))
            }
            // console.log("receiving "+oscmsg.address + ": " + oscmsg.args +  " at " + this.input.port)
        });

        this.socket.on('listening', () => {
            var address = this.socket.address();
            console.log("listening on :" + address.address + ":" + address.port);
        });

        this.socket.bind(this.input.port);
    }

    message(oscadress, value = "") {
        let message = new this.OSC.Message(oscadress, value);
        let binary = message.pack()
        this.socket.send(Buffer.from(binary), 0, binary.byteLength, this.output.port, this.output.ip, function (err, bytes) { });
    }
}
module.exports = OSCConnector