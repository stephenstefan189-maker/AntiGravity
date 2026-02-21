class NegotiationGame {
    constructor() {
        this.budget = 10000;
        this.currentPrice = 8500;
        this.minPrice = 6000; // Vax won't go below this
        this.trust = 50;
        this.turn = 1;
        this.gameOver = false;
        this.selectedTone = 'fair';
        this.lastOffer = 0;

        // ROM (Range of Mutability) factors
        this.moods = {
            angry: { text: "Angry", color: "#ff3e3e" },
            annoyed: { text: "Annoyed", color: "#ffb83e" },
            neutral: { text: "Neutral", color: "#8888aa" },
            interested: { text: "Interested", color: "#00f2ff" },
            friendly: { text: "Great", color: "#3eff8b" }
        };

        this.initEventListeners();
        this.updateUI();
    }

    initEventListeners() {
        // Offer Slider
        const slider = document.getElementById('offer-slider');
        const sliderVal = document.getElementById('slider-value');
        slider.addEventListener('input', (e) => {
            sliderVal.textContent = Number(e.target.value).toLocaleString();
        });

        // Tone Buttons
        const toneBtns = document.querySelectorAll('.tone-btn');
        toneBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toneBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTone = btn.dataset.tone;
            });
        });

        // Action Buttons
        document.getElementById('btn-negotiate').addEventListener('click', () => this.handleNegotiation());
        document.getElementById('btn-accept').addEventListener('click', () => this.handleAccept());
        document.getElementById('btn-walk').addEventListener('click', () => this.handleWalkAway());
        document.getElementById('btn-restart').addEventListener('click', () => location.reload());
    }

    handleNegotiation() {
        if (this.gameOver) return;

        const offer = parseInt(document.getElementById('offer-slider').value);
        this.lastOffer = offer;

        this.addLogEntry(`You made an offer of ${offer.toLocaleString()} credits with a ${this.selectedTone} tone.`, 'player');

        // Logic for Vax's reaction
        let trustChange = 0;
        let response = "";
        let moodClass = "neutral";

        // 1. Evaluate Tone Impact
        if (this.selectedTone === 'polite') {
            trustChange += 5;
        } else if (this.selectedTone === 'firm') {
            trustChange -= 5;
        }

        // 2. Evaluate Offer Impact
        const offerRatio = offer / this.currentPrice;

        if (offerRatio < 0.5) {
            // Lowballing
            trustChange -= 20;
            response = "Are you mocking me? This is an insult.";
            moodClass = "angry";
        } else if (offerRatio < 0.8) {
            // Aggressive bargaining
            trustChange -= 10;
            response = "That's far too low. I know the value of what I hold.";
            moodClass = "annoyed";
        } else if (offerRatio > 1.2) {
            // Overpaying (rare but possible if user slides high)
            trustChange += 15;
            response = "A generous offer! I like your style.";
            moodClass = "happy";
            this.currentPrice = offer; // Why not?
        } else {
            // Respectable negotiation
            trustChange += 5;
            response = "We're talking now. But I need more than that.";
            moodClass = "interested";
        }

        // Update Trust
        this.trust = Math.max(0, Math.min(100, this.trust + trustChange));

        // Adjust Price based on Trust and Turn
        // Vax drops price slower if he's angry
        const discountFactor = (this.trust / 150) * 0.1; 
        const reduction = (this.currentPrice - this.minPrice) * discountFactor;
        this.currentPrice = Math.max(this.minPrice, Math.round(this.currentPrice - reduction));

        // Randomizing response a bit
        if (this.trust < 20) {
            response = "I'm losing my patience. One more move like that and the deal is off.";
            moodClass = "angry";
        }

        if (this.trust <= 0) {
            this.endGame("Deal Collapsed", "Vax was so insulted he walked away. You left empty-handed.");
            return;
        }

        this.addLogEntry(`Vax says: "${response}"`, 'vax');
        this.updateMerchant(response, moodClass);
        this.updateUI();
        this.turn++;
    }

    handleAccept() {
        if (this.gameOver) return;
        this.endGame("Deal Successful", `You acquired the Void Heart for ${this.currentPrice.toLocaleString()} credits. Remaining budget: ${(this.budget - this.currentPrice).toLocaleString()} credits.`);
    }

    handleWalkAway() {
        if (this.gameOver) return;
        this.endGame("Withdrawn", "You decided to walk away. The Void Heart remains in Vax's hands.");
    }

    updateMerchant(speech, moodClass) {
        const speechEl = document.getElementById('vax-speech');
        const avatarEl = document.getElementById('vax-avatar');
        const moodEl = document.getElementById('vax-mood');

        speechEl.textContent = `"${speech}"`;
        
        avatarEl.className = 'vax-avatar';
        if (moodClass !== 'neutral') avatarEl.classList.add(moodClass);
        
        const moodInfo = this.moods[moodClass] || this.moods.neutral;
        moodEl.textContent = moodInfo.text;
        moodEl.style.color = moodInfo.color;
    }

    updateUI() {
        document.getElementById('player-budget').textContent = this.budget.toLocaleString();
        document.getElementById('trust-fill').style.width = `${this.trust}%`;
        
        // Update slider max based on budget
        const slider = document.getElementById('offer-slider');
        slider.max = this.budget;
    }

    addLogEntry(text, type) {
        const log = document.getElementById('log-content');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = text;
        log.prepend(entry); // Newest at top
    }

    endGame(title, message) {
        this.gameOver = true;
        document.getElementById('end-title').textContent = title;
        document.getElementById('end-message').textContent = message;
        document.getElementById('game-over').classList.remove('hidden');
    }
}

// Start Game
window.onload = () => {
    new NegotiationGame();
};
