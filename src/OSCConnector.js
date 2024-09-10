class OSCConnector {
    constructor(infos) {
        this.outputResolume = infos.outputResolume;
        this.outputBilly = infos.outputBilly;
        this.input = null;
        this.OSC = require('osc-js');
        const EventEmitter = require('node:events');
        this.eventEmitter = new EventEmitter();
        this.socket = require('dgram').createSocket("udp4");
        this.socket.on("error", function (err) {
            console.log("Socket error: " + err);
        });
        this.initInputListener(infos.input);
    }

    message(oscadress, value = "") {
        let message = new this.OSC.Message(oscadress, value);
        let binary = message.pack()
        this.socket.send(Buffer.from(binary), 0, binary.byteLength, this.outputResolume.port, this.outputResolume.ip, function (err, bytes) { });
    }

    messageBilly(oscadress, value = "") {
            let message = new this.OSC.Message(oscadress, value);
            let binary = message.pack()
            this.socket.send(Buffer.from(binary), 0, binary.byteLength, this.outputBilly.port, this.outputResolume.ip, function (err, bytes) { });
    }

    initInputListener(infos) {
        this.input = infos;
        this.socket.on('message', msg => {
        try {
            const t = new DataView(msg.buffer.slice(msg.byteOffset, msg.byteOffset + msg.byteLength));
            const oscmsg = new this.OSC.Message()
            oscmsg.unpack(t)

            var data = {
                types: oscmsg.types,
                args: oscmsg.args
            }
            this.eventEmitter.emit(oscmsg.address, data);

            //console.log("receiving "+oscmsg.address + ": " + oscmsg.args +  " at " + this.input.port)
        } catch (error) {
            // console.log(error)
        }
        });

        // this.socket.on('listening', () => {
        //     var address = this.socket.address();
        //     // console.log("listening on :" + address.address + ":" + address.port);
        // });

        this.socket.bind(this.input.port);
    }
}
module.exports = OSCConnector