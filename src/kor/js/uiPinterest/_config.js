import Style from './_style';

export default class Config {

	constructor (arg) {

		this.option = arg;

		this.option.no_img = '/kor/js/uiPinterest/images/common/no_img.jpg';
		this.option.month_string = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
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
		this.option.data = { save: { offset: [] } };
		this.option.status = { count: 0, ani: true };
		this.option.page = { count: 0 };
		this.option.count = {};

		this.option.selector = {
			parent: '#uiPinterest',
			group: '#uiPinterest .group',
			list: '#uiPinterest .grid',
			item: '#uiPinterest .grid__item',
			img: '#uiPinterest .grid__thumb img',
			rotate: '#rotate',
			honest: '#honest'

		};

		// 스타일시트 리스트 추가
		Style.addStyleSheet(this.option.styleSheet);

		// 실행할 메서드 등록
		this.render([ 'bind', 'append' ]);

		// 준비 완료 후 실행할 목록, append 에서 콜백 동작
		// next 는 반드시 마지막에 등장, 판단 기준으로 사용됨
		this.option.completeFunctionList = [ 'sort' , 'ani', 'next'];

		let rw, rh, rtime, scope = this;

		window.onresize = () => {

			if(rw != scope.selector('body').clientWidth || rh != scope.selector('body').clientHeight) {

				clearTimeout(rtime);

				rtime = setTimeout(() => {
					scope.resizebled([ 'sort' ]);

				}, 100);

				rw = rw || scope.selector('body').clientWidth, rh = rh || scope.selector('body').clientHeight;
			}
		}
	}

	selector (arg) {

		arg = document.querySelectorAll(arg);

		return arg.length > 1 ? arg : arg[0];
	}

	reg (key) {

		return new RegExp ('\{\{'+key+'\}\}', 'g');
	}

	storage (arg) {

		let listStyle = 'transform:translateY(100px);opacity:0';

		arg = {};
		arg.list = '\n'+
			'\n<div class="grid__item" style="'+listStyle+'">'+
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

		arg.history = '\n'+
			'\n<div id="history_control">'+
			'\n\t<div class="control" id="history_top"><button id="pin_top" type="button">new</button></div>'+
			'\n\t<div class="control" id="history_up"><button id="pin_up" type="button">up</button></div>'+
			'\n\t<div class="control" id="history_month_group">{{month}}</div>'+
			'\n\t<div class="control" id="history_down"><button id="pin_down" type="button">down</button><</div>'+
			'\n</div>';

		arg.month = _val => {

				_val.m = _val.m < 10 ? '0'+_val.m : _val.m;

				return '\n<div id="month_'+(_val.y+_val.m)+'"><button type="button"><span>'+_val.m+'</span></button></div>';
			}

		return arg;
	}

	_storage (arg) {

		return arg;
	}	

	hasAttr (a, b, c) {

		return document.querySelector(a).getAttributeNode(b).nodeValue.indexOf(c) != -1 ? true : false;
	}
};
	