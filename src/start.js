import { Game } from "../lib/game.js";
import * as Input from "../lib/input.js";


let sceneActive = false;
let layers;
let textures;


function update(deltaTime) {
    if (Input.isActionJustPressed('leftClick')) {
        Game.setState("run");
        sceneActive = false;
    }

}
function draw() {
    layers.main.clearRect(0, 0, Game.width, Game.height);
    layers.main.drawImage(textures.start1, 0, 0);
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

    if (Game.state !== "start") {
        requestAnimationFrame(gameLoop);
        return; 
    }
    if (!sceneActive) {
        layers = Game.layers;
        textures = Game.textures;
        sceneActive = true;

        Game.clearAll();
    }

    Input.updateInput();
    update(deltaTime);
    draw();
    
    Game.render();

    requestAnimationFrame(gameLoop);
}

gameLoop();