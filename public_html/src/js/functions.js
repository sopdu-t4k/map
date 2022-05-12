import config from './config';

export function sendRequestServer(path, formdata, callback) {
    createPreloader();
    fetch(config.reestrUrl + path, {
        method: 'POST',
        body: formdata,
    })
    .then(response => response.json())
    .then(data => {
        callback(data);
    })
    .catch(error => {
        alert('Ошибка обработки запроса!');
        console.log(error);
    });
}

export function sendCoords(id, x, y) {
    let formdata = new FormData();
    formdata.append('id', id);
    formdata.append('x', x);
    formdata.append('y', y);
    fetch(config.reestrUrl + 'setcoords', {
        method: 'POST',
        body: formdata
    });
}

export function createPreloader() {
    if (!document.querySelector('.preloader')) {
        let element = document.createElement('div');
        element.className = 'preloader';
        document.body.append(element);
    }
}

export function removePreloader() {
    let preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.remove();
    }
}
