/**
 * Базовый класс
 * @constructor
 * @param {String} id Значение ID
 * @param {String} className Название класса
 * @param {String} tagName Тег оборачивающего элемента
 * @param {HTMLElement} element Элемент
 * @param {ContainerItem[]} items Массив элементов, наследников класса ContainerItem
 * @returns {Container}
 */
export class Container {
    constructor() {
        this.id = '';
        this.className = '';
        this.tagName = 'div';
        this.element = null;
        this.items = [];
    }

    createTextElement(tag, className, textContent) {
        let element = document.createElement(tag);
        element.className = className;
        element.textContent = textContent;
        return element;
    }

    createObjectElement(tag, className, children) {
        let element = document.createElement(tag);
        element.className = className;
        children.forEach((child) => {
            element.append(child);
        });
        return element;
    }

    findChild(selector) {
        return this.element.querySelector(selector);
    }

    remove() {
        let node = document.getElementById(this.id);
        node.remove();
    }
}

/**
 * @constructor
 * @param {String} title Наименование
 * @param {HTMLInputElement} input Чекбокс
 * @param {bool} active Заполненность
 * @returns {ContainerItem}
 */
export class ContainerItem extends Container {
    constructor() {
        super();
        this.title = '';
        this.input = null;
        this.active = true;
    }

    createInput(id, className, value, checked) {
        let input = document.createElement('input');
        input.id = id;
        input.type = 'checkbox';
        input.className = className;
        input.value = value;
        input.checked = checked;
        return input;
    }

    createLabel(id, value) {
        let label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = value;
        return label;
    }

    check(val) {
        this.active = val;
        this.input.checked = this.active;
    }
}

export class ContainerSearch extends Container {
    constructor() {
        super();
        this.id = 'searchResult';
    }

    render() {
        let $body = this.findChild('.sidebar__body');
        if ($body !== null) {
            $body.append(this.createContent());
        }
    }

    setElement() {
        if (this.element === null) {
            this.element = document.getElementById(this.id);
        }
    }

    remove() {
        this.setElement();
        let $content = this.findChild(`.${this.className}`);
        if ($content !== null) {
            $content.remove();
        }
    }
}
