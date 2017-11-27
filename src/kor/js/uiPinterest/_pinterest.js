import Config from './_config';

class main extends Config {

	pull (arg) {
		
		const SCOPE = this;

		let Data = SCOPE.option.selector;
		let Selector = SCOPE.option.selector;

		let month = SCOPE.select(Selector.completeMonth);

		month.style.transitionProperty = 'top';
		month.style.transitionDuration = '400ms';
		month.style.transitionTimingFunction = 'ease-in-out';

		let monthGroup = month.parentNode.children;

		for (let i=0; i<monthGroup.length; i++) {
			monthGroup[i].setAttribute('class', 'of');
		}

		let index = SCOPE.index(monthGroup, month);

		month.setAttribute('class', 'ov');

		month.style.top = (index ? 30 * (index+1) : 30) + 'px';

		return this;
	}

	lithener () {
		// 다음 페이지를 가져올 때 이벤트를 다시 연결해야 하는 경우가 있기 때문에 기존 연결된 이벤트를 일단 삭제, 닥치고 삭제, 아 몰랑
		$DOCUMENT.off('.def').off('.touch').off('.wheel');

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;
		let Process = SCOPE.option.process;
		let Status = SCOPE.option.status;
		let Event = SCOPE.option.event;

		let $body = $(Selector.body); // jquery 메서드를 사용하기 위해
		let groups = SCOPE.select(Selector.group); // jquery constructor 빼고 가볍게
		let groupsLen = groups.length;

		Process.index = getValue => {

			switch(getValue) {
				case 'prev' :
					if(Data.index > 0) {
						Data.index--;
					}
					else{
						Data.index = groupsLen-1;
					}

					break;

				case 'next' :
					if(Data.index < groupsLen-1) {
						Data.index++;
					}
					else{
						Data.index = 0;
					}

					break;
				default : return Data.index; break;
			}
		}

		Process.move = getValue => {

			if(getValue.useShield) {
				if($body.is(':animated')) {
					return false;

				}
			}

			if (getValue.order === 'prev') {

			}

			if (getValue.order === 'next') {

			}

			return 1;
		}

	    Process.dir = delta => {
	        // 휠 방향 [ 1:위, -1:아래 ]
	        return (delta < 0) ? delta = 1 : delta = -1;
	    }

	    // 클릭 구간 건너띄기
		$DOCUMENT.on(Event.def, Selector.control, function(event) {
			event.preventDefault();

			let getValue = $(this).data('control');

			return Process.move({ 
				order: getValue, 
				useShield: 0
			});
		});

		// 마우스 휠
	    $DOCUMENT.on(
	    	Event.wheel, Selector.body, function(event) {
	    		event.preventDefault();

		        let saveDir = null;

		        if(event.originalEvent.wheelDelta != undefined) {

		            saveDir = Process.dir(event.originalEvent.wheelDelta*-1); // IE
		        }else{

		            saveDir = Process.dir(event.originalEvent.detail); // FF,CROME,SFARI
		        }

		        let order = saveDir > 0 ? 'prev' : 'next';

				$body.css({
					'top': ((_val) =>{

						if (order === 'prev') {

							_val = '-='+50;
						}

						if (order === 'next') {

							_val = '+='+50;
						}

						return _val;
					})()

				});

				Process.move({

					order: order,
					useShield: 1
				});
	    	}
	    );

	    // 터치, 드래그, 마우스복합
		Data.swipe = {
			prev: 0, 
			next: 0

		};

		Data.touchDir = '';
		Data.mouseDown = false;

	    $DOCUMENT.on(
	    	Event.touch, Selector.body, function(event) {

	    		if (event.typ == "drag") {
	    			event.preventDefault();

	    		}

	    		if(!Data.mouseDown && ( event.type == "touchstart" || event.type == "mousedown" )) {

	    			Data.mouseDown = true;
	    			Data.start = Math.floor(event.pageY);
					Data.half = $body[Data.index].offsetHeight/2;
	    		}

	    		if(Data.mouseDown && ( event.type == "touchmove" || event.type == "mousemove" )) {
	    			event.preventDefault();

	    			Data.move = Math.floor(event.pageY) - Data.start;

			    	Data.range = Data.move - Data.prev;

					$body.css({
						'top': '+='+ function(){

							var result = Data.range;

							if(Data.range < 0){
								Data.swipe.next = 0;
								Data.swipe.prev += result;

				    			if(Data.half < Data.swipe.prev*-1) {
									Data.touchDir = 'next';
				    			}
							}

							if(Data.range > 0){
								Data.swipe.prev = 0;
								Data.swipe.next += result;

				    			if(Data.half < Data.swipe.next) {
									Data.touchDir = 'prev';
				    			}
							}

							return result;
						}()

					});

					Data.prev = Data.move;
	    		}

	    		if(Data.mouseDown && ( event.type == "touchend" || event.type == "mouseup" || event.type == "mouseleave" )) {

	    			Data.mouseDown = false;

	    			Data.prev = 0;

					Data.swipe = {
						prev: 0, 
						next: 0

					};

					Data.touchDir = '';
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
		let Selector = SCOPE.option.selector;

		if (SCOPE.option.count < Data.response[SCOPE.option.page].count) {

			// 추가한 list 갯수가 모자랄 때 남은 목록 limit 만큼 또 추가
			/* function */ SCOPE.returnCall([ 'bind', 'append' ]);
		}
		else {

			if (SCOPE.option.page < Data.response.length) {

				// 현제 추가된 된 list 갯수가, 요청된 page 의 list 갯수와 일치하면 다음 그룹으로 넘어가고
				// 현재 진행중인 page 카운트가 작으면, 만족할 때까지 증가
				// 이것은 다음달 리스트를 불러오기 위한 판단기준이 된다

				SCOPE.option.page++;

				// 다음달 리스트 가져오기 전 초기화
				SCOPE.option.count = 0;

				// 다음달 리스트 가져오는 메서드 여기서 실행
				/* function */ SCOPE.returnCall(['bind', 'append', 'lithener' ]);

			}
			else {
				// 요청 시작하기 전 초기화
				SCOPE.option.count = 0;

				// 새것은 새그릇에
				Data.response = null;
				Data.completeStory = null;
				Data.completeList = null;

				// 다음 json 데이터 요청 메서드 여기서 실행
				/* function */ SCOPE.returnCall([/* 필요한 메서드 이름 추가 */]);
			}
		}

		return this;
	}

	ani (arg) {

		const SCOPE = this;

		let Selector = SCOPE.option.selector;

		SCOPE.select(Selector.completeGroup).style.opacity = 1;

		let items = $(Selector.item);
		let itemsLen = items.length;

		for (let i=0; i<itemsLen; i++) {

			items[i].style.transform = 'translateY(0)';
			items[i].style.opacity = '1';
			items[i].style.transitionDelay = (30*(i-(itemsLen-SCOPE.option.limit)))+'ms';
			items[i].style.transitionDuration = '300ms';
			items[i].style.transitionProperty = 'transform, opacity';
		}

		// count 저장
		SCOPE.option.count = items.length;

		return this;
	}

	sort (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;

		// 재귀 종료지점, 정렬 시작
		let items = SCOPE.select(Selector.item);
		let itemsLen = items.length;

		let parent = SCOPE.select(Selector.parent);
		let body = SCOPE.select(Selector.body);
		let group = SCOPE.select(Selector.completeGroup);

		let grid = [[]]; // grid[0][0] = x , grid[1][0] = y : (y는 동적 생성)

		let map = {
			iwidth: items[0].offsetWidth,
			iworld: body.clientWidth
		};

		let cnt = { w: 0, h: 0, n: 0, y: 0, max: 0 };

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
		}

		// 전체 행 갯수 * 아이템 하나의 높이 = 전체 높이, 모든 카드의 크키가 같으면 편하지 ^_^♡
		parent.style.height = grid.length * items[0].offsetHeight + 'px';

		if (SCOPE.option.count == 0) {
			// 데이터로 가지고 있는 현재 그룹의 리스트 전체에 대한 높이 
			let count = Data.response[SCOPE.option.page].count;

			let num = 0;

			for (let i=0; i<count; i++) {

				if (i % cnt.w == 0) {

					num = i;
				}
			}

			// 1부터 시작하는 카운트와 동일한 조건이어야 하기 때문에
			// 0부터 시작하는 index 결과에 1 증가시킨다
			num++;

			// 여기 가지의 결과가 10 일때 나누어 떨어진 값이 정수가 아니면 올림처리
			cnt.max =  Math.ceil(num/cnt.w) * items[0].offsetHeight;

			group.style.height = cnt.max + 'px';
		}

		grid = null;

		return this;
	}

	bind (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
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

					for (let i=0; i<Data.response.length; i++) {
						
						_Str.month += Str.month({ y: y, m: m-i });
					}

					return _Str.month;
				})();

				// 생성된 그룹 셀렉터 저장	
				Selector.completeGroup = '#group'+(y+m);
				// 생성된 버튼 셀렉터 저장
				Selector.completeMonth = '#month'+(y+m);
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

			return SCOPE.returnCall(callback);
		});
	}
}

window.$UI_PINTEREST = new main({/* user only => _config.js */});