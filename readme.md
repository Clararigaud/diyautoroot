# Structure du fichier de config json
```
{
    "setup" : {
        "resolumeIP": "0.0.0.0", // l'ip de Resolume
        "resolumeInputPort": 7000, // le port de Resolume
        "localIp": "0.0.0.0", // 
        "localPort": 9000 // le port à écouter pour recevoir l'OSC
    },
    "metronomes": [
        {
            "layer": 1, // le numero de la layer dans resolume
            "duration": 25, // la durée d'un tick en secondes
            "n_clips": 14 // le nombre de clips de la layer
        },
        {...},
        {...}
    ],
    "connector": { // 
        "/osc_message_1" : { // clé OSC en entrée
            "layer": 2, // numero de layer de destination
            "dashboardlevel" : "clip", "clip" pour envoyer au dashboard de tous les clips, "layer" pour envoyer au dashboard du layer
            "link": 1 // link associé dans le dashboard resolume (de 1 à 8) 
        }, 
         "/osc_message_2" : { ... }
    }
}```