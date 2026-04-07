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

const leftFunnel = Bodies.rectangle(120, 550, 400, 40, { isStatic: true, angle: Math.PI / 4, render: { fillStyle: '#ffd1dc' } });
const rightFunnel = Bodies.rectangle(480, 550, 400, 40, { isStatic: true, angle: -Math.PI / 4, render: { fillStyle: '#ffd1dc' } });

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

Composite.add(world, [leftWall, rightWall, leftFunnel, rightFunnel, leftChute, rightChute, trapdoor, ...balls]);

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// ==========================================
// GAME LOGIC & INTERACTIONS
// ==========================================

// 7. The Gacha "Turn" Logic 
let isDropping = false;

render.canvas.addEventListener('mousedown', () => {
    if (isDropping) return; 
    isDropping = true;

    Body.setPosition(trapdoor, { x: 1000, y: 740 });

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

// 9. The Quiz Logic (UPDATED: Multiple Choice)
// When adding your own questions, just follow this exact structure!
const questions = [
    {
        question: "Who said: 'Cool, cool, cool, cool, cool. No doubt, no doubt.'?",
        options: ["Jake Peralta", "Amy Santiago", "Captain Holt", "Terry Jeffords"],
        correct: "Jake Peralta"
    },
    {
        question: "Who said: 'It's not lupus. It's never lupus.'?",
        options: ["Dr. Foreman", "Dr. Wilson", "Gregory House", "Dr. Cameron"],
        correct: "Gregory House"
    },
    {
        question: "Who said: 'I'm not a psychopath, I'm a high-functioning sociopath.'?",
        options: ["John Watson", "Jim Moriarty", "Sherlock Holmes", "Mycroft Holmes"],
        correct: "Sherlock Holmes"
    },
    {
        question: "Who said: 'Are you the strongest because you're Satoru Gojo, or are you Satoru Gojo because you're the strongest?'?",
        options: ["Yuji Itadori", "Suguru Geto", "Kento Nanami", "Megumi Fushiguro"],
        correct: "Suguru Geto"
    }
];

let currentQuestion = {};
let availableQuestions = [...questions]; 

const retryBtn = document.getElementById('retryBtn');
const quizModal = document.getElementById('quizModal');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackText = document.getElementById('feedbackText');

// Open Modal and set up the multiple choice buttons
retryBtn.addEventListener('click', () => {
    if (availableQuestions.length === 0) {
        availableQuestions = [...questions];
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[randomIndex];
    questionText.innerText = currentQuestion.question;
    availableQuestions.splice(randomIndex, 1);
    
    // Clear out the old buttons and hide the error message
    optionsContainer.innerHTML = '';
    feedbackText.style.display = 'none';

    // Create a new button for every option in the array
    currentQuestion.options.forEach(optionText => {
        const btn = document.createElement('button');
        btn.innerText = optionText;
        btn.classList.add('option-btn'); // Applies the CSS we wrote in HTML

        // What happens when they click an option
        btn.addEventListener('click', () => {
            if (optionText === currentQuestion.correct) {
                quizModal.style.display = 'none'; // Hide modal
                shuffleBalls(); // BOOM!
            } else {
                feedbackText.style.display = 'block'; // Show error text
                btn.classList.add('wrong'); // Turns the clicked button red
            }
        });

        optionsContainer.appendChild(btn); // Add the button to the screen
    });

    quizModal.style.display = 'block'; 
});
