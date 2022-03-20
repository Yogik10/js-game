class Explosion extends Entity {
    constructor() {
        super();
    }

    update(){
        physicManager.update(this);
    }

    draw(ctx){
        spriteManager.drawSprite(ctx, this.type, this.direction, this.pos_x, this.pos_y, mapManager.view);
    }
}
