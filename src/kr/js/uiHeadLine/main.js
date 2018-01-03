(function () {

	'use strict';

	function main (arg) {

		var SCOPE = this;

		SCOPE.option = arg;

		SCOPE.option.request = {
			type: 'GET',
			url: '/kr/js/uiHeadLine/xhr/list.json',
			data: {},
			dataType: 'json',
		};

		SCOPE.option.styleSheet = [
			'/kr/js/uiHeadLine/css/uiHeadLine.css'
		];

		SCOPE.option.data = {
			circle : null
		};
		SCOPE.option.status = { index:0, screenUp: true };

		SCOPE.option.interval = 5000;

		SCOPE.option.page = 0;
		SCOPE.option.count = 0;
		SCOPE.option.process = {};

		SCOPE.option.selector = {
			parent: '#uiHeadLine',
			contents: "#service_0102",
			circle: '#uiHeadLine .circle',
			circle_film: '#uiHeadLine .circle_film',
			bg: '#uiHeadLine .bg',
			item: '#uiHeadLine .item',
			more: '#uiHeadLine .detail a',
			scroll: 'html,body'
		};

		SCOPE.option.event = {
			def: 'click.def',
			mouse: 'mouseenter.mouse mouseleave.mouse',
			wheel: 'mousewheel.wheel DOMMouseScroll.wheel'
		};

		// 스타일시트 리스트 추가
		SCOPE.addStyleSheet(SCOPE.option.styleSheet);

		// 실행할 메서드 등록
		SCOPE.render([ 'bind', 'append', 'listener', 'next', 'auto' ]);

		var rw = 0, rh = 0, rtime = null, scope = SCOPE;

		window.onresize = function () {

			if(rw != scope.select('body')[0].clientWidth || rh != scope.select('body')[0].clientHeight) {

				clearTimeout(rtime);

				rtime = setTimeout(function () {
					scope.resize([]);

				}, 100);

				rw = scope.select('body')[0].clientWidth;
				rh = scope.select('body')[0].clientHeight;
			}
		}

	}

	main.prototype.addStyleSheet = function (array) {

		var GET_DOC = document;
		var GET_ELEMENT_POSITION = GET_DOC.getElementsByTagName('script')[0];

		for (var i=0; i<array.length; i++) {

			var MAKE_ELEMENT = GET_DOC.createElement("link");

			MAKE_ELEMENT.rel = 'stylesheet';
			MAKE_ELEMENT.href = array[i];

			GET_ELEMENT_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_ELEMENT_POSITION);
		}

		return this;
	}


	/* 유틸 구성 */

	main.prototype.request = function (callback) {

		var SCOPE = this;

		return $.ajax({
			type: SCOPE.option.request.type,
			url: SCOPE.option.request.url,
			data: SCOPE.option.request.data,
			dataType: SCOPE.option.request.dataType,
			success: callback,
			error: function(res) {

				var err = '$UI_HEADLINE Request Error, AJAX 요청이 실패하였습니다';
				console.log('ERROR', res);
				document.write(err);
				throw err;
			}
		});
	}

	main.prototype.storage = function (a) {

		a = {};

		var circleStyle = 'style="background-image:url({{img}});"';
		var bgStyle = 'style="background-image:url({{img}});"';

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

	main.prototype._storage = function (a) {

		return a;
	}

	main.prototype.select = function (a) {

		return document.querySelectorAll(a);
	}

	main.prototype.reg = function (a) {

		return new RegExp ('\{\{'+a+'\}\}', 'g');
	}

	main.prototype.hasAttr = function (a, b, c) {

		return document.querySelector(a).getAttributeNode(b).nodeValue.indexOf(c) != -1 ? true : false;
	}

	main.prototype.returnCall = function (a) {
		
		for (var i=0; i<a.length; i++) {

			this[a[i]].call(this);
		}
	}

	main.prototype.index = function (a, b) {

		var aLen = a.length;

		for (var i=0; i<aLen; i++) {
			
			if (a[i] === b) {
				break;
			}
		}

		return i;
	}

	/* 유틸 끝 */


	/* 액션 메소드 구성 */

	main.prototype.auto = function (arg) {

		var SCOPE = this;

		var Status = SCOPE.option.status;
		var Data = SCOPE.option.data;

		Status.fade = 1000;
		Status.dlay = 700;

		Status.auto = setInterval(function () {

			if (Status.index < Data.circleLen-1) {

				Status.index++;
			}
			else {

				Status.index = 0;
			}

			return SCOPE.returnCall([ 'next' ]);

		}, SCOPE.option.interval);

		return SCOPE;
	}

	main.prototype.next = function (arg) {

		var SCOPE = this;

		var Selector = SCOPE.option.selector;
		var Status = SCOPE.option.status;
		var Data = SCOPE.option.data;

		var circle = SCOPE.select(Selector.circle);
		var item = SCOPE.select(Selector.item);
		var bg = SCOPE.select(Selector.bg);
		var more = SCOPE.select(Selector.more)[0];

		var circlelen = circle.length;

		for (var i=0; i<circlelen; i++) {

			if (Status.index == i) {

				continue;
			}

			circle[i].setAttribute('class', 'circle');

			$(item[i]).stop(1,0).fadeOut(Status.fade);
			$(bg[i]).stop(1,0).delay(Status.dlay).fadeOut(Status.fade);
		}

		circle[Status.index].setAttribute('class', 'circle ov');
		
		$(item[Status.index]).stop(1,0).fadeIn(Status.fade);
		$(bg[Status.index]).stop(1,0).delay(Status.dlay).fadeIn(Status.fade);

		more.setAttribute('href', Data.circle[Status.index].url);

		return SCOPE;
	}

	main.prototype.screenDown = function (arg) {

		var SCOPE = this;

		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		var parentHeight = SCOPE.select(Selector.parent)[0].clientHeight;

		$(Selector.parent)
			.stop(1,0).animate({ 

				marginTop: parentHeight*-1 

			}, 1000, 'easeInOutCubic');

		Status.screenDown = true;

		return SCOPE;
	}

	main.prototype.screenUp = function (arg) {

		var SCOPE = this;

		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		$(Selector.parent)
			.stop(1,0).animate({ 

				marginTop: 0

			}, 1000, 'easeOutCubic');

		Status.screenDown = false;

		return SCOPE;
	}

	main.prototype.listener = function () {

		var SCOPE = this;

		var Selector = SCOPE.option.selector;
		var Status = SCOPE.option.status;
		var Event = SCOPE.option.event;
		var Process = SCOPE.option.process;

		var circle = SCOPE.select(Selector.circle);
		var circle_film = SCOPE.select(Selector.circle_film)[0];

		$DOCUMENT.on(Event.def, Selector.circle, function (event) {

			Status.index = SCOPE.index(circle, this);

			Status.fade = 300;
			Status.dlay = 300;

			return SCOPE.returnCall([ 'next' ]);

		});

		$DOCUMENT.on(Event.mouse, Selector.circle, function (event) {

			if (event.type === 'mouseenter') {

				clearInterval(Status.auto);

				circle_film.style.opacity = '1';
				circle_film.style.zIndex = '10';
			}

			if (event.type === 'mouseleave') {

				circle_film.style.opacity = '0';
				circle_film.style.zIndex = '0';

				return SCOPE.returnCall([ 'auto' ]);
			}
		});


		// 마우스 휠
	    Process.dir = function (delta) {
	        // 휠 방향 [ 1:위, -1:아래 ]
	        return (delta < 0) ? delta = 1 : delta = -1;
	    }

	    $DOCUMENT.on(
	    	Event.wheel, Selector.parent, function(event) {
	    		event.preventDefault();

				if ($(Selector.parent).is(':animated')) {

					return false;
				}

		        var dir = 0;

		        if(event.originalEvent.wheelDelta != undefined) {

		            dir = Process.dir(event.originalEvent.wheelDelta*-1); // IE, CROME, SFARI
		            //console.log('IE, CROME, SFARI', saveDir);
		        }else{

		            dir = Process.dir(event.originalEvent.detail); // FF
		            //console.log('FF', saveDir);
		        }

		        if (dir < 0) {

		        	return SCOPE.returnCall([ 'screenDown' ]);
		        }
	    	}
	    );

	    $DOCUMENT.on(
	    	Event.wheel, Selector.contents, function(event) {
	    		event.preventDefault();

				if ($(Selector.contents).is(':animated')) {
					
					return false;
				}

		        var dir = 0;

		        if(event.originalEvent.wheelDelta != undefined) {

		            dir = Process.dir(event.originalEvent.wheelDelta*-1); // IE, CROME, SFARI
		            //console.log('IE, CROME, SFARI');
		        }else{

		            dir = Process.dir(event.originalEvent.detail); // FF
		            //console.log('FF');
		        }

				// 외부에서 option.status.screendUp = true; 했을 때
				if (dir > 0) {

		        	if (Status.screenUp) {

		        		return SCOPE.returnCall([ 'screenUp' ]);
		        	}
	        	}
	    	}
	    );

		return SCOPE;
	}

	main.prototype.bind = function (arg) {

		var SCOPE = this;

		var Data = SCOPE.option.data;

		var Str = SCOPE.storage();
		var _Str = SCOPE._storage({ visual: Str.visual });

		Data.circleLen = Data.circle.length;

		var bg = '', circle = '', titleGroup = '';

		for (var i=0; i<Data.circleLen; i++) {

			_Str.bg = Str.bg;
			_Str.circle = Str.circle;
			_Str.titleGroup = Str.titleGroup;

			bg += '\n'+_Str.bg.replace(SCOPE.reg('img'), Data.circle[i].img);

			circle += '\n'+_Str.circle.replace(SCOPE.reg('img'), Data.circle[i].img);

			titleGroup += '\n'+_Str.titleGroup
				.replace(SCOPE.reg('label'), Data.circle[i].label)
					.replace(SCOPE.reg('summary'), Data.circle[i].summary);

		}

		Data.strings = _Str.visual
			.replace(SCOPE.reg('bg'), bg)
				.replace(SCOPE.reg('circle'), circle)
					.replace(SCOPE.reg('titleGroup'), titleGroup);

		return SCOPE;
	}

	main.prototype.append = function (arg) {

		var SCOPE = this;

		var Data = SCOPE.option.data;
		var Selector = SCOPE.option.selector;

		SCOPE.select(Selector.parent)[0].innerHTML = Data.strings;

		var circle = SCOPE.select(Selector.circle);
		var circleLen = circle.length;

		if (circleLen%2 != 0) {

			var err = '$UI_HEADLINE ERROR ( type append ) : 짝수만 등록 가능합니다. 홀수의 경우 좌·우의 분배가 동일하지 않게 됩니다.';

			document.write('<h1>'+err+'</h1>');

			throw err;
		}

		var cpnum = circleLen/2;
		var defPos = 440;
		var inc = 200;

		for (var i=0; i<circleLen; i++) {

			var circlePos = 0;

			if (i < cpnum) {

				circlePos = (defPos + inc * ((cpnum-1)-i))*-1;

				//console.log('left', circlePos);
			}
			else {

				circlePos = defPos + inc * (i-cpnum);

				//console.log('right', circlePos);
			}

			circle[i].style.transform = 'translateX(' + circlePos + 'px)';
		}

		return SCOPE;
	}

	main.prototype.resize = function (callback) {

		var SCOPE = this;

		var Status = SCOPE.option.status;

		if (Status.screenDown) {

			var Selector = SCOPE.option.selector;
			var parent = SCOPE.select(Selector.parent)[0];

			parent.style.marginTop = (parent.clientHeight*-1)+'px';

		}

		return SCOPE.returnCall(callback);
	}

	main.prototype.render = function (callback) {

		var SCOPE = this;

		return SCOPE.request(function(res) {

			SCOPE.option.data.circle = res;

			return SCOPE.returnCall(callback);	
		});
	}

	/* 액션 메소드 끝 */


	window.$UI_HEADLINE = new main({ });

}());