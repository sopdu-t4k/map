import config from './config';
import {removePreloader, sendCoords} from './functions';
import {handler} from './handler';
import sprite from './../images/sprite.png';

/**
 * Коллекция стационаров
 * @param {Map} map Яндекс.Карта, экземпляр класса Map
 * @param {ObjectManager} manager Менеджер объектов Яндекс.Карт, экземпляр класса ObjectManager
 * @param {CollectionItem[]} Массив стационаров, экземпляры класса CollectionItem
 * @returns {Collection}
 */
export class Collection {
    constructor() {
        this.map = null;
        this.manager = null;
        this.items = [];
        this.total = 0;
    }

    setMap(map) {
        this.map = map;
    }

    init(data) {
        this.total = data.length;
        this.items = [];
        if (this.total > 0) {
            this.setItems(data);
            this.setCoords(0);
        } else {
            this.render();
        }
    }

    setItems(data) {
        this.items = data.map(value => {
            let item = new CollectionItem(value.id);
            item.init(value.columns);
            return item;
        });
    }

    setCoords(idx) {
        if (idx < this.items.length) {
            let item = this.items[idx];
            if (item.coords['x'] && item.coords['y']) {
                this.setCoords(++idx);
            } else {
                this.getCoords(item, idx);
            }
        } else {
            this.render();
        }
    }

    /**
     * Метод получает координаты точек по адресу
     */
    getCoords(item, idx) {
        ymaps.geocode(item.address, {
            results: 1
        }).then(res => {
                if (res.geoObjects.getLength()) {
                    let geoObjectCoords = res.geoObjects.get(0).geometry.getCoordinates();
                    item.updateCoords(geoObjectCoords);
                } else {
                    this.items.splice(idx, 1);
                    this.total--;
                    console.log(item.title + ' - не найдены координаты: ' + item.address);
                }
                this.setCoords(++idx);
            }
        );
    }

    /**
     * Метод выводит коллекцию точек на карту
     */
    render() {
        this.remove();
        if (this.total > 0) {
            this.addGeoObjects();
        }
        handler.alterTotal(this.total);
        removePreloader();
    }

    /**
     * Метод собирает все точки в коллекцию
     */
    gather() {
        let collection = {
            type: 'FeatureCollection',
            features: []
        };
        this.items.forEach(item => {
            if (item.active) {
                collection.features.push(item.point());
            }
        });
        return collection;
    }

    /**
     * Метод создает менеджер объектов Яндекс.Карт, экземпляр класса ObjectManager
     * @returns {ObjectManager}
     */
    createManager() {
        let objectManager = new ymaps.ObjectManager();
        objectManager.add(this.gather());
        objectManager.events.add('click', function (e) {
            handler.showDetailById(e.get('objectId'));
        });
        return objectManager;
    }

    /**
     * Метод выводит коллекцию точек на карту
     */
    addGeoObjects() {
        this.manager = this.createManager();
        this.map.geoObjects.add(this.manager);
        if (this.manager.objects.getLength() > 1) {
            this.map.setBounds(this.manager.getBounds(), {
                checkZoomRange: true
            });
        } else {
            this.map.setBounds(this.manager.getBounds());
            this.map.setZoom(11, {
                checkZoomRange: true
            });
        }
    }

    /**
     * Метод удаляет все точки на карте
     */
    remove() {
        return this.map.geoObjects.removeAll();
    }

    /**
     * Метод фильтрует элементы коллекции
     * @param {Object[]} data
     */
    filter(data) {
        let filter = data.map(item => {
            return item.id;
        });
        this.total = 0;
        this.items.forEach(item => {
            this.total += item.includeIn(filter);
        }, filter);
        return this.render();
    }

    /**
     * Метод выбирает элементы коллекции по фильтру
     * @param {Object[]} data
     */
    select(data) {
        this.total = 0;
        this.items.forEach(item => {
            this.total += item.conform(data);
        }, data);
        return this.render();
    }

