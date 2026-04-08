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
    '11.JPG', 
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
    '22.JPG', 
    '23.jpg', 
    '24.jpg', 
    '25.jpg', 
    '26.jpg', 
    '27.JPG', 
    '28.jpg', 
    '29.jpg', 
    '30.jpg', 
    '31.jpg', 
    '32.JPG'
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
    { question: "who said: 'when you talk to her you can tell, as vrinda gets older, she'll turn into a bugatti'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha"], correct: "megan" },
    { question: "who said: 'i’ll never forget that you took this from me. it’s inexcusable. and when there is smt of yours i will not hesitate. keep one eye open as you sleep'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "vrinda" },
    { question: "who said: 'it's like talking to one of those tennis ball machines'? in regards to another person speaking", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "anagha" },
    { question: "who said: 'actually im holding you at gunpoint to elaborate rn'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "rt" },
    { question: "who said: 'you're a dirty little snitch you are!'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "aarushi" },
    { question: "who said: 'actually i will respond with a diss track'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "sai" },
    { question: "who said: 'don't live in your dreams, be practical'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "charvi" }
    { question: "who said: 'you have two tries left if you fail the third one we're kicking you out of the group'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "anagha" }
    { question: "who said: 'WE ARE SUCCESSFULLY BECOMING A HIVE MIND'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "rt" }
    { question: "who said: 'You're telling me, I'll never get to see that chocolate part of you'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "aarushi" }
    { question: "who said: 'guys I'm intitating the 51st ACT to remove a Pookie Wookie'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "megan" }
    { question: "who said: 'girlie did you come out of the pussy with full consciousness or what'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "charvi" }
    { question: "who said: 'fix your medulla oblongata '?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "sai" }
    { question: "who said: 'lesbians around the world murdering you for this statement'?", options: ["megan", "sai", "charvi", "rt", "aarushi", "anagha", "vrinda"], correct: "rt" }
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
