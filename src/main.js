import { particleTrailConfig, particleExplosionConfig } from "./init.js";
import { Game } from "../lib/game.js";
import * as Input from "../lib/input.js";
import { AudioStream } from "../lib/audio.js";
import { Vector2, randomFloat, randomInt } from "../lib/math.js";
import { CircleCollisionShape2D, checkCollision } from "../lib/physics.js";
import { Particle, Emitter } from "../lib/particle2.js";
import { Camera } from "../lib/camera.js";
import { choose } from "../lib/utils.js";

let sceneActive = false;
let layers;
let textures;

let sfxCut = [
    new AudioStream("./src/assets/sounds/cut1.wav"),
    new AudioStream("./src/assets/sounds/cut2.wav")
];
let sfxFall = new AudioStream("./src/assets/sounds/fall1.wav");

class Bomb {
    constructor() {
        this.active = false;
        this.texture;
        this.halfSize = 16;
        this.pos = new Vector2();
        this.center = new Vector2();
        this.vel = new Vector2();
        this.dir = new Vector2();
        this.rotDir;
        this.gravity = 80;
        this.collider = new CircleCollisionShape2D(0, 0, 8);
    }

    spawn() {
        if (this.active) { return; }
        
        let speed = randomInt(100, 120);
        this.texture = textures.fruits;
        this.pos.x = randomInt(Game.width/2 - 10, Game.width/2 + 10);
        this.pos.y = Game.height;
        this.center.x = this.pos.x + this.halfSize;
        this.center.y = this.pos.y + this.halfSize;
        this.dir.x = randomFloat(-0.3, 0.3);
        this.dir.y = -1;
        this.vel = this.dir.multiply(speed);
        this.angle = randomInt(-180, 180);
        this.rotDir = choose([-1, 1]);
        this.active = true;
    }
    
    update(deltaTime) {
        if (!this.active) { return; }
        
        this.vel.y += this.gravity * deltaTime;
        this.pos = this.pos.add(this.vel.multiply(deltaTime));
        this.center.x = this.pos.x + this.halfSize;
        this.center.y = this.pos.y + this.halfSize;
        this.angle += this.gravity * this.rotDir * deltaTime;
        this.collider.updatePosition(new Vector2(this.center.x, this.center.y));
        
        // Emit particles and screenshake;
        if (gameOver) {
            camera.startScreenShake(2, 100);
            particleExplosionConfig.color = choose(["#959595","#ccc", "#6c6c6c"]);
            // Divide deltaTime by timescale to remove slowmotion effect;
            explosionEmitter.update(
                deltaTime / timeScale, 
                this.center.x, this.center.y, 
                particleExplosionConfig, particlePool
            );
        }   

        // Out of screen;
        if(this.pos.y > Game.height + 32) {
            this.active = false;
        }

        // Check collision with mouse position:
        if (Input.isActionPressed("leftClick")) {
            if (checkCollision(Game.mousePos, this.collider)) {
                gameOver = true;
                explosionEmitter.start();
                sfxCut[randomInt(0, 1)].play(1);
            }
        }
    }

    draw(ctx) {
        if (!this.active) { return; }

        // Draw rotated sprite;
        ctx.save();
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.drawImage(this.texture, 0, 64, 32, 32, -this.halfSize, -this.halfSize, 32, 32);
        ctx.restore();

        explosionEmitter.draw(ctx);
    }
}

class Slice {
    constructor() {
        this.active = false;
        this.type;
        this.pos = new Vector2();
        this.vel = new Vector2();
        this.rotDir;
        this.gravity = 80;
    }

    spawn(fruitID, pos, vel, rotDir) {
        if (this.active) { return; }

        this.type = getSliceTypeById(fruitID);
        this.pos = pos.clone();
        this.vel = vel.clone();
        this.angle = 0;
        this.angle = randomInt(-180, 180);
        this.rotDir = rotDir;
        this.active = true;
    }
    
    update(deltaTime) {
        if (!this.active) { return; }

        this.vel.y += this.gravity * deltaTime;
        this.pos = this.pos.add(this.vel.multiply(deltaTime));
        this.angle += deltaTime * this.gravity * this.rotDir;

        // Out of screen;
        if(this.pos.y > Game.height + 32) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) { return; }

        ctx.save();
            ctx.translate(this.pos.x + 16, this.pos.y + 16);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.drawImage(this.type.tex, this.type.x, this.type.y, 32, 32, -16, -16, 32, 32);
        ctx.restore();
    }
}

class Fruit {
    constructor() {
        this.id = randomInt(0, 4);
        this.active = false;
        this.type = getFruitTypeById(this.id);
        this.speed = randomInt(150, 190);
        this.pos = new Vector2();
        this.vel = new Vector2();
        this.dir = new Vector2();
        this.angle = 0;
        this.rotDir = -1;
        this.gravity = 80;
        this.collider = new CircleCollisionShape2D(0, 0, this.type.size);
    }

