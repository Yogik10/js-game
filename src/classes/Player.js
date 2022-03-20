class Player extends Entity{
    constructor(props) {
        super(props);
        this.lifetime = 100;
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 4;
        this.fireInterval = 1000;
        this.canFire = true;
        this.score = 0;
    }

    onTouchEntity(obj) {
         if (obj.name.match(/bonus[\d]/)) {
             this.lifetime += 50;
             this.score += 50;
             this.flash('#008000');
             gameManager.kill(obj);
         }
    }

    getDamage(){
        this.lifetime -= 50;
        this.score -= 50;

        this.flash('#ad000c');

        if (this.lifetime <= 0){
            gameManager.kill(this);
        }
    }


    onTouchMap(obj){
        if (obj === 246){
            soundManager.play("./public/sounds/spell1_0.mp3", {looping: false, volume: 0.1});
            this.flash('#008000');
            return 'next';
        }
        if (obj === 629){
            soundManager.play("./public/sounds/spell1_0.mp3", {looping: false, volume: 0.1});
            this.flash('#03ff03');
            setTimeout(() => { gameManager.end();; }, 1000);
        }
    }

    draw(ctx){
        spriteManager.drawSprite(ctx, this.type, this.direction, this.pos_x, this.pos_y, mapManager.view);
    }

    update(){
        physicManager.update(this);
    }

    fire() {
        if (!this.canFire)
            return;

        let fb = Object.create(gameManager.factory['FireBall']);
        fb.size_x = this.size_x;
        fb.size_y = this.size_y;
        fb.name = 'fireBall' + (++gameManager.fireNum);
        fb.type = 'FireBall';
        switch (this.direction) {
            case 'left':
                fb.pos_x = this.pos_x - fb.size_x;
                fb.pos_y = this.pos_y;
                fb.direction = 'left';
                fb.move_x = -1;
                break;
            case 'right':
                fb.pos_x = this.pos_x + fb.size_x;
                fb.pos_y = this.pos_y;
                fb.direction = 'right';
                fb.move_x = 1;
                break;
            case 'up':
                fb.pos_x = this.pos_x;
                fb.pos_y = this.pos_y - fb.size_y;
                fb.direction = 'up';
                fb.move_y = -1;
                break;
            case 'down':
                fb.pos_x = this.pos_x;
                fb.pos_y = this.pos_y + fb.size_y;
                fb.direction = 'down';
                fb.move_y = 1;
                break;
            default:
                return;
        }
        gameManager.entities.push(fb);

        this.canFire = false;
        setTimeout(() => {
            this.canFire = true;
        }, this.fireInterval);

        soundManager.play("./public/sounds/whoosh2.mp3", {looping: false, volume: 0.1});
    }

    flash(color){
        document.getElementById('body').style.background = '';
        document.getElementById('body').style.backgroundColor = color;
        setTimeout(() => {
            document.getElementById('body').setAttribute('style','background: url("./public/pictures/white-cubes.png")');
            document.getElementById('body').style.backgroundColor = '';
            setTimeout(() => {
                document.getElementById('body').style.background = '';
                document.getElementById('body').style.backgroundColor = color;
                setTimeout(() => {
                    document.getElementById('body').setAttribute('style','background: url("./public/pictures/white-cubes.png")');
                    document.getElementById('body').style.backgroundColor = '';
                }, 100)
            }, 100)
        }, 100)
    }
}
