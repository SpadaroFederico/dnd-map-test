🧭 D&D Map Editor WebGL (PixiJS)
🎯 Obiettivo del Progetto

L’obiettivo è sviluppare un editor di mappe fantasy stile Inkarnate, utilizzando WebGL attraverso PixiJS.
L’editor permetterà di disegnare e modellare terreni, texture, livelli e pennelli personalizzati su una mappa tileabile.

Il progetto è pensato per funzionare interamente lato client (frontend), con un’architettura modulare che in futuro potrà integrare:

gestione di layer multipli (acqua, terra, strade, decorazioni, ecc.);

pennelli dinamici per aggiungere o rimuovere terreno;

sistema di salvataggio locale o remoto (via API);

esportazione in formato immagine o JSON.

🎨 Sistema di Blending delle Texture

Uno degli obiettivi principali dell’editor è replicare la logica di Inkarnate, dove la superficie della mappa non è semplicemente una serie di tile giustapposte, ma un’area continua in cui i materiali (es. erba, sabbia, pietra, neve) si fondono in modo naturale.
Questo avviene grazie al texture blending, una tecnica che mischia dinamicamente più texture in base alla posizione del pennello e all’intensità del disegno.

🧬 Implementazione Tecnica del Blending
🧩 Concetto generale

Il sistema di blending serve a fondere dinamicamente più texture (es. erba, sabbia, acqua, roccia) su uno stesso piano di mappa, garantendo transizioni fluide e naturali.
Ogni materiale è rappresentato da un layer separato e da una maschera alpha, che indica dove e quanto è visibile quella texture.

Quando l’utente “dipinge” con un pennello:

Il pennello modifica la maschera alpha del layer selezionato.

I pixel vengono fusi graficamente tramite WebGL in tempo reale.

Le transizioni avvengono in modo graduale, con sfumature controllate dalla durezza del pennello.

⚙️ Architettura di rendering

Layer di base (TilingSprite):

Ogni terreno è una texture seamless (erba, sabbia, acqua, ecc.).

Ogni texture viene renderizzata tramite PIXI.TilingSprite, in modo da poter essere ripetuta all’infinito.

Maschera alpha (RenderTexture):

Ogni layer ha una RenderTexture che funge da maschera.

Il pennello disegna su questa maschera, aggiornandone i valori alpha.

La maschera viene poi applicata al layer tramite sprite.mask.

Blending WebGL:

Le texture vengono combinate sfruttando il blending hardware della GPU (blendMode).

Modalità possibili:

NORMAL → unione diretta

MULTIPLY → utile per fusione scura (ombre)

SOFT_LIGHT o OVERLAY → perfette per transizioni di terreni

La scelta del blend mode sarà dinamica in base al tipo di terreno.

🎨 Shader GLSL personalizzati (livello avanzato)

Per ottenere un effetto simile a Inkarnate, in una fase più avanzata si può utilizzare un fragment shader GLSL personalizzato.

Esempio concettuale di shader di blending:
precision mediump float;

uniform sampler2D uTextureA;
uniform sampler2D uTextureB;
uniform sampler2D uMask;
varying vec2 vTextureCoord;

void main(void) {
  vec4 colorA = texture2D(uTextureA, vTextureCoord);
  vec4 colorB = texture2D(uTextureB, vTextureCoord);
  float maskValue = texture2D(uMask, vTextureCoord).a;

  // fusione controllata dalla maschera alpha
  gl_FragColor = mix(colorA, colorB, maskValue);
}


Questo approccio permette un blending infinitamente più preciso e realistico, ideale per materiali naturali come sabbia, fango, o transizioni di biomi.

🧰 Tecnologie coinvolte
Tecnologia	Scopo
PixiJS (WebGL2)	Gestione canvas e rendering 2D
PIXI.TilingSprite	Ripetizione infinita di texture
PIXI.RenderTexture	Maschera di disegno in tempo reale
PIXI.Filter / Custom GLSL Shader	Fusione dinamica tra materiali
PIXI.Graphics	Strumenti di pennello e forme base
Eventi interattivi (pointerdown, pointermove)	Gestione disegno e blending in tempo reale
🔮 Obiettivo finale del sistema di blending

Simulare il comportamento del pennello di Inkarnate.

Permettere di disegnare terreni che si fondono visivamente tra loro.

Supportare zoom, pan e layer multipli.

Mantenere performance elevate anche con più texture e maschere attive.

🧠 Prompt di riferimento per nuove sessioni (riassunto)

“Sto sviluppando un editor di mappe in stile Inkarnate utilizzando PixiJS e WebGL2.
Voglio implementare un sistema di blending delle texture in tempo reale, dove più layer di terreno (es. erba, sabbia, acqua) si fondono con transizioni morbide tramite maschere alpha e shader GLSL personalizzati.
Ogni pennello modifica la maschera del layer attivo e la GPU gestisce la fusione in tempo reale.
L’obiettivo è ottenere un effetto di terreno naturale e continuo, senza stacchi netti tra le texture.”