    spawn() {
        if (this.active) { return; }
        
        this.speed = randomInt(100, 120);
        this.pos.x = randomInt(70, Game.width - 70);
        this.pos.y = Game.height;
        this.dir.x = randomFloat(-0.3, 0.3);
        this.dir.y = -1;
        this.vel = this.dir.multiply(this.speed);
        this.angle = randomInt(-180, 180);
        this.rotDir = choose([-1, 1]);
        this.active = true;
    }

    update(deltaTime) {
        if (!this.active) { return; }
        this.vel.y += this.gravity * deltaTime;
        this.pos = this.pos.add(this.vel.multiply(deltaTime));
        this.collider.updatePosition(new Vector2(this.pos.x + 16, this.pos.y + 16));
        this.angle += deltaTime * this.gravity * this.rotDir;

        // Out of screen;
        if(this.pos.y > Game.height + 32) {
            this.active = false;
            health -= 1;

            camera.startScreenShake(2, 100);
            sfxFall.play(1);
        }

        // Check collision with mouse position;
        if (Input.isActionPressed("leftClick")) {
            if (checkCollision(Game.mousePos, this.collider)) {
                this.active = false;
                spawnSlice(this.id, this.pos, new Vector2(50, -40), this.rotDir);
                spawnSlice(this.id, this.pos, new Vector2(-50, 40), this.rotDir);
                
                score += 1;
                camera.startScreenShake(2, 100);
                sfxCut[randomInt(0, 1)].play(1);
            }
        }
    }
    draw(ctx) {
        if (!this.active) { return; }

        ctx.save();
            ctx.translate(this.pos.x + 16, this.pos.y + 16);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.drawImage(this.type.tex, this.type.x, this.type.y, 32, 32, -16, -16, 32, 32);
        ctx.restore();
    }
}


let camera = new Camera();
let score = 0;
let health = 3;
let fruits = [];
let slices = [];
let bombs = [];

let timeScale = 1;
let gameOver = false;

let particlePool = []
let trailEmitter = new Emitter();
let explosionEmitter = new Emitter();

// 0 is bomb, -1 ends sequence, any other number is how many fruits at once
let fireSchedule = {
    0: [1, 1],
    1: [1, 1, 1, 1],
    2: [1, -1, 2],
    3: [2, 2],
    4: [1, 3, -1, 0, 2],
    5: [2, -1, 2, -1],
    6: [3, 3, -1, -1, 2],
    7: [4],
    8: [2, -2, 2],
    9: [4, -1, 2, -1],
    10: [1, 2, 3, -1, 4],
    11: [-1, 2, -1, 3],
    12: [-2, 3, 0, 2, 3],
    13: [4, -2, 4, -1, 2],
    14: [3, -1, -1, 1],
    15: [1, -1, 2, -2],
    16: [3, -1, 2, -1],
    17: [1, 2, 3],
    18: [4, -1, -2, 1],
    19: [2, -2, 3, -3],
    20: [-3, -2, 1]
}
let currentSequence = 0;
let maxSequences = 13;
let currentSequenceIndex = 0;
let scheduleSpawnTimer = 0;
let scheduleSpawnInterval = 0.5;
let scheduleCooldownTimer = 0;
let scheduleCooldownInteval = 2.5;
let canSpawn = true;

let screenTransitionTimer = 0;
let screenTransitionInterval = 3;


function init() {
    // Reset game state;
    score = 0;
    health = 3;
    fruits = [];
    slices = [];
    bombs = [];
    timeScale = 1;
    gameOver = false;

    currentSequence = 0;
    currentSequenceIndex = 0;
    scheduleSpawnTimer = 0;
    scheduleCooldownTimer = 0;
    canSpawn = true;
    screenTransitionTimer = 0;


    // Fill objects pools so they can be reused;
    for (let i = 0; i < 20; i++) {
        slices.push(new Slice());    
    }
    for (let i = 0; i < 20; i++) {
        fruits.push(new Fruit());    
    }
    for (let i = 0; i < 4; i++) {
        bombs.push(new Bomb());
    }
    for (let i = 0; i < 80; i++) {
        particlePool.push(new Particle());    
    }

    // Disable any leftover particles when game is restarted;
    trailEmitter.clear();
    explosionEmitter.clear();
}

function spawnSlice(fruitID, pos, vel, rotDir) {
    for (const slice of slices) {
        if (!slice.active) {
            slice.spawn(fruitID, pos, vel, rotDir)
            return;
        }
    }
}

function spawnFruit() {
    for (const fruit of fruits) {
        if (!fruit.active) {
            fruit.spawn();
            return;
        }
    }
}

function spawnBomb() {
    for (const bomb of bombs) {
        if (!bomb.active) {
            bomb.spawn();
            return;
        }
    }
}

