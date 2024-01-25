export class AudioStream {
    constructor(audioFilePath) {
        this.audio = new Audio(audioFilePath);
        this.audio.preload = 'auto';
        this.audio.load();
    }
    
    play(volume = 1) {
        this.audio.volume = volume;
        this.audio.currentTime = 0;
        this.audio.play();
    }
}