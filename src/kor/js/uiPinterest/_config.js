import Style from './_style';

export default class Config {

	constructor (arg) {

		this.option = arg;
		this.option.no_img = '/kor/js/uiPinterest/images/common/no_img.jpg';
		this.option.month_string = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		this.option.styleSheet = [
			'/kor/js/uiPinterest/css/style.css',
			'/kor/js/uiPinterest/css/pinterest.css'
		];
		this.option.request = {
			type: 'GET',
			url: '/kor/js/uiPinterest/xhr/list.json',
			data: {},
			dataType: 'json'
		};

		this.option.limit = 15;
		this.option.data = {};
		this.option.status = {};
		this.option.page = {};
		this.option.count = {};
		this.option.save = {}

		this.option.selector = {
			parent: '#uiPinterest',
			list: '#uiPinterest .grid',
			item: '#uiPinterest .grid__item',
			img: '#uiPinterest .grid__thumb img'

		};

		// 스타일시트 리스트 추가
		Style.addStyleSheet(this.option.styleSheet);

		// 실행할 메서드 등록
		this.render([ 'bind', 'append' ]);

		// 준비 완료 후 실행할 목록
		this.option.completeFunctionList = [ 'sort' , 'ani'];
	}

	selector (arg) {

		arg = document.querySelectorAll(arg);

		return arg.length > 1 ? arg : arg[0];
	}

	reg (key) {

		return new RegExp ('\{\{'+key+'\}\}', 'g');
	}

	storage (arg) {

		let aniStyle = 'transform:translateY(100px)';

		arg = {};
		arg.list = '\n'+
			'\n<div class="grid__item" style="'+aniStyle+'">'+
			'\n\t<a class="grid__link" href="{{url}}">'+
			'\n\t\t<div class="grid__img layer_01"></div>'+
			'\n\t\t<div class="grid__img layer_02"></div>'+
			'\n\t\t<div class="grid__img layer_03">'+
			'\n\t\t\t<div class="grid__thumb">'+
			'\n\t\t\t\t<img src="{{img}}" alt="{{title}}">'+
			'\n\t\t\t</div>'+
			'\n\t\t\t<div class="grid__title">{{title}}</div>'+
			'\n\t\t\t<div class="grid__icon"></div>'+
			'\n\t\t</div>'+
			'\n\t\t<span class="grid__date">{{date}}</span>'+
			'\n\t\t<div class="grid__overlay"></div>'+
			'\n\t</a>'+
			'\n</div>';

		return arg;
	}

	_storage (arg) {

		return arg;
	}	

};
	