// 1. Setup Matter.js Aliases
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Body = Matter.Body,
      Events = Matter.Events; // NEW: We need Events to detect collisions!

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

// NEW: The Invisible Prize Sensor (Catches the ball when it falls)
const prizeSensor = Bodies.rectangle(300, 850, 200, 20, { 
    isStatic: true, 
    isSensor: true, // This means balls pass through it, but it triggers an event
    render: { visible: false } 
});

// 6. Create the Gacha Balls (Back to solid pink!)
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

Composite.add(world, [leftWall, rightWall, leftFunnel, rightFunnel, leftChute, rightChute, trapdoor, prizeSensor, ...balls]);

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// ==========================================
// GAME LOGIC & INTERACTIONS
// ==========================================

// --- NEW: THE PHOTO REVEAL LOGIC ---
const myPhotos = [
   '1.jpg', 
    '2.jpg', 
    '3.jpg', 
    '4.jpg', 
    '5.jpg', 
    '6.jpg', 
    '7.jpg', 
    '8.jpg', 
    '9.jpg', 
    '10.jpg', 
    '11.jpg', 
    '12.jpg', 
    '13.jpg', 
    '14.jpg', 
    '15.jpg', 
    '16.jpg', 
    '17.jpg', 
    '18.jpg', 
    '19.jpg', 
    '20.jpg', 
    '21.jpg', 
    '22.jpg', 
    '23.jpg', 
    '24.jpg', 
    '25.jpg', 
    '26.jpg', 
    '27.jpg' 
];

const rewardModal = document.getElementById('rewardModal');
const rewardImage = document.getElementById('rewardImage');
const closeRewardBtn = document.getElementById('closeReward');

// Listen for a collision between a ball and the invisible sensor
Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;
    
    for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA;
        const bodyB = pairs[i].bodyB;

        // Check if one of the colliding bodies is our prize sensor
        if (bodyA === prizeSensor || bodyB === prizeSensor) {
            
            // Figure out which body is the ball
            const droppedBall = bodyA === prizeSensor ? bodyB : bodyA;
            
            // Delete the ball so they don't pile up off-screen
            Composite.remove(world, droppedBall);
            
            // Pick a random photo and show the popup!
            const randomPhoto = myPhotos[Math.floor(Math.random() * myPhotos.length)];
            rewardImage.src = randomPhoto;
            rewardModal.style.display = 'block';
        }
    }
});

// Close the reward popup when they click the button
closeRewardBtn.addEventListener('click', () => {
    rewardModal.style.display = 'none';
});


// --- THE TRAPDOOR LOGIC ---
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


// --- THE QUIZ LOGIC ---
function shuffleBalls() {
    // Re-select the balls currently in the world (since some may have been deleted)
    const currentBalls = Composite.allBodies(world).filter(b => b.circleRadius === 25);
    
    currentBalls.forEach(ball => {
        let forceMagnitude = 0.08 * ball.mass; 
        Matter.Body.applyForce(ball, ball.position, {
            x: (Math.random() - 0.5) * forceMagnitude, 
            y: -forceMagnitude - (Math.random() * forceMagnitude) 
        });
    });
}

const questions = [
    { question: "Who said: 'Cool, cool, cool, cool, cool. No doubt, no doubt.'?", options: ["Jake Peralta", "Amy Santiago", "Captain Holt", "Terry Jeffords"], correct: "Jake Peralta" },
    { question: "Who said: 'It's not lupus. It's never lupus.'?", options: ["Dr. Foreman", "Dr. Wilson", "Gregory House", "Dr. Cameron"], correct: "Gregory House" },
    { question: "Who said: 'I'm not a psychopath, I'm a high-functioning sociopath.'?", options: ["John Watson", "Jim Moriarty", "Sherlock Holmes", "Mycroft Holmes"], correct: "Sherlock Holmes" },
    { question: "Who said: 'Are you the strongest because you're Satoru Gojo, or are you Satoru Gojo because you're the strongest?'?", options: ["Yuji Itadori", "Suguru Geto", "Kento Nanami", "Megumi Fushiguro"], correct: "Suguru Geto" }
];

let currentQuestion = {};
let availableQuestions = [...questions]; 

const retryBtn = document.getElementById('retryBtn');
const quizModal = document.getElementById('quizModal');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackText = document.getElementById('feedbackText');

retryBtn.addEventListener('click', () => {
    if (availableQuestions.length === 0) availableQuestions = [...questions];

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[randomIndex];
    questionText.innerText = currentQuestion.question;
    availableQuestions.splice(randomIndex, 1);
    
    optionsContainer.innerHTML = '';
    feedbackText.style.display = 'none';

    currentQuestion.options.forEach(optionText => {
        const btn = document.createElement('button');
        btn.innerText = optionText;
        btn.classList.add('option-btn'); 

        btn.addEventListener('click', () => {
            if (optionText === currentQuestion.correct) {
                quizModal.style.display = 'none'; 
                shuffleBalls(); 
            } else {
                feedbackText.style.display = 'block'; 
                btn.classList.add('wrong'); 
            }
        });
        optionsContainer.appendChild(btn); 
    });
    quizModal.style.display = 'block'; 
});
