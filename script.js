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
// We put this right under the chute to hold the balls in
const trapdoor = Bodies.rectangle(300, 740, 100, 20, { isStatic: true, render: { fillStyle: '#ff8da1' } });

// 6. Create the Gacha Balls
const balls = [];
const numberOfBalls = 40;

for (let i = 0; i < numberOfBalls; i++) {
    let randomX = Math.random() * 500 + 50; 
    let randomY = Math.random() * -800 - 50; 
    
    // We made the balls slightly smaller (25 radius) so they fit down the chute!
    let ball = Bodies.circle(randomX, randomY, 25, {
        restitution: 0.6, 
        friction: 0.005,
        render: { fillStyle: '#ffb6c1' }
    });
    balls.push(ball);
}

// Add everything to the physics world
Composite.add(world, [leftWall, rightWall, leftFunnel, rightFunnel, leftChute, rightChute, trapdoor, ...balls]);

// 7. The Gacha "Turn" Logic
let isDropping = false;

// When someone clicks anywhere on the screen, open the trapdoor!
window.addEventListener('mousedown', () => {
    if (isDropping) return; // Prevent spam-clicking
    isDropping = true;

    // Move the trapdoor out of the way instantly
    Body.setPosition(trapdoor, { x: 1000, y: 740 });

    // Wait 400 milliseconds (just enough for one ball to drop), then put it back
    setTimeout(() => {
        Body.setPosition(trapdoor, { x: 300, y: 740 });
        isDropping = false;
    }, 400); 
});

// Run the engine
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);
