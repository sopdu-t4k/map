import {sendRequestServer} from './functions';
import AirDatepicker from 'air-datepicker';
import {Filter} from './filter';
import {Collection} from './collection';
import {Search, SearchItemDetail} from './search';
import {SearchForm} from './form';
import {handler} from './handler';

export default class App {
    constructor(start) {
        this.start = start;
        this.end = null;
        this.filter = null;
        this.collection = null;
        this.result = null;
        this.object = null;
        this.search = null;
        this.datepicker = null;
        this.isSearch = false;
    }

    init(map) {
        this.filter = new Filter();
        this.collection = new Collection();
        this.collection.setMap(map);
        this.result = new Search();
        this.object = new SearchItemDetail();
        this.search = new SearchForm();
        this.getData();
    }

    getData() {
        this.filter.getJson('handbooklist');
        this.getJson({}, this.render);
    }

    getJson(formdata, callback) {
        sendRequestServer('list', formdata, callback.bind(this));
    }

    render(response) {
        this.initCollection(response);
        this.initDatepicker();
    }

    initCollection(response) {
        this.collection.init(response.data);
    }

    initDatepicker() {
        let endDate = this.getEndDate();
        this.end = this.formatToDate(endDate);
        this.datepicker = this.createDatepicker();
        handler.alterDate(endDate);
    }

    createDatepicker() {
        return new AirDatepicker('#filterDate', {
            autoClose: true,
            minDate: this.start,
            maxDate: this.end,
            selectedDates: [this.end],
            onSelect: this.reload.bind(this)
        });
    }

    getEndDate() {
        this.collection.items.sort((a, b) => {
            return this.formatToDate(a.date) <= this.formatToDate(b.date) ? 1 : -1;
        });
        return this.collection.items[0].date;
    }

    formatToDate(str) {
        let date = null;
        if (/^\d{2}.\d{2}.\d{4}$/.test(str)) {
            let arrDate = str.split('.');
            date = new Date(+arrDate[2], +arrDate[1] - 1, +arrDate[0]);
        }
        return date;
    }

    reload( {formattedDate}) {
        this.filter.reset();
        this.initCollectionByDate(formattedDate);
        handler.alterDate(formattedDate);
    }

    initCollectionByDate(date) {
        let formdata = new FormData();
        formdata.append('filter[date]', date);
        return this.getJson(formdata, this.initCollection);
    }

    showResult() {
        this.result.init(this.collection.items);
    }

    hideResult() {
        if (this.isSearch) {
            this.hideSearch();
        }
        this.result.reset();
    }

    showDetail(item) {
        this.collection.openBalloon(item);
        this.object.init(item);
    }

    showDetailById(id) {
        var item = this.collection.getItem(id);
        this.object.init(item);
    }

    hideDetail() {
        this.collection.closeBalloon();
        this.object.remove();
    }

    startFilter() {
        let data = this.filter.getData();
        this.collection.select(data);
    }

    resetFilter() {
        this.filter.reset();
        this.collection.reset();
    }

    showSearch() {
        this.isSearch = true;
        this.search.init();
        this.resetFilter();
    }

    hideSearch() {
        this.isSearch = false;
        this.search.remove();
        this.collection.reset();
    }

    startSearch(formdata) {
        this.getJson(formdata, this.resultSearch);
    }

    resultSearch(response) {
        this.collection.filter(response.data);
        this.showResult();
    }

    resetSearch() {
        this.result.reset();
        this.collection.reset();
    }
}