🔍 Descrizione Tecnica

Il texture blending consiste nel gestire più layer sovrapposti, ciascuno con una propria texture di base e una maschera di trasparenza (alpha mask).
Quando l’utente utilizza un pennello per “pitturare” un terreno, il sistema:

Identifica il layer attivo (es. sabbia sopra l’erba).

Applica una maschera di sfumatura (radiale o direzionale) sull’area disegnata.

Combina i pixel dei layer tramite operazioni di blending WebGL (ad esempio normal, multiply, overlay o soft-light).

Questo approccio consente di ottenere transizioni morbide e naturali tra zone differenti, eliminando il classico effetto “tile netto”.

🧠 Comportamento del Pennello

Ogni pennello agisce come una maschera dinamica che modifica l’alpha map del layer corrispondente.

Le zone in cui due materiali si sovrappongono vengono interpolate in tempo reale, creando un effetto visivo di fusione organica.

È possibile regolare parametri come durezza, raggio e intensità del pennello, per simulare pennellate più morbide o più marcate.

🧩 Obiettivo finale

Implementare un sistema in cui:

I layer principali (es. erba, sabbia, acqua, roccia) siano visibili contemporaneamente.

Le pennellate modifichino le maschere alpha dei layer superiori.

Le texture risultino perfettamente “blendate” tra loro in tempo reale, sfruttando le GPU via WebGL2 (tramite PixiJS).

🧱 Stack Tecnologico
Tecnologia	Scopo	Versione
Vite	Bundler moderno e veloce	^7.x
TypeScript	Tipizzazione e organizzazione del codice	^5.x
PixiJS	Rendering 2D WebGL	7.4.2
HTML/CSS	Struttura e stile base del canvas	—
Node.js / npm	Gestione pacchetti	v22+
📂 Struttura del Progetto
dd-map-editor-webGL/
├─ src/
│  ├─ app/
│  │  └─ App.ts                → punto di avvio logico dell’editor
│  ├─ engine/
│  │  ├─ PixiApp.ts            → inizializzazione PixiJS
│  │  └─ Background.ts         → gestione dello sfondo tileabile
│  ├─ assets/
│  │  └─ grass_1.png           → texture base (erba seamless)
│  ├─ main.ts                  → entry point del progetto
│  └─ styles/
│     └─ app.css               → stile base
├─ index.html                  → root HTML
├─ tsconfig.json               → configurazione TypeScript
├─ package.json                → dipendenze e script
└─ README.md                   → questo file

⚙️ Setup del Progetto
1️⃣ Installazione

Clona la repository:

git clone https://github.com/tuo-username/dd-map-editor-webGL.git
cd dd-map-editor-webGL


Installa le dipendenze:

npm install

2️⃣ Avvio in modalità sviluppo
npm run dev


Il server partirà su:

http://localhost:5173

3️⃣ Build di produzione
npm run build


I file pronti per la distribuzione si troveranno nella cartella dist/.

🧩 Funzionalità Attuali

✅ Inizializzazione ambiente PixiJS (WebGL2)
✅ Render del canvas su schermo
✅ Creazione e gestione di un container principale (world)
✅ Caricamento e render di una texture tileabile (TilingSprite)
✅ Base solida per pan, zoom e pennelli

🪄 Prossime Fasi
Fase	Descrizione
Fase 2	Aggiungere lo sfondo infinito con la texture seamless (es. erba, sabbia)
Fase 3	Implementare il pan e zoom della mappa
Fase 4	Aggiungere il sistema dei layer e dei pennelli (blend tra terreni)
Fase 5	Interfaccia grafica base per strumenti, toolbar e salvataggio
⚠️ Note Tecniche Importanti

Versione di PixiJS: si utilizza la 7.4.2 per garantire compatibilità piena con WebGL2 e API stabili.
(PixiJS 8 introduce Application.init() ma è ancora instabile con Vite/TypeScript.)

Texture seamless: dev’essere ripetibile orizzontalmente e verticalmente per evitare bordi visibili.

Browser consigliati: Chrome / Edge / Firefox aggiornati (supporto WebGL2 attivo).

Compatibilità: nessuna dipendenza lato backend; tutto gira in locale via Vite.

👨‍💻 Manutenzione e sviluppo

Per aprire la repository su un altro dispositivo:

Clona la repo (git clone ...)

Esegui npm install

Avvia con npm run dev

Verifica che il canvas renderizzi correttamente

🧠 Licenza e contributi

Questo progetto è in fase di sviluppo sperimentale.
Le texture utilizzate devono essere libere da diritti o create dall’utente.

🚀 Stato attuale

✅ Ambiente PixiJS funzionante
🟡 In arrivo: sfondo tileabile + pan/zoom
🔜 Step successivi: gestione layer e pennelli
