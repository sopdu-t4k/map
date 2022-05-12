import './css/style.scss';

import logo from './images/logo.svg';
import niioz from './images/niioz.svg';
import dzm from './images/dzm.svg';

import {handler} from './js/handler';

document.addEventListener("DOMContentLoaded",() => {
    ymaps.ready(initMap);

    function initMap() {
        let map = handler.createMap();
        handler.init(map);
    }

    document.querySelector('.js-open')
        .addEventListener('click', () => handler.showResult());

    document.querySelector('#searchResult .js-close')
        .addEventListener('click', () => handler.hideResult());

    document.querySelector('#searchDetail .js-close')
        .addEventListener('click', () => handler.hideDetail());

    document.querySelector('.js-search')
        .addEventListener('click', () => handler.showSearch());

    document.querySelector('.reset-filter')
        .addEventListener('click', (e) => {
            e.preventDefault();
            handler.resetFilter();
        });

    const tabs = document.querySelectorAll('.js-nav .nav-link');
    Array.from(tabs).forEach(tab => {
        tab.addEventListener('click', function() {
            handler.showTab(this);
        });
    });
});
