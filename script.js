// Memory-Karten-Daten (Beispiel)
const cardsData = [
     { id: 1, type: "term", value: "Brunftkugeln" },
     { id: 1, type: "definition", value: "Hoden des Schalenwildes" },
     {id: 2, type: "term", value: "Kessel"},
     {id: 2, type: "definition", value: "Wohnhöhle z.B. im Fuchsbau" },
     {id: 3, type: "term", value: "Schweiß"},
     {id: 3, type: "definition", value: "Blut von Wild, sobald es aus Körper austritt"},
     {id: 4, type: "term", value: "Überläufer"},
     {id: 4, type: "definition", value:  "Wildschwein im 2. Lebensjahr" },
     {id: 5, type: "term", value: "ein Stück Schwarzwild"},
     {id: 5, type: "definition", value: "ein Wildschwein" },
     {id: 6, type: "term", value: "Luder"},
     {id: 6, type: "definition", value: "Aas, mit dem Jäger Raubtiere anlocken" },
     {id: 7, type: "term", value: "Rammelzeit"},
     {id: 7, type: "definition", value: "Paarungszeit von Kaninchen und Hasen" },
     {id: 8, type: "term", value: "Schmalspießer"},
     {id: 8, type: "definition", value: "männliches Reh im 2. Lebensjahr" },
     {id: 9, type: "term", value: "Kirrung"},
     {id: 9, type: "definition", value: "Futterstelle zur Wildbeobachtung" },
     {id: 10, type: "term", value: "Grimbart"},
     {id: 10, type: "definition", value: "Alter Name für Dachs" },
     {id: 11, type: "term", value: "Jagdkanzel"},
     {id: 11, type: "definition", value: "Hochsitz" },
     { id: 13, type: "term", value: "Schalen" },
     { id: 13, type: "definition", value: "Klauen von Paarhufern" },
];
// Globale Variablen
let cards = [];
let flippedCards = [];
let attempts = 0;
let teamName = "";
let gameStarted = false;

// DOM-Elemente
const memory = document.getElementById("memory");
const counter = document.getElementById("counter");
const teamnameInput = document.getElementById("teamname");
const startButton = document.getElementById("start");

// Memory-Karten erstellen (angepasst)
function createCards() {
    memory.innerHTML = "";
    
    // Kartenpaare erstellen und mischen
    cards = [];
    
    // Zuerst Paare erstellen
    const cardPairs = [];
    const usedIds = new Set();
    
    cardsData.forEach(card => {
        if (!usedIds.has(card.id)) {
            usedIds.add(card.id);
            const termCard = cardsData.find(c => c.id === card.id && c.type === "term");
            const definitionCard = cardsData.find(c => c.id === card.id && c.type === "definition");
            
            if (termCard && definitionCard) {
                cardPairs.push([
                    { ...termCard, pairId: card.id },
                    { ...definitionCard, pairId: card.id }
                ]);
            }
        }
    });
    
    // Paare mischen und dann Karten einzeln mischen
    const shuffledPairs = cardPairs.sort(() => 0.5 - Math.random());
    
    shuffledPairs.forEach(pair => {
        // Jedes Paar einzeln mischen, damit Term und Definition nicht immer zusammen bleiben
        const shuffledPair = pair.sort(() => 0.5 - Math.random());
        cards.push(...shuffledPair.map(card => ({
            ...card,
            matched: false
        })));
    });
    
    // Finales Mischen aller Karten
    cards = cards.sort(() => 0.5 - Math.random());
    
    // Karten im DOM erstellen
    cards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.className = "card";
        cardElement.dataset.id = card.id;
        cardElement.dataset.type = card.type;
        cardElement.dataset.pairId = card.pairId;
        cardElement.addEventListener("click", flipCard);
        memory.appendChild(cardElement);
    });
}

// Karte umdrehen
function flipCard() {
    if (!gameStarted || this.classList.contains("flipped") || flippedCards.length >= 2) return;
    
    const cardId = parseInt(this.dataset.id);
    const pairId = parseInt(this.dataset.pairId);
    const cardType = this.dataset.type;
    
    const card = cards.find(c => c.id === cardId && c.type === cardType && c.pairId === pairId);
    
    this.textContent = card.value;
    this.classList.add("flipped");
    flippedCards.push({ element: this, card });
    
    if (flippedCards.length === 2) {
        attempts++;
        counter.textContent = `Versuche: ${attempts}`;
        checkMatch();
    }
}
// Übereinstimmung prüfen
function checkMatch() {
    const [first, second] = flippedCards;
    
    // Prüfe, ob die pairIds übereinstimmen UND eine Karte ein Begriff, die andere eine Definition ist
    if (first.card.pairId === second.card.pairId && 
        first.card.type !== second.card.type) {
        
        // Match gefunden!
        first.card.matched = true;
        second.card.matched = true;
        flippedCards = [];
        
        // Prüfe ob alle Karten gematcht wurden
        if (cards.every(card => card.matched)) {
            setTimeout(() => {
                alert(`Glückwunsch, ${teamName}! Du hast ${attempts} Versuche benötigt!`);
                sendToGoogleSheet();
            }, 500);
        }
    } else {
        // Kein Match - Karten wieder umdrehen
        setTimeout(() => {
            first.element.textContent = "";
            second.element.textContent = "";
            first.element.classList.remove("flipped");
            second.element.classList.remove("flipped");
            flippedCards = [];
        }, 1000);
    }
}



// Spiel starten
startButton.addEventListener("click", () => {
    teamName = teamnameInput.value.trim();
    if (!teamName) {
        alert("Bitte gib einen Teamnamen ein!");
        return;
    }
    gameStarted = true;
    attempts = 0;
    counter.textContent = `Versuche: ${attempts}`;
    createCards();
});

// Daten an Google Sheet senden
async function sendToGoogleSheet() {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbyTCL0-krlTlEPhn_N2wLW3OC5U1rvPlxpmLt2t-zOviCem8P4paJmFolfUa9wywwc/exec";
    const data = {
        team: teamName,
        attempts: attempts,
        date: new Date().toISOString()
    };

    try {
        const response = await fetch(scriptUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        console.log("Daten gesendet:", data);
    } catch (error) {
        console.error("Fehler beim Senden:", error);
    }
}
