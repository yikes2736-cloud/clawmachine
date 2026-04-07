// 1. Setup Matter.js Aliases
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Body = Matter.Body;

// 2. Create the Physics Engine
const engine = Engine.create();
const world = engine.world;

// 3. Set up the Renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 600,
        height: 800,
        wireframes: false, 
        background: '#fff0f5' 
    }
});

// 4. Create Boundaries & The Gacha Funnel
const leftWall = Bodies.rectangle(-10, 400, 60, 800, { isStatic: true });
const rightWall = Bodies.rectangle(610, 400, 60, 800, { isStatic: true });

// The angled walls that funnel the balls to the center
const leftFunnel = Bodies.rectangle(120, 550, 400, 40, { isStatic: true, angle: Math.PI / 4, render: { fillStyle: '#ffd1dc' } });
const rightFunnel = Bodies.rectangle(480, 550, 400, 40, { isStatic: true, angle: -Math.PI / 4, render: { fillStyle: '#ffd1dc' } });

// The narrow chute at the bottom
const leftChute = Bodies.rectangle(260, 680, 20, 150, { isStatic: true, render: { fillStyle: '#ffd1dc' } });
const rightChute = Bodies.rectangle(340, 680, 20, 150, { isStatic: true, render: { fillStyle: '#ffd1dc' } });

// 5. The "Crank" Mechanism (A trapdoor)
const trapdoor = Bodies.rectangle(300, 740, 100, 20, { isStatic: true, render: { fillStyle: '#ff8da1' } });

// 6. Create the Gacha Balls
const balls = [];
const numberOfBalls = 40;

for (let i = 0; i < numberOfBalls; i++) {
    let randomX = Math.random() * 500 + 50; 
    let randomY = Math.random() * -800 - 50; 
    
    let ball = Bodies.circle(randomX, randomY, 25, {
        restitution: 0.6, 
        friction: 0.005,
        render: { fillStyle: '#ffb6c1' }
    });
    balls.push(ball);
}

// Add everything to the physics world
Composite.add(world, [leftWall, rightWall, leftFunnel, rightFunnel, leftChute, rightChute, trapdoor, ...balls]);

// Run the engine
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// ==========================================
// GAME LOGIC & INTERACTIONS
// ==========================================

// 7. The Gacha "Turn" Logic (FIXED: Now only works when clicking the canvas)
let isDropping = false;

render.canvas.addEventListener('mousedown', () => {
    if (isDropping) return; // Prevent spam-clicking
    isDropping = true;

    // Move the trapdoor out of the way instantly
    Body.setPosition(trapdoor, { x: 1000, y: 740 });

    // Wait 400 milliseconds, then put it back
    setTimeout(() => {
        Body.setPosition(trapdoor, { x: 300, y: 740 });
        isDropping = false;
    }, 400); 
});

// 8. The Explosion Physics
function shuffleBalls() {
    balls.forEach(ball => {
        let forceMagnitude = 0.08 * ball.mass; 
        Matter.Body.applyForce(ball, ball.position, {
            x: (Math.random() - 0.5) * forceMagnitude, 
            y: -forceMagnitude - (Math.random() * forceMagnitude) 
        });
    });
}

// 9. The Quiz Logic (UPDATED: Non-repeating questions)
const questions = [
    {
        question: "Who said: 'Cool, cool, cool, cool, cool. No doubt, no doubt.'?",
        answers: ["jake", "jake peralta", "peralta"]
    },
    {
        question: "Who said: 'It's not lupus. It's never lupus.'?",
        answers: ["house", "gregory house", "dr house"]
    },
    {
        question: "Who said: 'I'm not a psychopath, I'm a high-functioning sociopath.'?",
        answers: ["sherlock", "sherlock holmes", "holmes"]
    },
    {
        question: "Who said: 'Are you the strongest because you're Satoru Gojo, or are you Satoru Gojo because you're the strongest?'?",
        answers: ["geto", "suguru geto", "suguru"]
    }
];

let currentQuestion = {};
let availableQuestions = [...questions]; // Create a copy of the questions to draw from

// Grab HTML elements
const retryBtn = document.getElementById('retryBtn');
const quizModal = document.getElementById('quizModal');
const submitAnswer = document.getElementById('submitAnswer');
const answerInput = document.getElementById('answerInput');
const questionText = document.getElementById('questionText');
const feedbackText = document.getElementById('feedbackText');

// Open Modal and pick a random, non-repeating question
retryBtn.addEventListener('click', () => {
    // If the deck is empty, refill it!
    if (availableQuestions.length === 0) {
        availableQuestions = [...questions];
    }

    // Pick a random index from the remaining questions
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    
    // Set the current question
    currentQuestion = availableQuestions[randomIndex];
    questionText.innerText = currentQuestion.question;
    
    // Remove that question from the available pool so it doesn't repeat this round
    availableQuestions.splice(randomIndex, 1);
    
    // Reset UI
    answerInput.value = '';
    feedbackText.style.display = 'none';
    quizModal.style.display = 'block'; 
});

// Check Answer
submitAnswer.addEventListener('click', () => {
    let userAnswer = answerInput.value.toLowerCase().trim();
    
    // Check if the user's answer is in our list of accepted answers
    if (currentQuestion.answers.includes(userAnswer)) {
        quizModal.style.display = 'none'; // Hide modal
        shuffleBalls(); // TRIGGER EXPLOSION
    } else {
        feedbackText.style.display = 'block'; // Show error message
    }
});
