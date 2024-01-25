import { Game } from "../lib/game.js";
import * as Input from "../lib/input.js";


let sceneActive = false;
let layers;
let textures;


function update(deltaTime) {
    if (Input.isActionJustPressed('leftClick')) {
        Game.setState("start");
        sceneActive = false;
    }

}
function draw() {
    layers.main.clearRect(0, 0, Game.width, Game.height);
    layers.main.drawImage(textures.over1, 0, 0);

    let textWidth = layers.ui.measureText("Score: " + Game.data["score"]).width;
    layers.ui.clearRect(0, 0, Game.width, Game.height);
    layers.ui.strokeText("Score: " + Game.data["score"], Game.width/2 - Math.round(textWidth/2), Game.height/2 + 12);
    layers.ui.fillText("Score: " + Game.data["score"], Game.width/2 - Math.round(textWidth/2), Game.height/2 + 12);
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

    if (Game.state !== "gameover") {
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