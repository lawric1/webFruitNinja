import { Game } from "../lib/game.js";

// Import image files to be used as textures in game;
let urls = {
    start1: "./src/assets/sprites/start1.png",
    over1: "./src/assets/sprites/over1.png",
    p: "./src/assets/sprites/particle1.png",
    bg1: "./src/assets/sprites/bg1.png",
    fruits: "./src/assets/sprites/fruits1.png",
    heart: "./src/assets/sprites/heart1.png",
};
await Game.preloadAll(urls);


Game.createWindow(160, 90, 4);
Game.addLayer("main", 0);
Game.addLayer("ui", 1);
Game.addLayer("particles", 2);

Game.layers.ui.font = "16px m5x7";
Game.layers.ui.letterSpacing = "1px";
Game.layers.ui.lineWidth = 2;
Game.layers.ui.strokeStyle = "black";
Game.layers.ui.fillStyle = "#959595";


Game.setState("start");

export const particleTrailConfig = {
    shape: "circle",
    shapeSize: 3,
    color: "#ccc",

    texture: Game.textures.p,
    maxFrames: 1,
    frameWidth: 16,
    frameHeight: 16,
    
    direction: { x: 0, y: 0 },
    velocity: 0,
    gravity: 0,
    spread: 45,
    
    scale: 1,
    minScale: 0.5,
    maxScale: 1,
    randomScale: false,
    scaleVelocity: -60,

    angle: 0,
    angularVelocity: 0,
    randomAngle: false,
    
    lifetime: 0.2,

    emissionShape: { x: 1, y: 1 },
    oneshot: false,
    explosive: false,
    maxParticles: 30,
}

export const particleExplosionConfig = {
    shape: "circle",
    shapeSize: 2,
    color: "#959595",

    texture: Game.textures.p,
    maxFrames: 1,
    frameWidth: 16,
    frameHeight: 16,
    
    direction: { x: 0, y: -1 },
    velocity: 20,
    gravity: 0,
    spread: 360,
    
    scale: 1,
    minScale: 0.5,
    maxScale: 1,
    randomScale: false,
    scaleVelocity: 4,

    angle: 0,
    angularVelocity: 0,
    randomAngle: false,
    
    lifetime: 1,

    emissionShape: { x: 1, y: 1 },
    oneshot: false,
    explosive: false,
    maxParticles: 20,
}