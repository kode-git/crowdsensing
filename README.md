# Privacy-aware Crowdsensing

Si vuole realizzare una piattaforma di mobile crowdsensing (piattaforma rac- colta dati attraverso la collaborazione da parte degli utenti), per il monitoraggio dell’inquinamento acustico in uno scenario urbano. La piattaforma è costituita da tre componenti:

1. L’App mobile, attraverso la quale l’utente pu`o partecipare al servizio di crowdsensing su base volontaria. In questo caso, l’app campiona il livello di rumore (tramite microfono) e la posizione GPS utente, con una frequenza prefissata. Successivamente, i dati campionati vengono trasferiti verso un back-end remoto, utilizzando il formato GEO-JSON. Inoltre, in base alla posizione attuale dell’utente, ed all’eventuale presenza di dati nel back- end, l’app consente di visualizzare il livello medio del rumore nella zona in cui si trova l’utente.
2. Un front-end Web (non mobile) per la sola visualizzazione dei dati raccolti dallo scenario, tramite il quale è possibile visualizzare su mappa l'output dell'algoritmo di clustering basato su K-means, le misurazioni effettuate e l'heatmap del rumore prodotto a partire dalle misurazioni raccolte.
3. Un back-end attraverso il quale vengono raccolte le singole misurazioni e memorizzate su DB spaziale. Inoltre, il back-end invia la posizione del rumore medio nella posizione attuale dell’utente, aggregando tutte le misurazioni nel raggio di 3 Km.

## Tradeoff

In aggiunta, il focus del progetto è sull’implementazione di meccanismi di gestione del trade-off tra: <br><br>
<b>(i)</b> privacy della posizione utente, espressa sotto forma di difficoltà da parte del back-end di ricostruire in maniera esatta la traiettoria dell’utente che partecipa al sistema di crowdsensing; <br>
<b>(ii)</b> Qualità del Servizio (QoS) risultante.

Per raggiungere ciò, il progetto prevede:
1. L’implementazione di uno o piu` meccanismi di privacy tra quelli presentati a lezione (es. dummy updates, GPS perturbation), attraverso il quale il client mobile perturba i dati di posizione PRIMA di inviarli al back-end.
2. La valutazione di prestazione del servizio, in base alla configurazione richi- esta, sotto forma di: (i) Metrica di Privacy, ossia distanza media tra la posizione reale dell’utente e quella inviata alla piattaforma; (ii) Metrica di QoS, sotto forma di errore quadratico medio sulle misurazioni di rumore (nel caso in cui la privacy sia abilitata o disabilitata).

## Cloaking Spaziale
Si intende sviluppare soluzioni di privacy basate su meccanismo di cloaking spaziale, aggiungendo all’architettura la presenza di un server trusted (in grado di aggregare in maniera opportuna i dati provenienti da piu` utenti che si muovono nella stessa area). Possono inoltre essere considerati i seguenti add-on

## Tecnologie utilizzate

1. PostGIS per la gestione del back-end sui dati spaziali
2. OpenLayers per la gestione dei dati spaziali nella dashboard del front-end
3. Node.js per la gestione del server trusted utilizzato per il meccanismo di cloaking spaziale
4. PostgreSQL come DBMS di gestione delle informazioni spaziali
5. App Android basata su Java (SDK 17 -  Oreo 8.1)

## Contributors
- Andrea Gurioli (@andreagurioli1995)
- Giovanni Pietrucci (@giovanniPi997)
- Mario Sessa (@kode-git)

