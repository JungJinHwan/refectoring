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
		this.option.data = { offset: [] };
		this.option.status = { ani: true, index: 0, complete: [], completeGroup: [] };
		this.option.page = 0;
		this.option.count = 0;
		this.option.process = {};

		this.option.selector = {
			parent: '#uiPinterest',
			body: '#story_body',
			group: '#story_body .group',
			list: '#story_body .grid',
			item: '.grid__item',
			img: '.grid__thumb img',
			rotate: '#rotate',
			honest: '#honest',
			story: '#story',
			story_month: '#story_month_group_button',
			process_bar: '#rocks_bar',
		};

		this.option.event = {
			def: 'click.def',
			// touch: 'drag.touch touchstart.touch touchmove.touch touchend.touch mousedown.touch mousemove.touch mouseup.touch mouseleave.touch',
			touch: 'touchstart.touch touchmove.touch touchend.touch',
			wheel: 'mousewheel.wheel DOMMouseScroll.wheel'
		}

		// 스타일시트 리스트 추가
		Style.addStyleSheet(this.option.styleSheet);

		// 실행할 메서드 등록
		this.render([ 'bind', 'append', 'lithener', 'pull' ]);

		// *[ append 에서 콜백 ] 준비 완료 후 실행할 목록
		// next 는 반드시 마지막에 등장, 판단 기준으로 사용됨
		this.option.completeFunctionList = [ 'sort' , 'ani' ];

		let rw = 0, rh = 0, rtime = null, scope = this;

		window.onresize = () => {

			if(rw != scope.select('body').clientWidth || rh != scope.select('body').clientHeight) {

				clearTimeout(rtime);

				rtime = setTimeout(() => {
					scope.resizebled([ 'sort' ]);

				}, 100);

				rw = scope.select('body').clientWidth;
				rh = scope.select('body').clientHeight;
			}
		}
	}

	request (callback) {

		const SCOPE = this;

		return $.ajax({
			type: SCOPE.option.request.type,
			url: SCOPE.option.request.url,
			data: SCOPE.option.request.data,
			dataType: SCOPE.option.request.dataType,
			success: callback,
			error: res => {
				console.log('ERROR', res);
			}
		});
	}

	select (a) {

		a = document.querySelectorAll(a);

		return a.length > 1 ? a : a[0];
	}

	reg (a) {

		return new RegExp ('\{\{'+a+'\}\}', 'g');
	}

	storage (a) {

		let listStyle = 'transform:translateY(100px);opacity:0';

		a = {};
		a.list = '\n'+
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

		a.month = _val => {

				_val.m = _val.m < 10 ? '0'+_val.m : _val.m;

				return '\n<div id="month'+(_val.y+_val.m)+'"><button type="button"><span>'+_val.m+'</span></button></div>';
			}

		return a;
	}

	_storage (a) {

		return a;
	}	

	hasAttr (a, b, c) {

		return document.querySelector(a).getAttributeNode(b).nodeValue.indexOf(c) != -1 ? true : false;
	}

	returnCall (a) {
		
		for (let i=0; i<a.length; i++) {

			this[a[i]]();
		}
	}

	index (a, b) {

		let aLen = a.length;

		for (var i=0; i<aLen; i++) {
			
			if (a[i] === b) {
				break;
			}
		}

		return i;
	}
};
	