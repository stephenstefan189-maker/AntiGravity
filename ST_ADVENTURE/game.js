const bibleCharacters = [
    {
        name: "Noah",
        emoji: "🚢",
        clues: [
            "I built a very big boat.",
            "I saved two of every animal.",
            "I saw a rainbow in the sky."
        ],
        options: ["Noah", "Moses", "David", "Jonah"]
    },
    {
        name: "David",
        emoji: "🎯",
        clues: [
            "I was a young shepherd boy.",
            "I defeated the giant Goliath.",
            "I used a small stone and a sling."
        ],
        options: ["Joseph", "Samuel", "David", "Solomon"]
    },
    {
        name: "Daniel",
        emoji: "🦁",
        clues: [
            "I was put in a den with lions.",
            "The lions did not hurt me.",
            "I prayed to God every day."
        ],
        options: ["Daniel", "Paul", "Peter", "Elijah"]
    },
    {
        name: "Moses",
        emoji: "🌊",
        clues: [
            "I led God's people to freedom.",
            "God helped me part the Red Sea.",
            "Baby Moses was in a basket."
        ],
        options: ["Abraham", "Moses", "Joshua", "Aaron"]
    },
    {
        name: "Jonah",
        emoji: "🐳",
        clues: [
            "I was swallowed by a big fish.",
            "I stayed in its belly for 3 days.",
            "I prayed and the fish let me out."
        ],
        options: ["Jonah", "Simon", "Noah", "Elisha"]
    },
    {
        name: "Esther",
        emoji: "👑",
        clues: [
            "I was a very brave Queen.",
            "I helped save all my people.",
            "God made me Queen for a reason."
        ],
        options: ["Ruth", "Mary", "Esther", "Sarah"]
    },
    {
        name: "Joseph",
        emoji: "🧥",
        clues: [
            "I had a coat of many colors.",
            "My brothers were mean to me.",
            "I became a leader in Egypt."
        ],
        options: ["Jacob", "Joseph", "Isaac", "Benjamin"]
    },
    {
        name: "Samson",
        emoji: "💪",
        clues: [
            "I was the strongest man.",
            "My hair was long and strong.",
            "God gave me my super power."
        ],
        options: ["Gideon", "Samson", "Silas", "Caleb"]
    },
    {
        name: "Mary",
        emoji: "🤱",
        clues: [
            "I am the mother of Jesus.",
            "An angel visited me.",
            "I rode a donkey to Bethlehem."
        ],
        options: ["Mary", "Elizabeth", "Martha", "Lydia"]
    },
    {
        name: "Peter",
        emoji: "🎣",
        clues: [
            "I was a fisherman.",
            "I tried to walk on water.",
            "I was a best friend of Jesus."
        ],
        options: ["Peter", "Andrew", "James", "John"]
    }
];

class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTone(freq, type, duration) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    correct() {
        this.init();
        this.playTone(523.25, 'sine', 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.15), 100); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.3), 200); // G5
    }

    wrong() {
        this.init();
        this.playTone(220, 'triangle', 0.2); // A3
        setTimeout(() => this.playTone(196, 'triangle', 0.4), 200); // G3
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

class BibleHeroGame {
    constructor() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.questions = this.shuffleArray([...bibleCharacters]);
        this.sounds = new SoundManager();

        // Dom Elements
        this.startScreen = document.getElementById('start-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.winScreen = document.getElementById('win-screen');
        this.clueList = document.getElementById('clue-list');
        this.optionsContainer = document.getElementById('options');
        this.feedbackEl = document.getElementById('feedback');
        this.scoreEl = document.getElementById('score');
        this.progressEl = document.getElementById('progress');
        this.soundBtn = null;

        this.init();
    }

    init() {
        document.getElementById('btn-start').addEventListener('click', () => {
            this.sounds.init();
            this.startGame();
        });
        document.getElementById('btn-restart').addEventListener('click', () => location.reload());

        const header = document.querySelector('.header-content');
        this.soundBtn = document.createElement('button');
        this.soundBtn.id = 'btn-sound';
        this.soundBtn.textContent = "🔊";
        this.soundBtn.style.background = "none";
        this.soundBtn.style.border = "none";
        this.soundBtn.style.fontSize = "1.5rem";
        this.soundBtn.style.cursor = "pointer";
        header.insertBefore(this.soundBtn, header.querySelector('.score-board'));

        this.soundBtn.addEventListener('click', () => {
            const isEnabled = this.sounds.toggle();
            this.soundBtn.textContent = isEnabled ? "🔊" : "🔇";
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startGame() {
        this.startScreen.classList.add('hidden');
        this.quizScreen.classList.remove('hidden');
        this.showQuestion();
    }

    showQuestion() {
        this.feedbackEl.textContent = "";
        this.optionsContainer.innerHTML = "";
        this.clueList.innerHTML = "";

        const currentData = this.questions[this.currentQuestionIndex];
        this.progressEl.textContent = `Hero ${this.currentQuestionIndex + 1}/${this.questions.length}`;

        // Display Clues one by one
        currentData.clues.forEach((clue, index) => {
            const li = document.createElement('li');
            li.textContent = clue;
            li.style.opacity = "0";
            li.style.transform = "translateX(-20px)";
            li.style.transition = "all 0.5s ease " + (index * 0.8) + "s";
            this.clueList.appendChild(li);

            setTimeout(() => {
                li.style.opacity = "1";
                li.style.transform = "translateX(0)";
            }, 100);
        });

        // Create Option Buttons
        currentData.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.checkAnswer(option, btn));
            this.optionsContainer.appendChild(btn);
        });
    }

    checkAnswer(selected, button) {
        const currentData = this.questions[this.currentQuestionIndex];
        const correctAnswer = currentData.name;
        const allButtons = document.querySelectorAll('.option-btn');

        allButtons.forEach(btn => btn.disabled = true);

        if (selected === correctAnswer) {
            button.classList.add('correct');
            this.feedbackEl.textContent = `${currentData.emoji} Correct! It's ${correctAnswer}! 🌟`;
            this.feedbackEl.style.color = "var(--secondary)";
            this.score += 10;
            this.updateScore();
            this.sounds.correct();
        } else {
            button.classList.add('wrong');
            this.feedbackEl.textContent = `Oops! That's ${correctAnswer}! ${currentData.emoji}`;
            this.feedbackEl.style.color = "var(--accent)";
            this.sounds.wrong();

            allButtons.forEach(btn => {
                if (btn.textContent === correctAnswer) btn.classList.add('correct');
            });
        }

        setTimeout(() => {
            this.nextQuestion();
        }, 2200);
    }

    updateScore() {
        this.scoreEl.textContent = this.score;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.showQuestion();
        } else {
            this.endGame();
        }
    }

    endGame() {
        this.quizScreen.classList.add('hidden');
        this.winScreen.classList.remove('hidden');
        document.getElementById('final-score-display').innerHTML = `
            <h3>Final Score: ${this.score} Stars!</h3>
            <p>You found ${this.score / 10} out of ${this.questions.length} Bible Heroes!</p>
        `;
    }
}

// Start Game Object
window.onload = () => {
    new BibleHeroGame();
};
