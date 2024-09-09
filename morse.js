
const { stdin: input, stdout: output, constrainedMemory } = require('node:process');
const port = 3000;
const express = require('express');
const app = express();

let http;
let server;
const fs = require('fs');
http = require('http');
server = http.createServer(app);


// initialize hostnames
let hostnames = ["localhost", "*"];
const { networkInterfaces, hostname } = require('os');
const nets = networkInterfaces();
for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            hostnames.push(net.address);
        }
    }
}
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/morsebouton.html');
});

app.use('/js', express.static(__dirname + '/js'));

server.listen(port, () => {
    console.log(`listening on:`);
    hostnames.forEach(hostname => {
        let protocol = "http";

        console.log(`- ${protocol}://${hostname}:${port}`);
    })
});


// let rl = require('node:readline').createInterface({ input, output });
// console.log('yo');
// rl.on('line', (key) => {inputs(key)})

// function inputs(key){
//     console.log('yo');
//     console.log(key);
// }