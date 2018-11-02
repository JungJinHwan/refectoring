(function () {

	'user strict';

	function main(arg) {

		var SCOPE = this;

		SCOPE.option = arg;

		SCOPE.option.no_img = 'http://gonet.acego.net/kr/js/uiPinterest/images/common/no_img.jpg';
		SCOPE.option.no_photo = 'http://gonet.acego.net/kr/js/uiPinterest/images/common/no_photo.gif';
		SCOPE.option.no_instagram = 'http://gonet.acego.net/kr/js/uiPinterest/images/common/insta_photo.gif';
		SCOPE.option.no_name = 'GONET';
		SCOPE.option.month_string = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		SCOPE.option.styleSheet = [
			'/kr/js/uiPinterest/css/pinterest.css'
		];

		SCOPE.option.request = {
			type: 'GET',
			url: '/kr/js/uiPinterest/xhr/list.json',
			data: { page: 1 },
			dataType: 'json'
		};

		SCOPE.option.limit = 15;
		SCOPE.option.data = { offset: [] };
		SCOPE.option.status = {
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

		var trident = SCOPE.option.status.trident;

		SCOPE.option.status.trident = trident < 0 ? false : true;

		SCOPE.option.page = 0;
		SCOPE.option.count = 0;
		SCOPE.option.process = {};

		SCOPE.option.selector = {
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

		SCOPE.option.event = {
			def: 'click.def',
			// touch: 'drag.touch touchstart.touch touchmove.touch touchend.touch mousedown.touch mousemove.touch mouseup.touch mouseleave.touch',
			touch: 'touchstart.touch touchmove.touch touchend.touch',
			wheel: 'mousewheel.wheel DOMMouseScroll.wheel'
		}

		// 스타일시트 리스트 추가
		SCOPE.addStyleSheet(SCOPE.option.styleSheet);

		// 실행할 메서드 등록

		SCOPE.option.renderList = [ 'bind', 'append', 'lithener', 'pull' ];

		SCOPE.render(SCOPE.option.renderList);

		// *[ append 에서 콜백 ] 준비 완료 후 실행할 목록
		// next 는 반드시 마지막에 등장, 판단 기준으로 사용됨
		SCOPE.option.completeFunctionList = [ 'sort' , 'ani' , 'move' ];

		var rw = 0, rh = 0, rtime = null, scope = this;

		window.onresize = function () {

			if(rw != scope.select('body').clientWidth || rh != scope.select('body').clientHeight) {

				clearTimeout(rtime);

				rtime = setTimeout(function () {
					scope.resize([ 'sort', 'resizebled' ]);

				}, 100);

				rw = scope.select('body').clientWidth;
				rh = scope.select('body').clientHeight;
			}
		}

	}

	/* 도구 구성 */

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

	main.prototype.request = function (callback) {

		var SCOPE = this;

		return $.ajax({
			type: SCOPE.option.request.type,
			url: SCOPE.option.request.url,
			data: SCOPE.option.request.data,
			dataType: SCOPE.option.request.dataType,
			success: callback,
			error: function (res) {

				var err = '$UI_PINTEREST Request Error, AJAX 요청이 실패하였습니다';
				console.log('ERROR', res);
				document.write(err);
				throw err;
			}
		});
	}

	main.prototype.select = function (a) {

		a = document.querySelectorAll(a);

		return a.length > 1 ? a : a[0];
	}

	main.prototype.reg = function (a) {

		return new RegExp ('\{\{'+a+'\}\}', 'g');
	}

	main.prototype.storage = function (a) {

		var listStyle = 'transform:translateY(100px);opacity:0';

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

		a.month = function (_val) {

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

	main.prototype._storage = function (a) {

		return a;
	}

	main.prototype.hasAttr = function (a, b, c) {

		return document.querySelector(a).getAttributeNode(b).nodeValue.indexOf(c) != -1 ? true : false;
	}

	main.prototype.returnCall = function (a) {

		var callResult = [];

		var i = 0;

		while (i<a.length) {

			callResult[i] = Boolean(this[a[i]]());

			// console.log(a[i], callResult[i]);

			i++;
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


	/* 도구 구성 끝 */


	/* 액션 메소드 구성 */

	main.prototype.shift = function (arg) {

		var SCOPE = this;

		var Data = SCOPE.option.data;
		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		var button = SCOPE.select(Selector.story_shifter);
		var items = SCOPE.select(Selector.item);

		var index = SCOPE.index(button, arg);

		Status.touchDir = index < Status.index ? 'prev' : 'next';

		var room = Status.room[index-1];
			room = room ? room : 0;

		Status.moveLength = Status.world*Math.ceil(room)/100*-1;

		var $items = $(items.length ? items[Status.row] : items);

		var sumCount = Data.response[index].count;

		for (var i=0; i<index; i++) {

			sumCount += Data.response[i].count;
		}

		var reloader = 0;
		var idle = 0;
		function reloaderCheckItems() {

			var newItems = SCOPE.select(Selector.item);

			if (newItems.length < sumCount) {

				SCOPE.move({ idx: index });

				idle++;

				if (idle > 10) {

					// 아무것도 안하고 있는 상태가 10이상 반복되면
					// 이런식으로 처리하면 안되는데 ㅠ.ㅠ
					return window.cancelAnimationFrame(reloader);
				}

				return window.requestAnimationFrame(reloaderCheckItems);
			}

			SCOPE.move({ idx: index });

			return window.cancelAnimationFrame(reloader);
		}

		reloader = window.requestAnimationFrame(reloaderCheckItems);

		return SCOPE;
	}

	main.prototype.move = function (arg) {

		var SCOPE = this;

		var Data = SCOPE.option.data;
		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		var body = SCOPE.select(Selector.body);
		var items = SCOPE.select(Status.completeGroup[SCOPE.option.page]+'\u0020'+Selector.item);

		var bar = SCOPE.select(Selector.story_bar);

		// 내용이 위로 올라갈 때 음수가 양수가 되는것이 생각하기 편하다
		var pos = Status.moveLength*-1;

		Status.barPos = pos/Status.world*100;

		bar.style.height = Status.barPos + '%';

		body.style.transform = 'translateY(' + Status.moveLength + 'px)';

		var shield = true;

		if (Status.moveLength*-1 < 0 ) {
			if (shield) {

				setTimeout(function () {

					shield = true;

					Status.moveLength = 0;

					body.style.transform = 'translateY(0px)';

				}, 150);
			}

			shield = false;
		}

		var bodyHeight = SCOPE.select('body').clientHeight;

		if (arg) {

			Status.index = arg.idx;

			SCOPE.pull();

		} else {

			var roomLimit = Status.room[Status.touchDir == 'prev' ? Status.index-1 : Status.index];

			Status.prev = roomLimit >= Status.barPos;
			Status.next = roomLimit <= Status.barPos;

			if (Status.touchDir === 'prev') {

				if (Status.prev) {

					if (Status.index > 0) {

						Status.index--;

						SCOPE.pull();
					}
				}
			}

			if (Status.touchDir === 'next') {

				if (Status.next) {

					if (Status.index < Data.resLen-1) {

						Status.index++;

						SCOPE.pull();
					}
				}
			}
		}

		var $items = $(items.length ? items[Status.row] : items);

		Status.nextLimit = bodyHeight - $items.height();

		if (Status.nextLimit >= $items.offset().top) {

			SCOPE.next();
		}

		return this;
	}

	main.prototype.pull = function (arg) {

		var SCOPE = this;

		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		var monthGroup = SCOPE.select(Selector.story_shift);

		for (var i=0; i<monthGroup.length; i++) {

			monthGroup[i].setAttribute('class', 'of');
		}

		monthGroup[Status.index].setAttribute('class', 'ov');

		return this;
	}

	main.prototype.lithener = function () {
		// 다음 페이지를 가져올 때 이벤트를 다시 연결해야 하는 경우가 있기 때문에 기존 연결된 이벤트를 일단 삭제, 닥치고 삭제, 아 몰랑
		$DOCUMENT.off('.def').off('.touch').off('.wheel');

		var SCOPE = this;

		var Selector = SCOPE.option.selector;
		var Process = SCOPE.option.process;
		var Status = SCOPE.option.status;
		var Event = SCOPE.option.event;
		var Data = SCOPE.option.data;

		Status.touchDir = '';

	    Process.dir = function (delta) {
	        // 휠 방향 [ 1:위, -1:아래 ]
	        return (delta < 0) ? delta = 1 : delta = -1;
	    }

	    // 클릭 up
		$DOCUMENT.on(
			Event.def, Selector.pin_up, function(event) {
				event.preventDefault();

				if (Status.render && Status.ani && Status.append) {

					Status.barPos = 100;

					SCOPE.option.page = Data.resLen-1;

					// 다음 json 데이터 요청 메서드 여기서 실행
					/* 데이터 리딩 방향 */ Status.touchDir = 'prev';
					/* function */ SCOPE.next();
				}
			}
		);

	    // 클릭 down
		$DOCUMENT.on(
			Event.def, Selector.pin_down, function(event) {
				event.preventDefault();

				if (Status.render && Status.ani && Status.append) {

					Status.barPos = 100;

					SCOPE.option.page = Data.resLen-1;

					// 다음 json 데이터 요청 메서드 여기서 실행
					/* 데이터 리딩 방향 */ Status.touchDir = 'next';
					/* function */ SCOPE.next();
				}
			}
		);

	    // 클릭 top
		$DOCUMENT.on(
			Event.def, Selector.pin_top, function(event) {
				event.preventDefault();

				if (Status.render && Status.ani && Status.append) {

					Status.barPos = 100;

					SCOPE.option.page = Data.resLen-1;

					// 다음 json 데이터 요청 메서드 여기서 실행
					/* 요쳥 url 변경 */ Status.touchDir = 'first';
					/* function */ SCOPE.next();
				}
			}
		);

		// 마우스 휠
	    $DOCUMENT.on(
	    	Event.wheel, Selector.scroll, function(event) {
	    		event.preventDefault();

	    		if (Status.render && Status.ani && Status.append) {

			        var saveDir = null;

			        if(event.originalEvent.wheelDelta != undefined) {

			        	var delta = event.originalEvent.wheelDelta;

			            saveDir = Process.dir(event.originalEvent.wheelDelta*-1); // IE, CROME, SFARI
			        	// console.log('IE, CROME, SFARI', event.originalEvent.wheelDelta);

			            if ((delta < 0 ? delta*-1 : delta ) < 240) {

							Status.moveLength += event.originalEvent.wheelDelta/1.5;
			            }

			            Status.vender = 0;

			        }else{

			            saveDir = Process.dir(event.originalEvent.detail); // FF
			            //console.log('FF', event.originalEvent.detail);

			            Status.vender = 1;
			        }

			        Status.touchDir = saveDir > 0 ? 'prev' : 'next';

					if (Status.vender) {

						if (Status.touchDir === 'prev') {

							Status.moveLength += 100;
						}

						if (Status.touchDir === 'next') {

							Status.moveLength -= 100;
						}
					}

			   		SCOPE.move();
		    	}
	    	}
	    );

	    return this;
	}

	main.prototype.resizebled = function () {

		var SCOPE = this;

		var Status = SCOPE.option.status;

		Status.resizebled = false;

		return this;
	}

	main.prototype.resize = function (callback) {

		var SCOPE = this;

		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		var items = SCOPE.select(Selector.item);
		var itemsLen = items.length;

		for (var i=0; i<itemsLen; i++) {
			items[i].style.transitionProperty = 'top, left';
		}

		Status.resizebled = true;

		return SCOPE.returnCall(callback);
	}

	main.prototype.transform = function (arg, callback, _this) {

		var SCOPE = this;

		var Selector = SCOPE.option.selector;
		var Status = SCOPE.option.status;

		if (Status.ani) {

			if (arg != null) {

				var attrStringArray = [ 'ver_1', 'ver_2' ];

				if (SCOPE.hasAttr(Selector.parent, 'class', attrStringArray[arg])) {

					return null;
				}
			}

			var button = SCOPE.select(Selector.button_wrap);
			var index = SCOPE.index(button, _this);

			for (var i=0; i<button.length; i++) {

				if (index == i) {

					continue;
				}

				button[i].setAttribute('class', String(button[i].classList).replace(/[\s]+(on)/g,''));
			}

			_this.setAttribute('class', String(_this.classList)+'\u0020on');

			Status.ani = false;

			var parent = SCOPE.select(Selector.parent);

			parent.style.transitionProperty = 'transform, opacity';
			parent.style.transitionDuration = '300ms';
			parent.style.opacity = 0;

			var items = SCOPE.select(Selector.item);
			var itemsLen = items.length;

			for (var k=0; k<itemsLen; k++) {
				items[k].style.transitionProperty = 'transform, opacity';
				items[k].style.transform = 'translateY(-100px)';
				items[k].style.transitionDelay = '0ms';
				items[k].style.opacity = 0;
			}

			setTimeout(function () {

				if(arg == 0) {

					parent.setAttribute('class', 'grid ver_1');
				}

				if(arg == 1) {

					parent.setAttribute('class', 'grid ver_2');
				}

			}, 400);

			setTimeout(function () {

				parent.style.opacity = 1;

				Status.transform = true;

				SCOPE.returnCall(callback);

				Status.ani = true;

			}, 600);
		}

		return this;
	}

	main.prototype.next = function (arg) {
		// 이 메서드는 위치 계산 완료 후, 혹은 정렬 애니메이션 완료 후에 호출
		// *완료 후 상태를 판단하고 처리한다

		var SCOPE = this;

		var Data = SCOPE.option.data;
		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		if(Status.barPos >= 100) {

			// 헌것을 비우고
			Status.barPos = Status.nextLimit = Status.index = Status.prev = Status.next = Status.ani = null;

			// 새것을 채운다
			Status.barPos = 0;
			Status.nextLimit = 0;
			Status.index = 0;
			Status.row = 0;
			Status.prev = false;
			Status.next = false;
			Status.append = false;
			Status.ani = false;
			Status.moveLength = 0;

			//  시각요소 초기화
			var bar = SCOPE.select(Selector.story_bar);
			var month = SCOPE.select(Selector.story_month);
			var body = SCOPE.select(Selector.body);

			bar.style.top = '100px';
			bar.style.opacity = '0';
			bar.style.transitionDuration = '1000ms';
			bar.style.transitionTimingFunction = 'ease-in-out';

			month.style.top = '100px';
			month.style.opacity = 0;
			month.style.transitionProperty = 'opacity, top';
			month.style.transitionDuration = '300ms';

			body.style.opacity = 0;
			body.style.transitionProperty = 'opacity';

			// 트라이던트 체크
			body.style.transitionDuration = Status.trident ? '0ms' : '300ms';

			setTimeout(function () {

				bar.setAttribute('style', '');

				SCOPE.option.page = 0;
				SCOPE.option.count = 0;

				// 새것은 새그릇에
				Data.response = null;
				Data.completeStory = null;
				Data.completeList = null;

				month.innerHTML = '';
				month.style.top = 0;
				month.style.opacity = 1;

				body.innerHTML = '';
				body.style.transform = 'translateY('+Status.moveLength+'px)';
				body.style.opacity = 1;
				body.style.transitionProperty = 'opacity';

				Status.complete = [];
				Status.completeGroup = [];

				// 다음 json 데이터 요청 메서드 여기서 실행
				/* function */ SCOPE.render(SCOPE.option.renderList);

			}, 700);
		}
		else {

			if (SCOPE.option.count < Data.response[SCOPE.option.page].count) {

				Status.append = false;
				Status.ani = false;

				// 추가한 list 갯수가 모자랄 때 남은 목록 limit 만큼 또 추가
				/* function */ SCOPE.returnCall([ 'bind', 'append' ]);
			}
			else {

				// 현제 추가된 된 list 갯수가, 요청된 page 의 list 갯수와 일치하면 다음 그룹으로 넘어가고
				// 현재 진행중인 page 카운트가 작으면, 만족할 때까지 증가
				// 이것은 다음달 리스트를 불러오기 위한 판단기준이 된다

				if( SCOPE.option.page < Data.resLen-1){

					Status.append = false;
					Status.ani = false;

					SCOPE.option.page++;

					// 다음달 리스트 가져오기 전 초기화
					SCOPE.option.count = 0;

					// 다음달 리스트 가져오는 메서드 여기서 실행
					/* function */ SCOPE.returnCall([ 'bind', 'append' ]);
				}
			}
		}

		return this;
	}

	main.prototype.ani = function (arg) {

		var SCOPE = this;

		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		var group = Status.completeGroup;
		var groupLen = group.length;

		for (var i=0; i<groupLen; i++) {

			var $items = $(group[i]+'\u0020'+Selector.item);
			var $itemsLen = $items.length;

			for (var j=0; j<$itemsLen; j++) {

				var aniTime = 30*(j+1);

				$items[j].style.transform = 'translateY(0)';
				$items[j].style.opacity = '1';
				$items[j].style.transitionDelay = aniTime+'ms';
				$items[j].style.transitionDuration = '300ms';
				$items[j].style.transitionProperty = 'transform, opacity';
			}
		}

		// count 저장
		SCOPE.option.count = $(group[SCOPE.option.page]+'\u0020'+Selector.item).length;

		var timeout = null;

		timeout = setTimeout(function () {

			Status.ani = true;
		}, aniTime);

		return this;
	}

	main.prototype.sort = function (arg) {

		var SCOPE = this;

		var Data = SCOPE.option.data;
		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		for (var i=0; i<Status.completeGroup.length; i++) {

			if (Status.transform || Status.resizebled || i === SCOPE.option.page) {

				var $items = $(Status.completeGroup[i]+'\u0020'+Selector.item);
				var $itemsLen = $items.length;

				var parent = SCOPE.select(Selector.parent);
				var body = SCOPE.select(Selector.body);

				var grid = [[]]; // grid[0][0] = x , grid[1][0] = y : (y는 동적 생성)

				var cnt = { w: 0, h: 0, n: 0, y: 0 };

				var map = {
					iwidth: $items[0].offsetWidth,
					iworld: body.clientWidth
				};

				// 너비 한계선
				for(var j=0; j<$itemsLen; j++){

					// 너비 한계치에 도달하면
					if(map.iwidth*(cnt.w+1) > map.iworld){

						cnt.h++; // 높이 단계 값 증가

						grid[cnt.h] = []; // 높이 단계 증가시 배열 추가

						// 한계치 도달점을 기준으로 현재까지의 각 목록의 높이를 여백을 포함하여 배열 저장
						for(var k=cnt.n; k<cnt.n+cnt.w; k++){

							cnt.i = $items[k].offsetHeight;

							grid[cnt.h][cnt.y] = (cnt.h > 1) ? cnt.i + grid[cnt.h-1][cnt.y] : cnt.i;

							cnt.y++;
						}

						cnt.n += cnt.w;
						cnt.y = 0;
						cnt.w = 0; // 너비 한계값 초기화
					}

					grid[0][cnt.w] = map.iwidth * (cnt.w); // x 좌표

					$items[j].style.top = ((cnt.h > 0 ? grid[cnt.h][cnt.w] : 0)) + 'px';
					$items[j].style.left = grid[0][cnt.w] + 'px';


					cnt.w++;
				}

				Status.row = $itemsLen-grid[0].length;

				var countAll = 0;
				var count = [];

				// 저장된 데이터의 총 카운터를 구해 전체를 구하고, 각 그룹의 리스트 카운터로 각 그룹의 전체를 구한다.
				// 일부/전체*100 의 공식으로 전체에 대한 일부의 퍼센테이지를 구한다.

				for (var m=0; m<Data.resLen; m++) {

					countAll += Data.response[m].count;
					count[m] = Data.response[m].count;
				}

				Status.world = 0;
				Status.roomWorld = [];
				Status.room = [];

				var monthGroup = SCOPE.select(Selector.story_month).children;

				for (var o=0; o<monthGroup.length; o++) {

					var room = count[o]/countAll*100;

					Status.room[o] = o ? Status.room[o-1] + room : room;
					Status.roomWorld[o] = Math.ceil(count[o]/grid[0].length)*$items[0].offsetHeight;

					Status.world += Status.roomWorld[o];

					monthGroup[o].style.height = room + '%';
				}

				// 전체 행 갯수 * 아이템 하나의 높이 = 전체 높이, 모든 카드의 크키가 같으면 편하지 ^_^♡
				parent.style.height = Status.world + 'px';

				SCOPE.select(Status.completeGroup[i]).style.height = Status.roomWorld[i] + 'px';
			}
			else{
				continue;
			}
		}

		grid = null;

		return this;
	}

	main.prototype.bind = function (arg) {

		var SCOPE = this;

		var Data = SCOPE.option.data;
		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		// SCOPE.option.count 만큼 처리할 배열에서 제외하고 복사
		// slice는 깊은 복사이기 때문에 원본은 유지된다
		var list = Data.response[SCOPE.option.page].list.slice(SCOPE.option.count);
		var listLen = list.length < SCOPE.option.limit ? list.length : SCOPE.option.limit;

		// 매번 주소가 다른 객체를 벹어줘야 한다
		var Str = SCOPE.storage();
		var _Str = SCOPE._storage({ list: [] });

		var i = 0;

		Data.completeStory = '';
		Data.completeList = '';

		(function keyBind(_val){

			_Str.list[i] = Str.list;

			for(var key in list[i]) {

				if (key == 'category') {
					// list.category 지정
					list[i].category = 'category__'+list[i].category;
				}

				if (key == 'img') {
					// list.img 비어 있으면 default
					if (!list[i].img.length) {

						list[i].img = SCOPE.option.no_img;
					}
				}

				if (key == 'photo') {
					// list.photo 비어 있으면 default
					if (!list[i].photo.length) {

						list[i].photo = list[i].category == 'category__'+2 ? SCOPE.option.no_instagram : SCOPE.option.no_photo;
					}
				}

				if (key == 'name') {
					// list.name 비어 있으면 default
					if (!list[i].name.length) {

						list[i].name = SCOPE.option.no_name;
					}
				}

				if (key == 'date') {
					// list.date 가공
					var date = Data.dateList[SCOPE.option.page];

					list[i].date = SCOPE.option.month_string[Number(date.m)-1]+'\u0020'+date.d+',\u0020'+date.y;
				}

				_Str.list[i] = _Str.list[i].replace( SCOPE.reg(key), list[i][key] );

				_val++;
			}

			Data.completeList += _Str.list[i];

			i++;

			if (i < listLen) {

				return keyBind(0);
			}
			else {

				Data.completeMonth = (function () {

					if (SCOPE.option.page > 0) {
						return '';
					}

					var _Str = SCOPE._storage({ month: '' });

					for (var i=0; i<Data.resLen; i++) {

						var date = Data.dateList[i];

						_Str.month += Str.month({ y: date.y, m: date.m, idx: i });
					}

					return _Str.month;
				})();

				var dateList = Data.dateList[SCOPE.option.page];

				// 생성된 그룹 셀렉터 저장
				if (Status.completeGroup.length-1 != SCOPE.option.page) {
					Selector.completeGroup = '#group'+(dateList.y + dateList.m);
					Status.completeGroup[SCOPE.option.page] = Selector.completeGroup;

				}

				// 생성된 버튼 셀렉터 저장
				if (Status.complete.length-1 != SCOPE.option.page) {
					Selector.completeMonth = '#month'+(dateList.y + dateList.m);
					Status.complete[SCOPE.option.page] = Selector.completeMonth;

				}
			}

			return 1;
		})(0);


		return SCOPE;
	}

	main.prototype.append = function(arg) {

		var SCOPE = this;

		var Data = SCOPE.option.data;
		var Status = SCOPE.option.status;
		var Selector = SCOPE.option.selector;

		var select = '';
		var completeBind = '';

		// 현재 처리완료 된 리스트가 전체 리스트 보다 아직 작을 때, 대상 그룹이 존재하면 그 그룹 안으로 남은 리시트를 추가
		if (SCOPE.select(Selector.completeGroup) && SCOPE.option.count < Data.response[SCOPE.option.page].count) {
			select = Selector.completeGroup;
			completeBind = Data.completeList;

		}
		// 현재 리스트 처리가 완료 됬을때 다음 페이지 리스트를 새 그룹으로 묶어서 보낸다
		else{
			select = Selector.body;
			completeBind = '\n<div class="group" id="'+Selector.completeGroup.substr(1)+'">'+Data.completeList+'\n</div>';

			// 추가된 다음달 추가
			SCOPE.select(Selector.story_month).innerHTML += Data.completeMonth;
		}

		// 처리된 상태 HTML 에 반영
		SCOPE.select(select).innerHTML += completeBind;

		Status.append = true;
		Status.render = true;

		var body = SCOPE.select(Selector.body);

		body.style.transitionProperty = 'transform';

		// 트라이던트 체크
		body.style.transitionDuration = Status.trident ? '0ms' : '300ms';

		// 재귀 종료 지점 콜백 리스트 실행
		SCOPE.returnCall(SCOPE.option.completeFunctionList);


		return SCOPE;
	}

	main.prototype.render = function (callback) {

		var SCOPE = this;

		var Status = SCOPE.option.status;
		var Reuqest = SCOPE.option.request;

		Status.render = false;

		if (Reuqest.data.page < 1) {
			Status.touchDir = 'first';
		}

		switch (Status.touchDir) {
			case 'prev':
				Reuqest.data.page--;
					break;

			case 'next':
				Reuqest.data.page++;
					break;

			case 'first':
				Reuqest.data.page = 1;
					break;
		}

		Status.touchDir = '';

		return SCOPE.request(function (res) {

			if (res.length) {

				SCOPE.option.data.response = res;
				SCOPE.option.data.resLen = res.length;

				// 날짜 저장
				SCOPE.option.data.dateList = [];

				for (var i=0; i<SCOPE.option.data.resLen; i++) {

					var date = SCOPE.option.data.response[i].list[0].date.split('-');

					SCOPE.option.data.dateList[i] = { y: date[0], m: date[1], d: date[2] };
				}

				return SCOPE.returnCall(callback);
			}
			else{

				SCOPE.select(SCOPE.option.selector.body).innerHTML = SCOPE.storage().isEmpty;

				return SCOPE.returnCall([ 'returnBar' ]);
			}
		});
	}

	main.prototype.returnBar = function (arg) {

		var SCOPE = this;

		var Selector = SCOPE.option.selector;
		var reBar = SCOPE.select(Selector.returnBar);

		var start = null;
		var barFrame = 0;

		function step(timestamp) {

			if (!start) start = timestamp;

			var progress = timestamp - start;

			reBar.style.width = Math.min(progress / 10, reBar.parentNode.clientWidth) + 'px';

			if (parseInt(reBar.style.width) < reBar.parentNode.clientWidth) {

				return window.requestAnimationFrame(step);
			}
			else {

				window.cancelAnimationFrame(barFrame);

				$('#isEmpty').fadeOut(300, function () {

					SCOPE.option.request.data.page = 1;

					SCOPE.render(SCOPE.option.renderList);
				});

				return SCOPE;
			}
		}

		barFrame = window.requestAnimationFrame(step);

		$DOCUMENT.off('.return').on(
			'click.return', Selector.returnButton, function (event) {
				event.preventDefault();

				window.cancelAnimationFrame(barFrame);

				$('#isEmpty').fadeOut(300, function () {

					SCOPE.option.request.data.page = 1;

					SCOPE.render(SCOPE.option.renderList);
				});
			}
		);
	}

	/* 액션 메소드 구성 끝 */

	window.$UI_PINTEREST = new main({ });

}());
