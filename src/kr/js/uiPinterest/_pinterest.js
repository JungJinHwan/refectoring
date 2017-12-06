import Config from './_config';

class main extends Config {

	move (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		let body = SCOPE.select(Selector.body);
		let items = SCOPE.select(Status.completeGroup[SCOPE.option.page]+'\u0020'+Selector.item);
		let bar = SCOPE.select(Selector.story_bar);

		// 내용이 위로 올라갈 때 음수가 양수가 되는것이 생각하기 편하다
		let pos = Status.moveLength*-1;

		let shield = true;

		if (pos < 0 ) {
			if (shield) {

				setTimeout(() => {

					shield = true;

					Status.moveLength = 0;

					body.style.transform = 'translateY(0px)';

				}, 150);
			}

			shield = false;
		}

		let bodyHeight = SCOPE.select('body').clientHeight;

		Status.barPos = pos/(Status.world)*100;

		bar.style.height = Status.barPos + '%';

		let roomLimit = Status.room[Status.touchDir == 'prev' ? Status.index-1 : Status.index];

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

		let $items = $(items.length ? items[Status.row] : items);

		Status.nextLimit = bodyHeight - $items.height();

		if (Status.nextLimit > $items.offset().top) {

			SCOPE.next();
		}

		return this;
	}

	pull (arg) {
		
		const SCOPE = this;

		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		let month = SCOPE.select(Selector.completeMonth);

		let monthGroup = month.parentNode.children;

		for (let i=0; i<monthGroup.length; i++) {

			monthGroup[i].setAttribute('class', 'of');
		}

		monthGroup[Status.index].setAttribute('class', 'ov');

		return this;
	}

	lithener () {
		// 다음 페이지를 가져올 때 이벤트를 다시 연결해야 하는 경우가 있기 때문에 기존 연결된 이벤트를 일단 삭제, 닥치고 삭제, 아 몰랑
		$DOCUMENT.off('.def').off('.touch').off('.wheel');

		const SCOPE = this;

		let Selector = SCOPE.option.selector;
		let Process = SCOPE.option.process;
		let Status = SCOPE.option.status;
		let Event = SCOPE.option.event;
		let Data = SCOPE.option.data;

		let body = SCOPE.select(Selector.body); // jquery 메서드를 사용하기 위해

		Status.touchDir = '';

	    Process.dir = delta => {
	        // 휠 방향 [ 1:위, -1:아래 ]
	        return (delta < 0) ? delta = 1 : delta = -1;
	    }

	    let handle = 0;

	    function renderLoop() {

	    	console.log(parseInt($bar[0].style.height));

	    	handle = window.requestAnimationFrame(renderLoop);
	    }

		// shift
		$DOCUMENT.on(
			Event.def, Selector.story_shift, function(event) {
				event.preventDefault();

				if (Status.render && Status.ani && Status.append) {

					renderLoop();

					let index = SCOPE.index(SCOPE.select(Selector.story_shift), this);

					$bar.stop(1, 0).animate({ 'height': ( index ? Status.room[index-1] : 0 ) + "%" }, 300, 'easeOutExpo', () => {

						window.cancelAnimationFrame(handle);
					});

					Status.index = index;

					SCOPE.pull();

					// 다음 json 데이터 요청 메서드 여기서 실행
					/* function ;*/ SCOPE.move()
				}
			}
		);

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
	    	Event.wheel, Selector.body, function(event) {
	    		event.preventDefault();

	    		if (Status.render && Status.ani && Status.append) {

			        let saveDir = null;

			        if(event.originalEvent.wheelDelta != undefined) {

			            saveDir = Process.dir(event.originalEvent.wheelDelta*-1); // IE, CROME, SFARI
			        }else{

			            saveDir = Process.dir(event.originalEvent.detail); // FF
			        }

			        Status.touchDir = saveDir > 0 ? 'prev' : 'next';

			        body.style.transform = 'translateY('+(() => {

						if (Status.touchDir === 'prev') {

							Status.moveLength += 100;
						}

						if (Status.touchDir === 'next') {

							Status.moveLength -= 100;
						}

						return Status.moveLength;

					})()+'px)';

					SCOPE.move();
		    	}
	    	}
	    );

	    // $DOCUMENT.on(
	    // 	Event.touch, Selector.body, function(event) {

	    // 		if (Status.append) {

	    // 			return false;
	    // 		}

	    // 		if(event.type == "touchstart") {

	    // 			SCOPE.select(Selector.body).style.transitionDuration = '0ms';

	    // 			Status.start = Math.floor(event.originalEvent.changedTouches[0].clientY);
					// Status.half = Status.roomWorld[Status.index]/2;
	    // 		}

	    // 		if( event.type == "touchmove") {

	    // 			Status.move = Math.floor(event.originalEvent.changedTouches[0].clientY) - Status.start;

