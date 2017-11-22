export default class Config {

	constructor (args) {

		this.option = args;
		this.option.styleSheet = '/kor/js/uiPinterest/css/style.css';
		this.option.request = {
			type: 'GET',
			url: '/kor/js/uiPinterest/xhr/list.json',
			data: {},
			dataType: 'json'
		};
		this.option.data = {};
		this.option.status = {};
		this.option.page = {};
		this.option.count = {};

		// 실행할 메서드 등록
		this.render([ 'bind', 'append' ]);
	}

	reg (args) {

		return new RegExp ('\{\{'+args+'\}\}', 'g');
	}

	storage (args) {

		args = {};
		args.list = '\n'+
			'\n<li class="grid__item">'+
			'\n\t<div class="grid__link">'+
			'\n\t<div class="grid__img layer layer_01"></div>'+
			'\n\t<div class="grid__img layer layer_02"></div>'+
			'\n\t<div class="grid__img layer layer_03">'+
			'\n\t\t<div class="thumb">'+
			'\n\t\t\t<img src="{{img]}}" alt="{{title}}">'+
			'\n\t\t</div>'+
			'\n\t\t<div class="overlay"></div>'+
			'\n\t\t\t<p class="title">{{title}}</p>'+
			'\n\t\t</div>'+
			'\n\t\t<span class="grid__title">{{date}}</span>'+
			'\n\t</div>'+
			'\n</li>';

		return args;
	}

	_storage (args) {

		args = {};
		args.list = [];

		return args;
	}	
};
	