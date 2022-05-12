import {ContainerSearch} from './container';
import {CollectionItem} from './collection';
import {handler} from './handler';

/**
 * Результаты поиска
 * @returns {Search}
 */
export class Search extends ContainerSearch {
    constructor() {
        super();
        this.className = 'content';
    }

    /**
     * Метод выводит результаты поиска на страницу
     * @param {CollectionItem[]} collection Массив результатов поиска, экземпляры класса CollectionItem
     */
    init(collection) {
        this.setElement();
        if (this.element !== null) {
            this.reset();
            this.setItems(collection);
            this.render();
        }
    }

    setItems(collection) {
        collection.forEach(elem => {
            if (elem.active) {
                let item = new SearchItem();
                item.init(elem);
                this.items.push(item);
            }
        });
    }

    createContent() {
        let element = document.createElement(this.tagName);
        element.className = this.className;
        if (this.items.length) {
            this.items.forEach(item => {
                element.append(item.createContent());
            });
        } else {
            element.classList.add('alert');
            element.textContent = 'По вашему запросу ничего не найдено';
        }
        return element;
    }

    reset() {
        this.items = [];
        return this.remove();
    }
}

/**
 * Результат поиска
 * @returns {SearchItem}
 */
export class SearchItem extends ContainerSearch {
    constructor() {
        super();
        this.className = 'hospital';
        this.geoObject = null;
    }

    init(item) {
        if (item instanceof CollectionItem) {
            this.geoObject = item;
        }
    }

    createContent() {
        this.element = this.createObjectElement(this.tagName, this.className, [
            this.createHead(),
            this.createBody(),
            this.createFooter()
        ]);
        this.element.addEventListener('click', this.detailed.bind(this));
        return this.element;
    }

    createHead() {
        return this.createTextElement('div', `${this.className}__head`, this.geoObject.title);
    }

    createBody() {
        return this.createTextElement('div', `${this.className}__address`, this.geoObject.address);
    }

    createFooter() {
        return this.createTextElement('div', `${this.className}__footer`, 'подробнее');
    }

    detailed() {
        return handler.showDetail(this.geoObject);
    }
}

/**
 * Подробная информация по стационару
 * @returns {SearchItemDetail}
 */
export class SearchItemDetail extends SearchItem {
    constructor() {
        super();
        this.id = 'searchDetail';
        this.className = 'detail';
        this.geoObject = null;
    }

    init(item) {
        if (item instanceof CollectionItem) {
            this.geoObject = item;
        }
        this.setElement();
        if (this.element !== null && this.geoObject !== null) {
            this.remove();
            this.render();
        }
    }

    createContent() {
        return this.createObjectElement(this.tagName, this.className, [
            this.createHead(),
            this.createBody(),
            this.createFooter()
        ]);
    }

    createHead() {
        let elements = [this.createHeadTitle(), this.createHeadAddress()];
        if (this.geoObject.status.trim() !== '') {
            elements.unshift(this.createHeadStatus());
        }
        return this.createObjectElement(this.tagName, `${this.className}__head`, elements);
    }

    createHeadTitle() {
        return this.createTextElement('div', 'title', this.geoObject.title);
    }

    createHeadAddress() {
        return this.createTextElement('div', 'address', this.geoObject.address);
    }

    createHeadStatus() {
        return this.createTextElement('span', `status ${this.geoObject.color}`, this.geoObject.status);
    }

    createBody() {
        let elements = [this.createMapButton()];
        this.geoObject.params.forEach(param => {
            if (param.value.trim() !== '') {
                elements.push(this.createBodyItem(param));
            }
        });
        return this.createObjectElement(this.tagName, `${this.className}__body`, elements);
    }

    createMapButton() {
        let element = this.createTextElement('div', 'on-map ', 'на карте');
        element.addEventListener('click', () => handler.showMap());
        return element;
    }

    createBodyItem(param) {
        let element = document.createElement('p');
        element.innerHTML = `<b>${param.title}</b>:  ${this.getPropertyValue(param.value)}`;
        return element;
    }

    getPropertyValue(str) {
        let value = str.trim();
        let regex = /^https?:\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        if (regex.test(value)) {
            let name = value.replace(/https?:\/\//, '');
            name = name.replace(/.$/, '');
            value = `<a target="_blank" href="${value}">${name}</a>`;
        }
        return value;
    }

    createFooter() {
        return this.createTextElement('div', `${this.className}__footer`, '* По состоянию на: ' + this.geoObject.date);
    }
}