    /**
     * Метод возвращает на карту все изначально полученные точки
     */
    reset() {
        this.total = this.items.length;
        this.items = this.items.map(item => {
            item.active = true;
            return item;
        });
        return this.render();
    }

    /**
     * Метод открывает балун метки по ID
     * @param {CollectionItem} item экземпляр класса CollectionItem
     */
    openBalloon(item) {
        this.map.setCenter([item.coords['y'], item.coords['x']], 13);
        this.manager.objects.balloon.open(item.id);
    }

    /**
     * Метод закрывает все балуны на слое
     */
    closeBalloon() {
        return this.manager.objects.balloon.close();
    }
    /**
     * Метод находит элемент в коллекции по ID
     * @param {Number} id
     * @returns {CollectionItem}
     */
    getItem(id) {
        return this.items.find(item => {
            return item.id === id;
        });
    }
}

/**
 * Стационар
 * @param {Number} id
 * @returns {CollectionItem}
 */
export class CollectionItem extends Collection {
    constructor(id) {
        super();
        this.id = id;
        this.title = '';
        this.address = '';
        this.status = '';
        this.color = '';
        this.date = '';
        this.coords = {};
        this.params = [];
        this.active = true;
    }

    init(columns) {
        columns.forEach(item => {
            switch (item.name) {
                case config.column.title:
                    this.title = item.value;
                    break;
                case config.column.address:
                    this.address = item.value;
                    break;
                case config.column.latitude:
                    this.setCoords('x', item.value);
                    break;
                case config.column.longitude:
                    this.setCoords('y', item.value);
                    break;
                case config.column.date:
                    this.date = item.value;
                    break;
                case config.column.status:
                    this.status = item.value;
                    this.color = this.paint();
                default:
                    this.params.push(item);
            }
        });
    }

    /**
     * Метод отпределяет цвет метки стационара
     * @returns {String}
     */
    paint() {
        switch (this.status) {
            case 'ФГМО':
                return 'amber';
            case 'Частная':
                return 'blue';
            default:
                return 'green';
        }
    }

    setCoords(key, value) {
        if (value.trim().length) {
            this.coords[key] = value;
        }
    }

    updateCoords(coords) {
        this.coords['y'] = coords[0];
        this.coords['x'] = coords[1];
        return sendCoords(this.id, this.coords['x'], this.coords['y']);
    }

    /**
     * Метод возвращает сущность коллекции
     * @returns {Object{}}
     */
    point() {
        return {
            type: 'Feature',
            id: this.id,
            geometry: {
                type: 'Point',
                coordinates: [this.coords['y'], this.coords['x']]
            },
            options: {
                iconLayout: 'default#image',
                iconImageClipRect: this.clip(),
                iconImageHref: sprite,
                iconImageSize: [30, 30],
                iconImageOffset: [-13, 0],
                hideIconOnBalloonOpen: false
            },
            properties: {
                balloonContentHeader: this.title,
                balloonContentBody: this.address,
                hintContent: this.title
            }
        };
    }

    /**
     * Метод определяет область графического файла 'sprite.png'
     * @returns {Array}
     */
    clip() {
        switch (this.color) {
            case 'amber':
                return [[60, 0], [120, 60]];
            case 'blue':
                return [[120, 0], [180, 60]];
            case 'gray':
                return [[180, 0], [240, 60]];
            default:
                return [[0, 0], [60, 60]];
        }
    }

    /**
     * Метод проверяет соответствие элемента параметрам фильтра
     * @param {Object[]} data
     * @returns {Number}
     */
    conform(data) {
        this.active = true;
        for (let i = 0; i < this.params.length; i++) {
            let param = this.params[i];
            if (param.name in data && !this.contains(data[param.name], param.value)) {
                this.active = false;
                break;
            }
        }
        return this.active ? 1 : 0;
    }

    contains(data, value) {
        if (data.length > 0) {
            return data.indexOf(value) !== -1;
        } else {
            return !value.trim().length;
        }
    }

    includeIn(filter) {
        this.active = filter.includes(this.id);
        return this.active ? 1 : 0;
    }
}
