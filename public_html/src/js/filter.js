import {Container, ContainerItem} from './container';
import {sendRequestServer} from './functions';
import {handler} from './handler';

/**
 * Фильтр
 * @param {String} id Значение ID
 * @param {FilterItem[]} items Массив разделов фильтра, экземпляры класса FilterItem
 * @returns {Filter}
 */
export class Filter extends Container {
    constructor() {
        super();
        this.id = 'filter';
    }

    getJson(url) {
        return sendRequestServer(url, {}, this.init.bind(this));
    }

    init(response) {
        this.element = document.getElementById(this.id);
        if (this.element !== null) {
            this.items = response.map(row => {
                let item = new FilterItem(row);
                item.init();
                return item;
            });
            this.render();
        }
    }

    render() {
        let $body = this.findChild('.content');
        if ($body !== null) {
            this.items.forEach(item => {
                $body.append(item.render());
            });
        }
    }

    reset() {
        this.items.forEach(item => {
            item.check(true);
            item.checkList();
        });
    }

    getData() {
        let data = {};
        this.items.forEach(item => {
            if (!item.active) {
                data[item.id] = item.getData();
            }
        });
        return data;
    }
}

/**
 * Раздел фильтра
 * @param {String} id Значение ID
 * @param {String} className Название класса
 * @param {String} title Заголовок раздела
 * @param {FilterInput[]} items Массив чекбоксов, экземпляры класса FilterInput
 * @param {Object[]} values Значения для чекбоксов
 */
export class FilterItem extends ContainerItem {
    constructor(params) {
        super();
        this.id = params.list;
        this.className = 'panel';
        this.title = params.title;
        this.values = params.values;
    }

    init() {
        this.items = this.values.map(item => {
            return new FilterInput(item);
        });
    }

    render() {
        this.element = this.createObjectElement(this.tagName, this.className, [
            this.createHead(),
            this.createBody()
        ]);
        return this.element;
    }

    createHead() {
        return this.createTextElement('div', `${this.className}__head`, this.title);
    }

    createBody() {
        return this.createObjectElement('div', `${this.className}__body`, [
            this.createCheckAll(),
            this.createInputList()
        ]);
    }

    createCheckAll() {
        this.input = this.createInput(this.id, 'check-all', '', this.active);
        this.input.addEventListener('change', this.changeAll.bind(this));
        return this.createObjectElement('div', 'custom-checkbox', [
            this.input,
            this.createLabel(this.id, 'все')
        ]);
    }

    createInputList() {
        return this.createObjectElement('ul', 'checkbox-list', this.createInputs());
    }

    createInputs() {
        return this.items.map(item => {
            let element = item.render();
            item.input.addEventListener('change', this.changeOne.bind(this, item));
            return element;
        });
    }

    changeAll() {
        this.active = this.input.checked;
        this.checkList();
        return handler.startFilter();
    }

    checkList() {
        let active = this.active;
        this.items.forEach(item => {
            item.check(active);
        });
    }

    changeOne(item) {
        item.active = item.input.checked;
        let all = this.element.querySelectorAll('.checkbox-list input:not(:checked)').length == 0;
        this.check(all);
        return handler.startFilter();
    }

    /**
     * Метод возвращает массив отмеченных чекбоксов
     * @returns {Array}
     */
    getData() {
        let data = [];
        this.items.forEach(item => {
            if (item.active) {
                data.push(item.title);
            }
        });
        return data;
    }
}

/**
 * Input элемент фильтра
 * @param {String} id Значение ID
 * @param {String} title Наименование
 * @param {String} tagName Тег оборачивающего элемента
 */
export class FilterInput extends ContainerItem {
    constructor(params) {
        super();
        this.id = params.id;
        this.title = params.value;
        this.tagName = 'li';
    }

    render() {
        this.input = this.createInput(this.id, '', this.title, this.active);
        return this.createObjectElement(this.tagName, '', [
            this.input,
            this.createLabel(this.id, this.title)
        ]);
    }
}
