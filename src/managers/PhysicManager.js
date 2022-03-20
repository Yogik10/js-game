class PhysicManager{
    constructor() {
        this.isLevelLoading = false;
    }

    update(obj) {
        if (obj.move_x === 0 && obj.move_y === 0)
            return 'stop';

        let newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        let newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);

        let ts = mapManager.getTilesetIdx(newX + obj.size_x / 2, newY + obj.size_y / 2);
        let e = this.entityAtXY(obj, newX, newY);

        if (e !== null && obj.onTouchEntity) {
            let res = obj.onTouchEntity(e);
            if (res === 'Object killed'){
                gameManager.kill(e);
                gameManager.kill(obj);
            }
            if (res === 'player hurted'){
                e.getDamage();
                gameManager.kill(obj);
            }
            if (res === 'FireBall explosed'){
                gameManager.kill(obj);
            }
        }

        if (ts !== 45 && ts !== 46 && ts !== 301 && obj.onTouchMap) {
            let res = obj.onTouchMap(ts);
            if (res === 'next' && !this.isLevelLoading && ++gameManager.curLevel <= gameManager.levelCount){
                this.isLevelLoading = true;
                setTimeout(() => { gameManager.nextLevel(); }, 1000);
            }
        }

        if (obj.type === 'Enemy') {
            for (let i = 0; i < Math.floor(mapManager.view.h / mapManager.tSize.y) / 2; i++) {
                let behindX = obj.pos_x + Math.floor(obj.move_x * obj.speed) + i * mapManager.tSize.x * obj.move_x * (-1);
                let behindY = obj.pos_y + Math.floor(obj.move_y * obj.speed) + i * mapManager.tSize.y * obj.move_y * (-1);
                let e = this.entityAtXY(obj, behindX, behindY);

                let ts = mapManager.getTilesetIdx(behindX + obj.size_x/2, behindY + obj.size_y/2);
                if (ts !== 45 && ts !== 46 && ts !== 301){
                    break;
                }

                if (e) {
                    if (e.type === 'Player') {
                        if (obj.direction === 'left')
                            obj.direction = 'right';
                        else if (obj.direction === 'right')
                            obj.direction = 'left';
                        else if (obj.direction === 'up')
                            obj.direction = 'down';
                        else if (obj.direction === 'down')
                            obj.direction = 'up';

                        obj.move_y *= (-1);
                        obj.move_x *= (-1);
                        return;
                    }
                }
            }

            for (let i = 0; i < Math.floor(mapManager.view.h / mapManager.tSize.y) / 2; i++) {
                let leftX = obj.pos_x + Math.floor(obj.move_x * obj.speed) - i * mapManager.tSize.x;
                let leftY = obj.pos_y;
                let e = this.entityAtXY(obj, leftX, leftY);

                let ts = mapManager.getTilesetIdx(leftX + obj.size_x/2, leftY + obj.size_y/2);
                if (ts !== 45 && ts !== 46 && ts !== 301){
                    break;
                }

                if (e) {
                    if (e.type === 'Player') {
                        if (obj.direction === 'up') {
                            obj.direction = 'left';

                            obj.move_y *= (0);
                            obj.move_x = -1;
                        }

                        break;
                    }
                }
            }

            for (let i = 0; i < Math.floor(mapManager.view.h / mapManager.tSize.y) / 2; i++) {
                let nextX = obj.pos_x + Math.floor(obj.move_x * obj.speed) + i * mapManager.tSize.x * obj.move_x;
                let nextY = obj.pos_y + Math.floor(obj.move_y * obj.speed) + i * mapManager.tSize.y * obj.move_y;
                let e = this.entityAtXY(obj, nextX, nextY);

                let ts = mapManager.getTilesetIdx(nextX + obj.size_x/2, nextY + obj.size_y/2);
                if (ts !== 45 && ts !== 46 && ts !== 301){
                    break;
                }

                if (e) {
                    if (e.type === 'Player') {
                        obj.fire();
                        return;
                    }
                }
            }
        }

        if ((ts === 45 || ts === 46 || ts === 301) && (e === null || e.type === 'Bonus')) {
            obj.pos_x = newX;
            obj.pos_y = newY;
        }
        else {
            return 'break';
        }

        return 'move';
    }

    entityAtXY(obj, x, y) {
        for (let i = 0; i < gameManager.entities.length; i++) {
            let e = gameManager.entities[i];
            if (e.name !== obj.name) {
                if (x + obj.size_x < e.pos_x || y + obj.size_y < e.pos_y || x > e.pos_x + e.size_x || y > e.pos_y + e.size_y)
                    continue;
                return e;
            }
        }
        return null;
    }
}
