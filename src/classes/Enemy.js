class Enemy extends Entity{
    constructor() {
        super();
        this.lifetime = 100;
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 4;
        this.fireInterval = 1500;
        this.canFire = true;
    }

    draw(ctx){
        spriteManager.drawSprite(ctx, this.type, this.direction, this.pos_x, this.pos_y, mapManager.view);
    }

    update(){
        physicManager.update(this);
    }

    onTouchMap(obj){
        if (this.direction === 'left'){
            this.direction = 'right';
            this.move_x = 1;
            this.move_y = 0;
        }
        else if (this.direction === 'right') {
            this.direction = 'left';
            this.move_x = -1;
            this.move_y = 0;
        }
        else if (this.direction === 'up'){
            this.direction = 'down';
            this.move_y = 1;
            this.move_x = 0;
        } else {
            this.direction = 'up';
            this.move_y = -1;
            this.move_x = 0;
        }
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
}