			  //   	Status.range = Status.move - Status.prev;

					// body.style.top = parseInt(body.style.top) + Status.range + 'px';

					// if(Status.range < 0){
					// 	Status.touchDir = 'prev';
					// }

					// if(Status.range > 0){
					// 	Status.touchDir = 'next';
					// }

					// Status.prev = Status.move;
	    // 		}

	    // 		if(event.type == "touchend") {

	    // 			Status.prev = 0;

					// SCOPE.move();

	    // 		}
	    // 	}
	    // );
	}

	resizebled () {

		const SCOPE = this;

		let Status = SCOPE.option.status;

		Status.resizebled = false;

		return this;
	}

	resize (callback) {

		const SCOPE = this;

		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		let items = SCOPE.select(Selector.item);
		let itemsLen = items.length;

		for (let i=0; i<itemsLen; i++) {
			items[i].style.transitionProperty = 'top, left';
		}

		Status.resizebled = true;

		return SCOPE.returnCall(callback);
	}

	transform (arg, callback) {

		const SCOPE = this;

		let Selector = SCOPE.option.selector;
		let Status = SCOPE.option.status;

		if (Status.ani) {

			if (arg != null) {

				let attrStringArray = [ 'ver_1', 'ver_2' ];

				if (SCOPE.hasAttr(Selector.parent, 'class', attrStringArray[arg])) {

					return null;
				}
			}

			Status.ani = false;

			let parent = SCOPE.select(Selector.parent);

			parent.style.transitionProperty = 'transform, opacity';
			parent.style.transitionDuration = '300ms';
			parent.style.opacity = 0;

			let items = SCOPE.select(Selector.item);
			let itemsLen = items.length;

			for (let i=0; i<itemsLen; i++) {
				items[i].style.transitionProperty = 'transform, opacity';
				items[i].style.transform = 'translateY(-100px)';
				items[i].style.transitionDelay = '0ms';
				items[i].style.opacity = 0;
			}

			setTimeout(() => {

				if(arg == 0) {

					parent.setAttribute('class', 'grid ver_1');
				}

				if(arg == 1) {

					parent.setAttribute('class', 'grid ver_2');
				}

			}, 400);

			setTimeout(() => {

				parent.style.opacity = 1;

				Status.transform = true;

				SCOPE.returnCall(callback);

				Status.ani = true;

			}, 600);
		}

		return this;
	}

	shift (arg) {

		return this;
	}

	next (arg) {
		// 이 메서드는 위치 계산 완료 후, 혹은 정렬 애니메이션 완료 후에 호출
		// *완료 후 상태를 판단하고 처리한다

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

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
			let bar = SCOPE.select(Selector.story_bar);
			let month = SCOPE.select(Selector.story_month);
			let body = SCOPE.select(Selector.body);

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
			body.style.transitionDuration = '300ms';

			setTimeout(() => {

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
				/* function */ SCOPE.render([ 'bind', 'append', 'lithener', 'pull' ]);

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
					/* function */ SCOPE.returnCall([ 'bind', 'append', 'lithener' ]);
				}
			}
		}

		return this;
	}

	ani (arg) {

		const SCOPE = this;

		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		let group = Status.completeGroup;
		let groupLen = group.length;

		for (let i=0; i<groupLen; i++) {

			let $items = $(group[i]+'\u0020'+Selector.item);
			let $itemsLen = $items.length;

			for (let j=0; j<$itemsLen; j++) {

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

		let timeout = null;

		timeout = setTimeout(() => {

			Status.ani = true;
		}, aniTime);

		return this;
	}

	sort (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		for (let i=0; i<Status.completeGroup.length; i++) {

			if ( Status.resizebled || i === SCOPE.option.page) {

				let $items = $(Status.completeGroup[i]+'\u0020'+Selector.item);
				let $itemsLen = $items.length;

				let parent = SCOPE.select(Selector.parent);
				let body = SCOPE.select(Selector.body);

				var grid = [[]]; // grid[0][0] = x , grid[1][0] = y : (y는 동적 생성)

				let cnt = { w: 0, h: 0, n: 0, y: 0 };

				let map = {
					iwidth: $items[0].offsetWidth,
					iworld: body.clientWidth
				};

				// 너비 한계선
				for(let j=0; j<$itemsLen; j++){

					// 너비 한계치에 도달하면
					if(map.iwidth*(cnt.w+1) > map.iworld){

						cnt.h++; // 높이 단계 값 증가

						grid[cnt.h] = []; // 높이 단계 증가시 배열 추가

						// 한계치 도달점을 기준으로 현재까지의 각 목록의 높이를 여백을 포함하여 배열 저장
						for(let k=cnt.n; k<cnt.n+cnt.w; k++){

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

				Status.row = $itemsLen-1;

				let countAll = 0;
				let count = [];

				// 저장된 데이터의 총 카운터를 구해 전체를 구하고, 각 그룹의 리스트 카운터로 각 그룹의 전체를 구한다.
				// 일부/전체*100 의 공식으로 전체에 대한 일부의 퍼센테이지를 구한다.

				for (let i=0; i<Data.resLen; i++) {

					countAll += Data.response[i].count;
					count[i] = Data.response[i].count;
				}

				Status.world = countAll/grid[0].length*$items[0].offsetHeight;
				Status.roomWorld = [];
				Status.room = [];

				let monthGroup = SCOPE.select(Selector.story_month).children;

				for (let i=0; i<monthGroup.length; i++) {

					let room = count[i]/countAll*100;

					Status.room[i] = i ? Status.room[i-1] + room : room;
					Status.roomWorld[i] = Math.ceil(count[i]/grid[0].length)*$items[0].offsetHeight;

					monthGroup[i].style.height = room + '%';
				}

				// 전체 행 갯수 * 아이템 하나의 높이 = 전체 높이, 모든 카드의 크키가 같으면 편하지 ^_^♡
				parent.style.height = countAll * $items[0].offsetHeight + 'px';

				SCOPE.select(Status.completeGroup[i]).style.height = Status.roomWorld[i] + 'px';
			}
			else{
				continue;
			}
		}

		grid = null;

		return this;
	}

	bind (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		// SCOPE.option.count 만큼 처리할 배열에서 제외하고 복사
		// slice는 깊은 복사이기 때문에 원본은 유지된다
		let list = Data.response[SCOPE.option.page].list.slice(SCOPE.option.count);
		let listLen = list.length < SCOPE.option.limit ? list.length : SCOPE.option.limit;

		// 매번 주소가 다른 객체를 벹어줘야 한다
		let Str = SCOPE.storage();
		let _Str = SCOPE._storage({ list: [] });

		let i = 0;

		Data.completeStory = '';
		Data.completeList = '';

		(function keyBind(_val){

			_Str.list[i] = Str.list;

			for(let key in list[i]) {

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
					let dateSplit = list[i].date.split('-');

					var y = dateSplit[0];
					var m = dateSplit[1];
					var d = dateSplit[2];

					list[i].date = SCOPE.option.month_string[Number(m)-1]+'\u0020'+d+',\u0020'+y;
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

				Data.completeMonth = (() => {

					if (SCOPE.option.page > 0) {
						return '';
					}

					let _Str = SCOPE._storage({ month: '' });

					for (let i=0; i<Data.resLen; i++) {

						let _y = m-i ? y : y-1;
						let _m = m-i ? m-i : 12;

						_Str.month += Str.month({ y: String(_y), m: String(_m) });
					}

					return _Str.month;
				})();

				// 생성된 그룹 셀렉터 저장	
				if (Status.completeGroup.length-1 != SCOPE.option.page) {
					Selector.completeGroup = '#group'+(y + m);
					Status.completeGroup[SCOPE.option.page] = Selector.completeGroup;

				}

				// 생성된 버튼 셀렉터 저장
				if (Status.complete.length-1 != SCOPE.option.page) {
					Selector.completeMonth = '#month'+(y + m);
					Status.complete[SCOPE.option.page] = Selector.completeMonth;

				}
			}

			return 1;
		})(0);


		return SCOPE;
	}

	append (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		let select = '';
		let completeBind = '';

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

		let img = $(Selector.completeGroup+'\u0020'+Selector.img);
		let imgLen = img.length;

		// 로드 완료 된 img 가 limit 보다 작을때 재귀 후 콜백 리스트 실행
		(function loop(_val) {

			for (let i=_val; i<imgLen; i++) {

				if (img[i].complete) {

					_val++;
				}
				else {
					break;
				}
			}

			if (_val < imgLen) {

				return setTimeout(function () {

					loop(_val);
				},10);

			} else {

				Status.append = true;
				Status.render = true;

				let body = SCOPE.select(Selector.body);

				body.style.transitionProperty = 'transform';
				body.style.transitionDuration = '300ms';

				// 재귀 종료 지점 콜백 리스트 실행
				SCOPE.returnCall(SCOPE.option.completeFunctionList);
			}

		})(SCOPE.option.count ? SCOPE.option.count-1 : 0);

		return SCOPE;
	}

	render (callback) {

		const SCOPE = this;

		let Status = SCOPE.option.status;
		let Reuqest = SCOPE.option.request;

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

		return SCOPE.request(res => {

			SCOPE.option.data.response = res;

			SCOPE.option.data.resLen = res.length;

			SCOPE.option.data.config = res.config;

			return SCOPE.returnCall(callback);
		});
	}
}

window.$UI_PINTEREST = new main({/* user only => _config.js */});