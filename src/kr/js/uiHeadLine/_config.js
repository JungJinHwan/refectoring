import Style from './_style';

export default class Config {

	constructor (arg) {

		this.option = arg;

		this.option.request = {
			type: 'GET',
			url: '/kr/js/uiHeadLine/xhr/list.json',
			data: {},
			dataType: 'json',
		};

		this.option.styleSheet = [
			'/kr/js/uiHeadLine/css/uiHeadLine.css'
		];

		this.option.data = {
			circle : null
		};
		this.option.status = { index:0, screenUp: true };

		this.option.interval = 5000;

		this.option.page = 0;
		this.option.count = 0;
		this.option.process = {};

		this.option.selector = {
			parent: '#uiHeadLine',
			contents: "#service_0102",
			circle: '#uiHeadLine .circle',
			circle_film: '#uiHeadLine .circle_film',
			bg: '#uiHeadLine .bg',
			item: '#uiHeadLine .item',
			more: '#uiHeadLine .detail a',
			scroll: 'html,body'
		};

		this.option.event = {
			def: 'click.def',
			mouse: 'mouseenter.mouse mouseleave.mouse',
			wheel: 'mousewheel.wheel DOMMouseScroll.wheel'
		};

		// 스타일시트 리스트 추가
		Style.addStyleSheet(this.option.styleSheet);

		// 실행할 메서드 등록
		this.render([ 'bind', 'append', 'listener', 'next', 'auto' ]);

		let rw = 0, rh = 0, rtime = null, scope = this;

		window.onresize = () => {

			if(rw != scope.select('body')[0].clientWidth || rh != scope.select('body')[0].clientHeight) {

				clearTimeout(rtime);

				rtime = setTimeout(() => {
					scope.resize([]);

				}, 100);

				rw = scope.select('body')[0].clientWidth;
				rh = scope.select('body')[0].clientHeight;
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

				let err = '$UI_HEADLINE Request Error, AJAX 요청이 실패하였습니다';
				console.log('ERROR', res);
				document.write(err);
				throw err;
			}
		});
	}

	storage (a) {

		a = {};

		let circleStyle = 'style="background-image:url({{img}});"';
		let bgStyle = 'style="background-image:url({{img}});"';

		a.circle = '\n'+
			'\n<div class="circle">'+
			'\n\t<div class="circle_bg"></div>'+
			'\n\t<div class="circle_inner"><div class="circle_mask" '+circleStyle+'></div></div>'+
			'\n</div>';

		a.bg = '\n\t<div class="bg bg_{{i}}" '+bgStyle+'></div>';

		a.titleGroup = '\n'+
			'\n\t<div class="item">'+
			'\n\t\t<div class="label">{{label}}</div>'+
			'\n\t\t<div class="summary">{{summary}}</div>'+
			'\n\t</div>';

		a.visual = '\n'+
			'\n<div class="subject">Portfolio</div>'+
			'\n<div class="bg_group">{{bg}}\n</div>'+
			'\n<div class="title_group">'+
			'\n\t<div class="c8_animate_strong_focusing_shape"></div>'+
			'\n\t<div class="grap">{{titleGroup}}</div>'+
			'\n\t<div class="detail">'+
					'<a href="#">Detail view '+
						'<span class="transformer">'+
							'<span class="line"></span>'+
							'<span class="line"></span>'+
							'<span class="line"></span>'+
						'</span>'+
					'</a>'+
				'</div>'+
			'\n</div>'+
			'\n<div class="circle_group">\n<div class="circle_film"></div>\n{{circle}}\n</div>'+
			'\n<div class="button_down">'+
				'<button type="button" onclick="return $UI_HEADLINE.screenDown(this)">'+
					'<img src="/kr/js/uiHeadLine/images/arr_down.png" alt="콘텐츠 바로가기">'+
				'</button>'+
			'</div>'+
			'\n<div class="ci_gonet"><img src="/kr/js/uiHeadLine/images/gonet.png" alt="gonet"></div>';

		return a;
	}

	_storage (a) {

		return a;
	}

	select (a) {

		return document.querySelectorAll(a);
	}

	reg (a) {

		return new RegExp ('\{\{'+a+'\}\}', 'g');
	}

	hasAttr (a, b, c) {

		return document.querySelector(a).getAttributeNode(b).nodeValue.indexOf(c) != -1 ? true : false;
	}

	returnCall (a) {
		
		for (let i=0; i<a.length; i++) {

			this[a[i]].call(this);
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
	