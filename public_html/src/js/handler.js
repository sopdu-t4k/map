import config from './config';
import App from './app';
import {CollectionItem} from './collection';

class Handler {
    constructor() {
        this.app = null;
        this.resultElement = null;
        this.detailElement = null;
    }

    init(map) {
        this.resultElement = document.getElementById('searchResult');
        this.detailElement = document.getElementById('searchDetail');
        this.totalElement = document.getElementById('total');
        this.dateElement = document.getElementById('currentDate');
        this.app = new App(config.startDate);
        this.app.init(map);
    }

    createMap() {
        return new ymaps.Map('map', {
            center: [37.618827, 55.754015],
            zoom: 10,
            controls: ['fullscreenControl', 'zoomControl', 'rulerControl']
        });
    }

    alterTotal(total) {
        this.totalElement.textContent = total;
    }

    alterDate(date) {
        this.dateElement.textContent = `на ${date}`;
    }

    showResult() {
        this.app.showResult();
        this.resultElement.classList.add('show');
    }

    hideResult() {
        this.app.hideResult();
        this.resultElement.classList.remove('show');
    }

    showDetail(item) {
        if (item instanceof CollectionItem) {
            this.app.showDetail(item);
            this.detailElement.classList.add('show');
        }
    }

    showDetailById(id) {
        this.app.showDetailById(id);
        this.detailElement.classList.add('show');
        this.showTabSelector('.js-nav-filter');
    }

    hideDetail() {
        this.app.hideDetail();
        this.detailElement.classList.remove('show');
    }

    startFilter() {
        this.app.startFilter();
    }

    resetFilter() {
        this.app.resetFilter();
    }

    showSearch() {
        this.app.showSearch();
        this.resultElement.classList.add('show');
    }

    searchSubmit(value) {
        let filter = `filter[${config.column.title}]`;
        let formdata = new FormData();
        formdata.append(filter, value);
        this.app.startSearch(formdata);
    }

    searchReset() {
        this.app.resetSearch();
    }

    isMobile() {
        return window.innerWidth < 601;
    }

    showTab(element) {
        this.hideTabs();
        element.classList.add('active');
        if (element.dataset.target) {
            document.querySelector(element.dataset.target).classList.add('active');
        }
    }

    showTabSelector(selector) {
        if (this.isMobile()) {
            let tab = document.querySelector(selector);
            this.showTab(tab);
        }
    }

    hideTabs() {
        let tabs = document.querySelectorAll('.nav-link.active, .tab-content.active');
        Array.from(tabs).forEach(tab => {
            tab.classList.remove('active');
        });
    }

    showMap() {
        this.showTabSelector('.js-nav-map');
    }
}

export let handler = new Handler();
