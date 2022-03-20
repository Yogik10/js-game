class MapManager {
    constructor(width, height) {
        this.mapData = null; // переменная для хранения карты
        this.tLayer = null; // переменная для хранения ссылки на блоки карты
        this.xCount = 0; // количество блоков по горизонтали
        this.yCount = 0; // количество блоков по вертикали
        this.mapSize = {x: 0, y: 0}; // размер карты в пикселях
        this.tSize = {x: 0, y: 0}; // размер блока
        this.tilesets = []; // массив описаний блоков карты
        this.imgLoadCount = 0; // количество загруженных изображений
        this.imgLoaded = false; // все изображения загружены
        this.jsonLoaded = false;  // json описание загружено
        this.entitiesParsed = false;
        this.view = { // видимая область (x;y) - верхний угол, w и h - размеры холста
            x: 0,
            y: 0,
            w: width,
            h: height
        }
    }

    loadMap(path) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                mapManager.parseMap(request.responseText);
            }
        };
        request.open('GET', path, true);
        request.send();
    }

    parseMap(tilesJSON) {
        this.mapData = JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth; // сохранение размера блока
        this.tSize.y = this.mapData.tileheight; // сохранение размера блока
        this.mapSize.x = this.xCount * this.tSize.x; // вычисление размера карты
        this.mapSize.y = this.yCount * this.tSize.y; // вычисление размера карты

        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            let img = new Image();
            img.onload = () => {
                this.imgLoadCount++;
                if (this.imgLoadCount === this.mapData.tilesets.length) {
                    this.imgLoaded = true;
                }
            };

            img.src = this.mapData.tilesets[i].image;
            let t = this.mapData.tilesets[i];
            let ts = {
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / this.tSize.x),
                yCount: Math.floor(t.imageheight / this.tSize.y)
            };
            this.tilesets.push(ts);
        }
        this.jsonLoaded = true;
    }

    draw(ctx) {
        if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
            setTimeout(() => {
                mapManager.draw(ctx);
            }, 100);
        } else {
            if (this.tLayer === null) {
                for (let id = 0; id < this.mapData.layers.length; id++) {
                    let layer = this.mapData.layers[id];
                    if (layer.type === 'tilelayer') {
                        this.tLayer = layer;
                        break;
                    }
                }
            }

            for (let i = 0; i < this.tLayer.data.length; i++) {
                if (this.tLayer.data[i] !== 0) {
                    let tile = this.getTile(this.tLayer.data[i]);
                    let pX = (i % this.xCount) * this.tSize.x;
                    let pY = Math.floor(i / this.xCount) * this.tSize.y;

                    if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                        continue;

                    pX -= this.view.x;
                    pY -= this.view.y;
                    ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y, pX, pY, this.tSize.x, this.tSize.y);
                }
            }
        }
    }

    getTile(tileIndex) {
        let tile = {
            img: null,
            px: 0, py: 0
        };
        let tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        let id = tileIndex - tileset.firstgid;
        let x = id % tileset.xCount;
        let y = Math.floor(id / tileset.xCount);
        tile.px = x * this.tSize.x;
        tile.py = y * this.tSize.y;
        return tile;
    }

    getTileset(tileIndex) {
        for (let i = this.tilesets.length - 1; i >= 0; i--) {
            if (this.tilesets[i].firstgid <= tileIndex){
                return this.tilesets[i];
            }
        }
        return null;
    }

    isVisible(x, y, width, height) {
        if (x + width < this.view.x || y + height < this.view.y || x > this.view.x + this.view.w || y > this.view.y + this.view.h)
            return false;
        return true;
    }

    getTilesetIdx(x, y) {
        let wX = x;
        let wY = y;
        let idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
        return this.tLayer.data[idx];
    }

    centerAt(x, y) {
        if (x < this.view.w/2) {
            this.view.x = 0;
        }
        else if (x > this.mapSize.x - this.view.w/2) {
            this.view.x = this.mapSize.x - this.view.w;
        }
        else {
            this.view.x = x - (this.view.w/2);
        }

        if (y < this.view.h/2) {
            this.view.y = 0;
        }
        else if (y > this.mapSize.y - this.view.h/2) {
            this.view.y = this.mapSize.y - this.view.h;
        }
        else {
            this.view.y = y - (this.view.h/2);
        }
    }

    parseEntities() {
        if (!mapManager.imgLoaded || !mapManager.jsonLoaded) {
            setTimeout(() => {
                this.parseEntities();
                }, 100);
        } else {
            for (let i = 0; i < this.mapData.layers.length; i++) {
                if (this.mapData.layers[i].type === 'objectgroup') {
                    let entities = this.mapData.layers[i];

                    for (let j = 0; j < entities.objects.length; j++) {
                        let e = entities.objects[j];

                        try {
                            let type = e.type.split('_');
                            let obj = Object.create(gameManager.factory[type[0]]);
                            obj.name = e.name;
                            obj.type = type[0];
                            obj.pos_x = e.x;
                            obj.pos_y = e.y - e.height;
                            obj.size_x = e.width;
                            obj.size_y = e.height;

                            if (obj.type !== 'Bonus') {
                                switch (type[1]) {
                                    case 'left':
                                        obj.direction = 'left';
                                        obj.move_x = -1;
                                        break;
                                    case 'right':
                                        obj.direction = 'right';
                                        obj.move_x = 1;
                                        break;
                                    case 'up':
                                        obj.direction = 'up';
                                        obj.move_y = -1;
                                        break;
                                    case 'down':
                                        obj.direction = 'down';
                                        obj.move_y = 1;
                                        break;
                                    default:
                                        return;
                                }
                            }

                            gameManager.entities.push(obj);
                            if (obj.name === 'player') {
                                gameManager.initPlayer(obj);
                            }
                        } catch (ex) {
                            console.log(`Error while creating: [${e.gid}] ${e.type}, ${e}`);
                        }
                    }
                }
            }
            this.entitiesParsed = true;
        }
    }
}
