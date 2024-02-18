class OSCConnector {
    constructor(ip, inputPort, outputPort) {
        this.client = {ip: ip, inputPort: inputPort, outputPort: outputPort}
        this.OSC = require('osc-js');
        this.socket = require('dgram').createSocket("udp4");
        this.socket.on("error", function (err) {
            console.log("Socket error: " + err);
        });
    }

    message(oscadress, value=""){
        let message = new this.OSC.Message(oscadress, value);
        let binary = message.pack()
        this.socket.send(Buffer.from(binary), 0, binary.byteLength, this.client.inputPort, this.client.ip, function(err, bytes) {});
    }
  }
  module.exports = OSCConnector