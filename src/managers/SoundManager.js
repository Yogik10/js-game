class SoundManager {
    constructor() {
        this.clips = {}; // звуковые эффекты
        this.context = null; // аудиоконтекст
        this.gainNode = null; // главный узел
        this.loaded = false; // все звуки загружены
        this.isMuted = false;
    }

    init() { // инициализация менеджера звука
        this.context = new AudioContext();
        this.gainNode = this.context.createGain ? this.context.createGain() : this.context.createGainNode();
        this.gainNode.connect(this.context.destination); // подключение к динамикам
    }

    load(path, callback) {
        if (this.clips[path]) {
            callback(this.clips[path]);
            return;
        }

        let clip = {path: path, buffer: null, loaded: false};
        clip.play = (volume, loop) => {
            soundManager.play(clip.path, {looping: loop ?  loop : false, volume: volume ? volume : 1});
        };

        this.clips[path] = clip;
        let request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            soundManager.context.decodeAudioData(request.response, (buffer) => {
                clip.buffer = buffer;
                clip.loaded = true;
                callback(clip);
            });
        };
        request.send();
    }

    loadArray(array) { // загрузить массив звуков
        for (let i = 0; i < array.length; i++) {
            soundManager.load(array[i], () => {
                if (array.length === Object.keys(soundManager.clips).length) {
                    for (let sd in soundManager.clips) {
                        if (!soundManager.clips[sd].loaded) return;
                    }
                    soundManager.loaded = true;
                }
            });
        }
    }

    play(path, settings) {
        if (!soundManager.loaded) {
            setTimeout(() => {soundManager.play(path, settings);}, 1000);
            return;
        }

        let looping = false;
        let volume = 1;

        if (settings) {
            if (settings.looping)
                looping = settings.looping;
            if (settings.volume) {
                volume = this.isMuted ? 0 : settings.volume;
            }
        }

        let sd = this.clips[path];
        if (sd === null)
            return false;

        let sound = soundManager.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(soundManager.gainNode);
        sound.loop = looping;
        soundManager.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    }

    toggleMute() {
        if (this.gainNode.gain.value > 0) {
            this.gainNode.gain.value = 0;
            this.isMuted = true;
        } else {
            this.gainNode.gain.value = 0.1;
            this.isMuted = false;
        }
    }
}
