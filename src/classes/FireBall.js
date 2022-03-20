class FireBall extends Entity{
    constructor() {
        super();
        this.move_x = 0, this.move_y = 0;
        this.speed = 10;
    }

    onTouchEntity(obj) {
        if (obj.name.match(/enemy[\d*]/) || obj.name.match(/fireBall[\d*]/)) {
            return 'Object killed'
        }
        if (obj.type === 'Player'){
            return 'player hurted';
        }

        if (obj.type !== 'Bonus')
            return 'FireBall explosed';
    }

    onTouchMap(idx){
        gameManager.kill(this);
    }

    draw(ctx){
        spriteManager.drawSprite(ctx, this.type, this.direction, this.pos_x, this.pos_y, mapManager.view);
    }

    update(){
        physicManager.update(this);
    }
}
