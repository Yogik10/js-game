class EventsManager {
    constructor() {
        this.bind = []; // сопоставление клавиш действиям
        this.action = []; // действия
    }

    setup(canvas) {
        this.bind[38] = 'up'; // arrow up
        this.bind[37] = 'left'; // arrow left
        this.bind[40] = 'down'; // arrow down
        this.bind[39] = 'right'; // arrow right
        this.bind[32] = 'fire'; // space

        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('mouseup', this.onMouseUp);

        document.body.addEventListener('keydown', this.onKeyDown);
        document.body.addEventListener('keyup', this.onKeyUp);
    }

    onMouseDown(event) {
        eventsManager.action['fire'] = true;
    }

    onMouseUp(event) {
        eventsManager.action['fire'] = false;
    }

    onKeyDown(event) {
        let action = eventsManager.bind[event.keyCode];
        if (action)
            eventsManager.action[action] = true;
    }

    onKeyUp(event) {
        let action = eventsManager.bind[event.keyCode];
        if (action)
            eventsManager.action[action] = false;
    }
}
