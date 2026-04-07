// 1. Setup Matter.js Aliases (makes the code cleaner to read)
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

// 2. Create the Physics Engine and World
const engine = Engine.create();
const world = engine.world;

// 3. Set up the Renderer (This draws the physics world onto the screen)
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 600,
        height: 800,
        wireframes: false, // MUST be false to see colors instead of wire outlines
        background: '#fff0f5' // Lavender blush background inside the machine
    }
});

// 4. Create Boundaries (The floor and walls of the machine)
// Bodies.rectangle(x, y, width, height)
const floor = Bodies.rectangle(300, 810, 600, 60, { isStatic: true }); // isStatic means it won't fall
const leftWall = Bodies.rectangle(-10, 400, 60, 800, { isStatic: true });
const rightWall = Bodies.rectangle(610, 400, 60, 800, { isStatic: true });

// 5. Create the "Prizes" (The Balls)
const balls = [];
const numberOfBalls = 40;

for (let i = 0; i < numberOfBalls; i++) {
    // Drop them from random widths and heights so they scatter naturally
    let randomX = Math.random() * 500 + 50; 
    let randomY = Math.random() * -800 - 50; 
    
    let ball = Bodies.circle(randomX, randomY, 30, {
        restitution: 0.6, // Bounciness! (0 is solid lead, 1 is super bouncy)
        friction: 0.005,
        render: {
            fillStyle: '#ffb6c1' // Light pink placeholders. We will map your friends' photos here later!
        }
    });
    balls.push(ball);
}

// 6. Add everything to the physics world
Composite.add(world, [floor, leftWall, rightWall, ...balls]);

// 7. Run the engine and renderer
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);
