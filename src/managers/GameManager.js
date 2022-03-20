class GameManager{
    constructor() {
        this.factory = {}; // фабрика объектов
        this.entities = []; // объекты на карте
        this.player = null; // указатель на объект игрока
        this.fireNum = 0; // идентификатор выстрела
        this.laterKill = []; // отложенное уничтожение объектов
        this.levelCount = 2; // число уровней игры
        this.curLevel = 1; // текущий уровень игры
    }

    initPlayer(obj) {
        this.player = obj;
    }

    kill(obj){
        if (obj.type === 'FireBall'){
            let exp = new Explosion();
            exp.pos_x = obj.pos_x + obj.move_x * (obj.size_x / 6);
            exp.pos_y = obj.pos_y + obj.move_y * (obj.size_y / 6);
            exp.name = 'explosion';
            exp.type = 'Explosion';
            this.entities.push(exp);
        }
        this.laterKill.push(obj);
    }

    draw(ctx) {
        if (!mapManager.entitiesParsed){
            setTimeout(() => {
                this.draw(ctx);
            }, 100);
        }
        else {
            for (let i = 0; i < this.entities.length; i++) {
                this.entities[i].draw(ctx);
                if (this.entities[i].type === 'Explosion'){
                    this.kill(this.entities[i]);
                }
            }
        }
    }

    update(){
        if (this.player === null)
            return;

        this.player.move_x = 0;
        this.player.move_y = 0;

        if (eventsManager.action['up']) {this.player.move_y = -1; this.player.direction = 'up';}
        if (eventsManager.action['down']) {this.player.move_y = 1; this.player.direction = 'down';}
        if (eventsManager.action['left']) {this.player.move_x = -1; this.player.direction = 'left';}
        if (eventsManager.action['right']) {this.player.move_x = 1; this.player.direction = 'right';}
        if (eventsManager.action['fire']) this.player.fire();

        this.entities.forEach((e) => {
            try{
                e.update();
            }
            catch (ex) {
                console.log(ex);
            }
        });

        for (let i = 0; i < this.laterKill.length; i++) {
            let idx = this.entities.indexOf(this.laterKill[i]);

            if (idx > -1) {
                if (this.entities[idx].type === 'Player') {
                    soundManager.play("./public/sounds/dead.mp3", {looping: false, volume: 0.1});
                    setTimeout(() => { this.end(); }, 1000);
                }

                if (this.entities[idx].type === 'Enemy') {
                    soundManager.play("./public/sounds/great.mp3", {looping: false, volume: 0.1});
                    this.player.score += 100;
                }

                if (this.entities[idx].type === 'Bonus') {
                    soundManager.play("./public/sounds/spell1_0.mp3", {looping: false, volume: 0.1});
                }

                this.entities.splice(idx, 1);
            }
        }

        if (this.laterKill.length > 0)
            this.laterKill.length = 0;


        mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        mapManager.draw(ctx);

        this.draw(ctx);

        document.getElementById('health').innerHTML = `Здоровье: ${this.player.lifetime}`;
        document.getElementById('score').innerHTML = `Счёт: ${this.player.score}`;
    }

    loadAll(ctx, canvas){
        mapManager.loadMap("./public/maps/map1.json");
        spriteManager.loadAtlas("./public/sprites/sprites.json", "./public/sprites/spritesheet.png")
        soundManager.init();
        soundManager.loadArray(['./public/sounds/mainTheme.mp3', './public/sounds/spell1_0.mp3', './public/sounds/whoosh2.mp3', './public/sounds/dead.mp3', './public/sounds/great.mp3']);
        soundManager.play("./public/sounds/mainTheme.mp3", {looping: true, volume: 0.1});


        this.factory['Player'] = new Player();
        this.factory['Enemy'] = new Enemy();
        this.factory['FireBall'] = new FireBall();
        this.factory['Bonus'] = new Bonus();

        mapManager.parseEntities();
        mapManager.draw(ctx);
        this.draw(ctx);
        eventsManager.setup(canvas);
    }

    play(){
            setInterval(updateWorld, 50);
    }

    mute(){
        if (document.getElementById('muteButton').innerHTML === 'Выкл звук'){
            document.getElementById('muteButton').innerHTML = 'Вкл звук';
        }
        else{
            document.getElementById('muteButton').innerHTML = 'Выкл звук';
        }

        soundManager.toggleMute();
    }

    nextLevel(){
        let score = this.player.score;
        let lifetime = this.player.lifetime;
        this.entities.length = 0;
        physicManager.isLevelLoading = false;
        mapManager = new MapManager(mapManager.view.w, mapManager.view.h);
        mapManager.loadMap(`./public/maps/map${this.curLevel}.json`);
        mapManager.parseEntities();
        this.setPlayerAttributes(score, lifetime);
    }

    setPlayerAttributes(score, lifetime){
        if (!mapManager.entitiesParsed){
            setTimeout(() => {
                this.setPlayerAttributes(score, lifetime);
            }, 10)
        }
        else{
            this.player.score = score;
            this.player.lifetime = lifetime;
        }
    }

    end(){
        let score = this.player.score;
        localStorage["score"] = score;

        for (let i = 0; i < 4; i++){
            if (localStorage["bestScore" + i] <= score){
                let bufName = localStorage["username"];
                let bufScore = score;
                let buf1, buf2;
                for (let j = i; j < 4; j++){
                    buf1 = localStorage["bestName" + j];
                    buf2 = localStorage["bestScore" + j];
                    localStorage["bestName" + j] = bufName;
                    localStorage["bestScore" + j] = bufScore;
                    bufName = buf1;
                    bufScore = buf2;
                }
                break;
            }
        }
        window.location = 'records.html';
    }
}
