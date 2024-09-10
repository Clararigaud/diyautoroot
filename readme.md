# Structure du fichier de config json
```
{
    "setup": {
        "resolumeIP": "0.0.0.0",
        "resolumeInputPort": 7002,
        "billyInputPort": 7001
    },
    "metronomes": [
        {
            "layers": [6, 2], // layers vers lesquelles envoyer le message de connect à chaque fin de compte à rebours ( le meme numero de clip random pour chacune )
            "duration": 1, // la durée du compte à rebours
            "n_clips": 14, // le nombre de clip de chaque layers ( il doit etre le meme  pour toutes du coup) 
            "connector" : {
                "value_interval": [0, 1], // valeur aléatoire  ( R2) 
                "custom_message": "/composition/layers/2/posx**value**" // message custom envoyé à chaque fin de compte à rebours, valeur peut etre fixe ou **value**  
            }
        },
        {
            "layers": [1], // si il y a une seule layer
            "duration": 4,
            "n_clips": 3,
            "connector" : {
                "custom_message": "/composition/layers/5/posx32000"  // exemple avec valeur fixe
            } 
        },
        {
            "layers": [3,5], // exemple sans connector
            "duration": 4,
            "n_clips": 3
        }
    ]
}

}```
