import Config from './_config';

class main extends Config {

	move (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		let body = SCOPE.select(Selector.body);
		let items = SCOPE.select(Selector.item);
		let month = SCOPE.select(Selector.completeMonth);
		let bar = SCOPE.select(Selector.process_bar);

		// 내용이 위로 올라갈 때 음수가 양수가 되는것이 생각하기 편하다
		let pos = Math.ceil(parseInt(getComputedStyle(body).top))*-1;
		let duration = parseInt(getComputedStyle(body).transitionDuration);

		let shield = true;

		if (pos < 0 ) {

			if (shield) {

				setTimeout(() => {

					shield = true;

					body.style.top = 0;
					body.style.transitionDuration = '150ms';

				}, 150);
			}

			shield = false;
		}
		else {

			if (duration == 0) {

				body.style.transitionDuration = '70ms';
				body.style.transitionProperty = 'top';
			}
		}

		Status.barPos = Math.ceil(pos/Status.world*100);

		bar.style.height = Status.barPos + '%';

		Status.nextLimit = SCOPE.select('body').clientHeight - items[Status.row].offsetHeight;

		let nextBindLimit = 0;

		let lastComplete = Status.complete[Data.resLen-1];

		for (let i=0; i<SCOPE.option.page; i++) {

			nextBindLimit += parseInt(SCOPE.select(Status.complete[i]).style.height);
		}
		
		if (lastComplete) {

			if (SCOPE.hasAttr(lastComplete, 'class', 'ov')) {

				nextBindLimit = 100;
			}
		}

		Status.next = Status.barPos > nextBindLimit;

		if (Status.next) {

			SCOPE.pull();
		}

		if (Status.nextLimit > $(items[Status.row]).offset().top) {

			SCOPE.next();
		}

		return this;
	}

	pull (arg) {
		
		const SCOPE = this;

		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		if (!Status.ani) {
			return false;
		}

		let month = SCOPE.select(Selector.completeMonth);

		let monthGroup = month.parentNode.children;

		for (let i=0; i<monthGroup.length; i++) {

			monthGroup[i].setAttribute('class', 'of');
		}

		month.setAttribute('class', 'ov');

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

		let $body = $(Selector.body); // jquery 메서드를 사용하기 위해

	    Process.dir = delta => {
	        // 휠 방향 [ 1:위, -1:아래 ]
	        return (delta < 0) ? delta = 1 : delta = -1;
	    }

	    // 클릭 구간 건너띄기
		$DOCUMENT.on(Event.def, Selector.control, function(event) {
			event.preventDefault();

		});

		// 마우스 휠
	    $DOCUMENT.on(
	    	Event.wheel, Selector.body, function(event) {
	    		event.preventDefault();

	    		if (!Status.ani) {

	    			return false;
	    		}

		        let saveDir = null;

		        if(event.originalEvent.wheelDelta != undefined) {

		            saveDir = Process.dir(event.originalEvent.wheelDelta*-1); // IE
		        }else{

		            saveDir = Process.dir(event.originalEvent.detail); // FF,CROME,SFARI
		        }

		        let order = saveDir > 0 ? 'prev' : 'next';

				$body.css({
					'top': ((_val) =>{

						if (order === 'next') {

							_val = '-='+100;
						}

						if (order === 'prev') {

							_val = '+='+100;
						}

						return _val;
					})()

				});

				SCOPE.move();
	    	}
	    );

	    // 터치, 드래그, 마우스복합
		Status.swipe = {
			prev: 0, 
			next: 0

		};

		Status.touchDir = '';

	    $DOCUMENT.on(
	    	Event.touch, Selector.body, function(event) {

	    		if (!Status.ani) {

	    			return false;
	    		}

	    		if(event.type == "touchstart") {

	    			SCOPE.select(Selector.body).style.transitionDuration = '0ms';

	    			Status.start = Math.floor(event.originalEvent.changedTouches[0].clientY);
					Status.half = $body[Status.index].offsetHeight/2;
	    		}

	    		if( event.type == "touchmove") {

	    			Status.move = Math.floor(event.originalEvent.changedTouches[0].clientY) - Status.start;

			    	Status.range = Status.move - Status.prev;

					$body.css({
						'top': '+='+ function(){

							var result = Status.range;

							if(Status.range < 0){
								Status.swipe.next = 0;
								Status.swipe.prev += result;

				    			if(Status.half < Status.swipe.prev*-1) {
									Status.touchDir = 'next';
				    			}
							}

							if(Status.range > 0){
								Status.swipe.prev = 0;
								Status.swipe.next += result;

				    			if(Status.half < Status.swipe.next) {
									Status.touchDir = 'prev';
				    			}
							}

							return result;
						}()

					});

					Status.prev = Status.move;
	    		}

	    		if(event.type == "touchend") {

	    			Status.prev = 0;

					Status.swipe = {
						prev: 0, 
						next: 0

					};

					Status.touchDir = '';

					SCOPE.move();
	    		}
	    	}
	    );
	}