function getFruitTypeById(fruitID) {
    switch (fruitID) {
        case 0: return {"tex": textures.fruits, "x": 0, "y": 0, "size": 12 / 2};
        case 1: return {"tex": textures.fruits, "x": 32, "y": 0, "size": 24 / 2};
        case 2: return {"tex": textures.fruits, "x": 64, "y": 0, "size": 14 / 2};
        case 3: return {"tex": textures.fruits, "x": 96, "y": 0, "size": 16 / 2};
        case 4: return {"tex": textures.fruits, "x": 128, "y": 0, "size": 16 / 2};
        default:
            break;
    }
}

function getSliceTypeById(fruitID) {
    switch (fruitID) {
        case 0: return {"tex": textures.fruits, "x": 0, "y": 32, "size": 12 / 2};
        case 1: return {"tex": textures.fruits, "x": 32, "y": 32, "size": 24 / 2};
        case 2: return {"tex": textures.fruits, "x": 64, "y": 32, "size": 14 / 2};
        case 3: return {"tex": textures.fruits, "x": 96, "y": 32, "size": 16 / 2};
        case 4: return {"tex": textures.fruits, "x": 128, "y": 32, "size": 16 / 2};
        default:
            break;
    }
}

function update(deltaTime) {
    // Time scale will give a slowmotion effect;
    let dt = deltaTime * timeScale;
    
    // When gameOver is true, start timer for scene transition to game over screen;
    if (health <= 0) {
        gameOver = true;
    }
    if (gameOver) {
        timeScale = 0.1;
        screenTransitionTimer += deltaTime;
    
        if (screenTransitionTimer > screenTransitionInterval) {
            Game.setState("gameover");
            sceneActive = false;

            Game.data["score"] = score;
        }
    }

    // Handle mouse input for trail effect;
    if (Input.isActionPressed("leftClick")) {
        trailEmitter.start();
    } 
    if (Input.isActionReleased("leftClick")) {
        trailEmitter.stop()
    }

    trailEmitter.update(deltaTime, Game.mousePos.x, Game.mousePos.y, particleTrailConfig, particlePool);
    for (const slice of slices) { slice.update(dt); }
    for (const fruit of fruits) { fruit.update(dt); }
    for (const bomb of bombs) { bomb.update(dt); }
    

    if (gameOver) {
        return;
    }
    
    if (!canSpawn) {
        scheduleCooldownTimer += deltaTime;
        
        if (scheduleCooldownTimer > scheduleCooldownInteval) {
            
            scheduleCooldownTimer = 0;
            canSpawn = true;
        }
        return;
    }

    
    scheduleSpawnTimer += deltaTime;
    if ((scheduleSpawnTimer > scheduleSpawnInterval) && canSpawn) {
        scheduleSpawnTimer = 0;
        
        if (currentSequence >= maxSequences) {
            gameOver = true;
            return;
        }

        let sequence = fireSchedule[currentSequence];
        switch (sequence[currentSequenceIndex]) {
            case -1:
                spawnBomb();
                break;
            case -2:
                spawnBomb();
                spawnBomb();
                break;
            case -3:
                spawnBomb();
                spawnBomb();
                spawnBomb();
                break;
            default:
                let i = sequence[currentSequenceIndex];
                while (i--) {
                    spawnFruit()
                }
                break;
        }

        currentSequenceIndex += 1;
        if (currentSequenceIndex >= sequence.length) {
            canSpawn = false;
            currentSequence += 1;
            currentSequenceIndex = 0;
        }
    }

}

function drawScore() {
    layers.ui.clearRect(0, 0, Game.width, Game.height);
    layers.ui.strokeText(score, 16, 13);
    layers.ui.fillText(score, 16, 13);
}

function draw() {
    layers.main.clearRect(0, 0, Game.width, Game.height);
    layers.main.drawImage(textures.bg1, 0, 0);

    trailEmitter.draw(layers.main);

    for (const slice of slices) {
        slice.draw(layers.main);
    }
    for (const fruit of fruits) {
        fruit.draw(layers.main);
    }
    for (const bomb of bombs) {
        bomb.draw(layers.main);
    }

  
    drawScore();

    // Draw health
    let i = 0;
    while (i < health) {
        layers.ui.drawImage(textures.heart, 130 + i * 10 + ((3 - health) * 10), 4);
        i++;
    }

    camera.updateScreenShake(layers.main);
}


//
// Game loop
//
let prevTime = performance.now();
function gameLoop() {
    let currentTime = performance.now();
    let deltaTime = (currentTime - prevTime) / 1000;
    prevTime = currentTime;

    if (deltaTime >= 0.03) { deltaTime = 0.03 }

    if (Game.state !== "run") {
        requestAnimationFrame(gameLoop);
        return; 
    }

    if (!sceneActive) {
        layers = Game.layers;
        textures = Game.textures;
        sceneActive = true;

        Game.clearAll();
        init();
    }

    Input.updateInput();
    update(deltaTime);
    draw();

    Game.render();

    requestAnimationFrame(gameLoop);
}

gameLoop();
