import {ContainerSearch} from './container';
import {handler} from './handler';

/**
 * Форма поиска
 * @returns {SearchForm}
 */
export class SearchForm extends ContainerSearch {
    constructor() {
        super();
        this.className = 'search';
        this.input = null;
        this.button = null;
        this.clear = null;
    }

    init() {
        this.setElement();
        if (this.element !== null) {
            this.render();
        }
    }

    createContent() {
        this.input = this.createInput();
        this.button = this.createButton();
        this.clear = this.createClear();
        return this.createObjectElement(this.tagName, this.className, [
            this.input,
            this.button,
            this.clear
        ]);
    }

    createInput() {
        let input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.placeholder = 'Поиск по названию';
        input.addEventListener('keydown', this.keypress.bind(this));
        input.addEventListener('input', this.action.bind(this));
        return input;
    }

    createButton() {
        let element = document.createElement('button');
        element.className = 'btn';
        element.type = 'button';
        element.addEventListener('click', this.submit.bind(this));
        return element;
    }

    createClear() {
        let element = document.createElement('span');
        element.className = 'clear';
        element.addEventListener('click', this.reset.bind(this));
        return element;
    }

    keypress(e) {
        if (e.key == 'Enter') {
            this.submit();
            this.input.blur();
        }
    }

    action() {
        let value = this.input.value.trim();
        if (value !== '') {
            this.clear.classList.add('show');
        } else {
            this.reset();
        }
    }

    submit() {
        let value = this.input.value.trim();
        if (value !== '') {
            handler.searchSubmit(value);
        }
    }

    reset() {
        this.input.value = '';
        this.clear.classList.remove('show');
        return handler.searchReset();
    }
}