	resizebled (callback) {

		const SCOPE = this;

		let Selector = SCOPE.option.selector;

		let items = SCOPE.select(Selector.item);
		let itemsLen = items.length;

		for (let i=0; i<itemsLen; i++) {
			items[i].style.transitionProperty = 'top, left';
			items[i].style.transitionDelay = 100 +'ms';
		}

		return SCOPE.returnCall(callback);
	}

	transform (arg, callback) {

		const SCOPE = this;

		let Selector = SCOPE.option.selector;
		let Status = SCOPE.option.status;

		if (Status.ani) {

			let attrStringArray = [ 'ver_1', 'ver_2' ];

			if (SCOPE.hasAttr(Selector.parent, 'class', attrStringArray[arg])) {

				return null;
			}

			Status.ani = false;

			let parent = SCOPE.select(Selector.parent);

			parent.style.transitionProperty = 'transform, opacity';
			parent.style.transitionDuration = '300ms';
			parent.style.opacity = 0;

			let items = SCOPE.select(Selector.item);
			let itemsLen = items.length;

			for (let i=0; i<itemsLen; i++) {
				items[i].style.transform = 'translateY(-100px)';
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

				SCOPE.returnCall(callback);

				Status.ani = true;

			}, 600);
		}

		return this;
	}

	next (arg) {
		// 이 메서드는 위치 계산 완료 후, 혹은 정렬 애니메이션 완료 후에 호출
		// *완료 후 상태를 판단하고 처리한다

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		if (SCOPE.option.page < Data.resLen-1) {

			if (SCOPE.option.count < Data.response[SCOPE.option.page].count) {

				// 추가한 list 갯수가 모자랄 때 남은 목록 limit 만큼 또 추가
				/* function */ SCOPE.returnCall([ 'bind', 'append' ]);
			}
			else {

				// 현제 추가된 된 list 갯수가, 요청된 page 의 list 갯수와 일치하면 다음 그룹으로 넘어가고
				// 현재 진행중인 page 카운트가 작으면, 만족할 때까지 증가
				// 이것은 다음달 리스트를 불러오기 위한 판단기준이 된다

				// if (!Status.next) {
				// 	return false;
				// }

				SCOPE.option.page++;

				// 다음달 리스트 가져오기 전 초기화
				SCOPE.option.count = 0;

				// 다음달 리스트 가져오는 메서드 여기서 실행
				/* function */ SCOPE.returnCall(['bind', 'append', 'lithener' ]);
			}
		}
		else{

			Status.nextLimit = 0;
			Status.next = false;
			Status.ani = false;

			//  시각요소 초기화
			let bar = SCOPE.select(Selector.process_bar);
			let month = SCOPE.select(Selector.story_month);
			let body = SCOPE.select(Selector.body);
			let parent = SCOPE.select(Selector.parent);

			bar.style.top = '100px';
			bar.style.opacity = '0';
			bar.style.transitionDuration = '1000ms';
			bar.style.transitionTimingFunction = 'ease-in-out';

			month.style.top = '100px';
			month.style.opacity = 0;
			month.style.transitionProperty = 'opacity, top';
			month.style.transitionDuration = '300ms';

			body.style.opacity = 0;
			body.style.transitionDuration = '300ms';
			body.style.transitionProperty = 'opacity';

			setTimeout(() => {

				bar.style = '';

				SCOPE.option.page = 0;
				SCOPE.option.count = 0;

				// 새것은 새그릇에
				Data.response = null;
				Data.completeStory = null;
				Data.completeList = null;

				for (let i=0; i<Status.complete.length; i++) {

					month.removeChild(SCOPE.select(Status.complete[i]));
				}

				for (let i=0; i<Status.completeGroup.length; i++) {

					body.removeChild(SCOPE.select(Status.completeGroup[i]));
				}

				month.style.top = 0;
				month.style.opacity = 1;

				body.style.top = 0;
				body.style.opacity = 1;

				Status.complete = [];
				Status.completeGroup = [];

				// 다음 json 데이터 요청 메서드 여기서 실행
				/* 요쳥 url 변경 */ SCOPE.option.request.url = '/kor/js/uiPinterest/xhr/list.json';
				/* function */ SCOPE.render([ 'bind', 'append', 'lithener', 'pull' ]);

			}, 1000);

		}

		return this;
	}

	ani (arg) {

		const SCOPE = this;

		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		SCOPE.select(Selector.completeGroup).style.opacity = 1;

		let items = $(Selector.item);
		let itemsLen = items.length;

		for (let i=0; i<itemsLen; i++) {

			var aniTime = (30*(i-(itemsLen-SCOPE.option.limit)));

			items[i].style.transform = 'translateY(0)';
			items[i].style.opacity = '1';
			items[i].style.transitionDelay = (30*(i-(itemsLen-SCOPE.option.limit)))+'ms';
			items[i].style.transitionDuration = '300ms';
			items[i].style.transitionProperty = 'transform, opacity';
		}

		// count 저장
		SCOPE.option.count = items.length;

		let timeout = null;

		clearTimeout(timeout);
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

		// 재귀 종료지점, 정렬 시작
		let items = SCOPE.select(Selector.item);
		let itemsLen = items.length;

		let parent = SCOPE.select(Selector.parent);
		let body = SCOPE.select(Selector.body);

		let grid = [[]]; // grid[0][0] = x , grid[1][0] = y : (y는 동적 생성)

		let map = {
			iwidth: items[0].offsetWidth,
			iworld: body.clientWidth
		};

		let cnt = { w: 0, h: 0, n: 0, y: 0 };

		// 너비 한계선
		for(let i=0; i<itemsLen; i++){
			// 너비 한계치에 도달하면
			if(map.iwidth*(cnt.w+1) > map.iworld){

				cnt.h++; // 높이 단계 값 증가

				grid[cnt.h] = []; // 높이 단계 증가시 배열 추가

				// 한계치 도달점을 기준으로 현재까지의 각 목록의 높이를 여백을 포함하여 배열 저장
				for(let k=cnt.n; k<cnt.n+cnt.w; k++){

					cnt.i = items[k].offsetHeight;

					grid[cnt.h][cnt.y] = (cnt.h > 1) ? cnt.i + grid[cnt.h-1][cnt.y] : cnt.i;

					cnt.y++;
				}

				cnt.n += cnt.w;
				cnt.y = 0;
				cnt.w = 0; // 너비 한계값 초기화
			}

			grid[0][cnt.w] = map.iwidth*(cnt.w); // x 좌표

			items[i].style.top = ((cnt.h > 0 ? grid[cnt.h][cnt.w] : 0)) + 'px';
			items[i].style.left = grid[0][cnt.w] + 'px';

			cnt.w++;

			if (i%cnt.w == 0) {
				// 마지막행 첫번째 index
				Status.row = i;
			}
		}

		if (SCOPE.option.count == 0) {

			let countAll = 0;
			let count = [];
			
			// 저장된 데이터의 총 카운터를 구해 전체를 구하고, 각 그룹의 리스트 카운터로 각 그룹의 전체를 구한다.
			// 일부/전체*100 의 공식으로 전체에 대한 일부의 퍼센테이지를 구한다.

			for (let i=0; i<Data.resLen; i++) {

				countAll += Data.response[i].count;
				count[i] = Data.response[i].count;
			}

			Status.world = countAll/cnt.w*items[0].offsetHeight;
			Status.roomWorld = [];
			Status.room = [];

			let monthGroup = SCOPE.select(Selector.story_month).children;
			let monthGroupSum = 0;

			for (let i=0; i<monthGroup.length; i++) {

				Status.room[i] = count[i]/countAll*100;
				Status.roomWorld[i] = count[i]/cnt.w*items[0].offsetHeight;

				monthGroupSum += Status.room[i];

				monthGroup[i].style.height = Status.room[i] + '%';
			}

			// 전체 행 갯수 * 아이템 하나의 높이 = 전체 높이, 모든 카드의 크키가 같으면 편하지 ^_^♡
			parent.style.height = countAll * items[0].offsetHeight + 'px';

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

		// 매번 주소가 다른 객체를 벹어줘야 한다
		let Str = SCOPE.storage();
		let _Str = SCOPE._storage({ list: [] });

		let i = 0;

		Data.completeStory = '';
		Data.completeList = '';

		(function keyBind(_val){

			_Str.list[i] = Str.list;

			for(let key in list[i]) {

				if (key == 'img') {
					// list.img 비어 있으면 페이크 이미지
					if (!list[i].img.length) {
						
						list[i].img = SCOPE.option.no_img;
					}
				}

				if (key == 'date') {
					// list.date 가공
					let dateSplit = list[i].date.split('-');

					var y = dateSplit[0];
					var m = dateSplit[1];
					var d = dateSplit[2];

					list[i].date = SCOPE.option.month_string[Number(m)-1].toUpperCase()+'\u0020'+d+',\u0020'+y;
				}

				_Str.list[i] = _Str.list[i].replace( SCOPE.reg(key), list[i][key] );

				_val++;
			}

			Data.completeList += _Str.list[i];

			i++;

			if (i < SCOPE.option.limit) {

				return keyBind(0);
			} 
			else {

				Data.completeMonth = (() => {

					if (SCOPE.option.page > 0) {
						return '';
					}

					let _Str = SCOPE._storage({ month: '' });

					for (let i=0; i<Data.resLen; i++) {
						
						_Str.month += Str.month({ y: y, m: m-i });
					}

					return _Str.month;
				})();

				// 생성된 그룹 셀렉터 저장	
				Selector.completeGroup = '#group'+(y+m);
				Status.completeGroup[SCOPE.option.page] = Selector.completeGroup;

				// 생성된 버튼 셀렉터 저장
				Selector.completeMonth = '#month'+(y+m);
				Status.complete[SCOPE.option.page] = Selector.completeMonth;
			}

			return 1;
		})(0);


		return SCOPE;
	}

	append (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
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
			completeBind = '\n<div style="opacity:0" class="group" id="'+Selector.completeGroup.substr(1)+'">'+Data.completeList+'\n</div>';

			// 추가된 다음달 추가
			SCOPE.select(Selector.story_month).innerHTML += Data.completeMonth;
		}

		// 처리된 상태 HTML 에 반영
		SCOPE.select(select).innerHTML += completeBind;

		let img = $(Selector.img).slice(SCOPE.option.count);
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

			if (_val < SCOPE.option.limit) {

				return setTimeout(function () {

					loop(_val);
				},1);
			} else {

				// 재귀 종료 지점 콜백 리스트 실행
				SCOPE.returnCall(SCOPE.option.completeFunctionList);
			}
		})(0);

		return SCOPE;
	}

	render (callback) {

		const SCOPE = this;

		return SCOPE.request(res => {

			SCOPE.option.data.response = res;

			SCOPE.option.data.resLen = res.length;

			return SCOPE.returnCall(callback);
		});
	}
}

window.$UI_PINTEREST = new main({/* user only => _config.js */});