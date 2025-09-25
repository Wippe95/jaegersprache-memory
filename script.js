// Memory-Karten-Daten (Beispiel)
const cardsData = [
    { term: "Brunftkugeln", definition: "Hoden des Schalenwildes" },
    { term: "Kessel", definition: "Wohnhöhle z.B. im Fuchsbau" },
    { term: "Pirsch", definition: "Lautloses Anschleichen" },
    { term: "Pennen", definition: "Federn beim Falken" },
    { term: "zerwirken", definition: "Zerlegen des Wildkörpers in küchenfertige Teile" },
    { term: "Schweiß", definition: "Blut von Wild & Hund, sobald es aus Körper austritt" },
    { term: "Überläufer", definition: "Wildschwein im 2. Lebensjahr" },
    { term: "ein Stück Schwarzwild", definition: "ein Wildschwein" },
    { term: "Luder", definition: "Aas, mit dem Jäger Raubtiere anlocken" },
    { term: "Rammelzeit", definition: "Paarungszeit von Kaninchen und Hasen" },
    { term: "Schmalspießer", definition: "männliches Reh im 2. Lebensjahr" },
    { term: "Kirrung", definition: "Futterstelle zur Wildbeobachtung" },
    { term: "Grimbart", definition: "Alter Name für Dachs" },
    { term: "Jagdkanzel", definition: "Hochsitz" },
    { term: "Packer", definition: "Hund, der zum Packen von Wildschweinen geeignet ist" },
    { term: "Schalen", definition: "Klauen von Paarhufern" },
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

// Memory-Karten erstellen
function createCards() {
    memory.innerHTML = "";
    cards = [...cardsData, ...cardsData]
        .sort(() => 0.5 - Math.random())
        .map((card, index) => ({
            ...card,
            id: index,
            flipped: false,
            matched: false
        }));

    cards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.className = "card";
        cardElement.dataset.id = card.id;
        cardElement.addEventListener("click", flipCard);
        memory.appendChild(cardElement);
    });
}

// Karte umdrehen
function flipCard() {
    if (!gameStarted || this.classList.contains("flipped") || flippedCards.length >= 2) return;

    const cardId = parseInt(this.dataset.id);
    const card = cards.find(card => card.id === cardId);

    this.textContent = card.term;
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
    if (first.card.term === second.card.term) {
        first.card.matched = true;
        second.card.matched = true;
        flippedCards = [];
        if (cards.every(card => card.matched)) {
            setTimeout(() => {
                alert(`Glückwunsch, ${teamName}! Du hast gewonnen!`);
                sendToGoogleSheet();
            }, 500);
        }
    } else {
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
