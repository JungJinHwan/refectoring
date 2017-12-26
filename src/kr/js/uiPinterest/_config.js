import Style from './_style';

export default class Config {

	constructor (arg) {

		this.option = arg;

		this.option.no_img = 'http://gonet.acego.net/kr/js/uiPinterest/images/common/no_img.jpg';
		this.option.no_photo = 'http://gonet.acego.net/kr/js/uiPinterest/images/common/no_photo.gif';
		this.option.no_instagram = 'http://gonet.acego.net/kr/js/uiPinterest/images/common/insta_photo.gif';
		this.option.no_name = 'GONET';
		this.option.month_string = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		this.option.styleSheet = [
			'/kr/js/uiPinterest/css/pinterest.css'
		];

		this.option.request = {
			type: 'GET',
			// url: '/kr/js/uiPinterest/xhr/list.json',
			url: '/kr/html/story/GetJson_STORY.php',
			data: { page: 1 },
			dataType: 'json'
		};

		this.option.limit = 15;
		this.option.data = { offset: [] };
		this.option.status = { 
			moveLength: 0,
			resizebled: false, 
			render:false, 
			append: false, 
			ani: false, 
			index: 0, 
			complete: [], 
			completeGroup: [],
			trident: navigator.userAgent.indexOf('Trident')
		};

		let trident = this.option.status.trident;

		this.option.status.trident = trident < 0 ? false : true;

		this.option.page = 0;
		this.option.count = 0;
		this.option.process = {};

		this.option.selector = {
			parent: '#uiPinterest',
			scroll: '#uiPinterest',
			body: '#story_body',
			group: '#story_body .group',
			list: '#story_body .grid',
			item: '.grid__item',
			img: '.grid__thumb img',
			rotate: '#rotate',
			honest: '#honest',
			story: '#story',
			story_month: '#story_month_group_button',
			story_shift: "#story_month_group_button>div",
			story_shifter: "#story_month_group_button button",
			story_bar: '#rocks_bar',
			story_group_bar: '#story_month_group_bar',
			pin_up: "#pin_up",
			pin_down: "#pin_down",
			pin_top: "#pin_top",
			button_wrap: '.button_wrap button',
			returnBar: '#returnPrograssiveTimeBar .bar',
			returnButton: '#returnButton'
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

		this.option.renderList = [ 'bind', 'append', 'lithener', 'pull' ];

		this.render(this.option.renderList);

		// *[ append 에서 콜백 ] 준비 완료 후 실행할 목록
		// next 는 반드시 마지막에 등장, 판단 기준으로 사용됨
		this.option.completeFunctionList = [ 'sort' , 'ani' , 'move' ];

		let rw = 0, rh = 0, rtime = null, scope = this;

		window.onresize = () => {

			if(rw != scope.select('body').clientWidth || rh != scope.select('body').clientHeight) {

				clearTimeout(rtime);

				rtime = setTimeout(() => {
					scope.resize([ 'sort', 'resizebled' ]);

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

				let err = '$UI_PINTEREST Request Error, AJAX 요청이 실패하였습니다';
				console.log('ERROR', res);
				document.write(err);
				throw err;
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
			'\n<div class="grid__item {{category}}" style="'+listStyle+'">'+
			'\n\t<a onclick="return $STORYVIEW.render(this, [ \'control\', \'viewScroll\' ]);" class="grid__link" href="{{url}}">'+
			'\n\t\t<div class="grid__img layer_01"><div class="category"></div></div>'+
			'\n\t\t<div class="grid__img layer_02"></div>'+
			'\n\t\t<div class="grid__img layer_03">'+
			'\n\t\t\t<div class="grid__info">'+
			'\n\t\t\t\t<div class="photo"><div><img src="{{photo}}" alt="{{name}}"></div> <span>{{name}}</span></div>'+
			'\n\t\t\t\t<div class="count">'+
			'\n\t\t\t\t\t<div class="like">{{like}}</div>'+
			'\n\t\t\t\t\t<div class="comment">{{comment}}</div>'+
			'\n\t\t\t\t</div>'+
			'\n\t\t\t</div>'+
			'\n\t\t\t<div class="grid__img layer_04">'+
			'\n\t\t\t\t<div class="grid__thumb">'+
			'\n\t\t\t\t\t<img src="{{img}}" alt="{{title}}">'+
			'\n\t\t\t\t</div>'+
			// '\n\t\t\t\t<div class="grid__title">{{title}}</div>'+
			'\n\t\t\t</div>'+
			'\n\t\t</div>'+
			'\n\t\t<span class="grid__date">{{date}}</span>'+
			'\n\t\t<div class="grid__overlay"></div>'+
			'\n\t</a>'+
			'\n</div>';

		a.month = _val => {

				return '\n<div id="month'+(_val.y+_val.m)+'"><button onclick="return $UI_PINTEREST.shift(this)" type="button"><span>'+_val.m+'</span></button></div>';
			}

		a.isEmpty = '\n'+
			'\n<div id="isEmpty">'+
			// '\n\t더이상 목록이 없습니다.<br>처음부터 다시 가져올까요?'+
			'\n\t<div id="returnPrograssiveTimeBar"><div class="bar"></div></div>'+
			// '\n\t<div id="returnButton"><button type="button"><img src="/kr/js/uiPinterest/images/common/return.png" alt="">처음 목록부터 다시 보기</button></div>'+
			'\n</div>';

		return a;
	}

	_storage (a) {

		return a;
	}	

	hasAttr (a, b, c) {

		return document.querySelector(a).getAttributeNode(b).nodeValue.indexOf(c) != -1 ? true : false;
	}

	returnCall (a) {

		let callResult = [];

		let i = 0;

		while (i<a.length) {

			callResult[i] = Boolean(this[a[i]]());

			// console.log(a[i], callResult[i]);

			i++;
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
	