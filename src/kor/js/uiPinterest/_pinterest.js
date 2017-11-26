import Config from './_config';

class main extends Config {

	lithener () {

	}

	resizebled (callback) {

		const SCOPE = this;

		let Data = SCOPE.option.data;

		for (let i=0; i<Data.itemsLen; i++) {
			Data.items[i].style.transitionProperty = 'top, left';
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

			parent.style.transitionProperty = 'transform, top, left, opacity';
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

		if (SCOPE.option.count === Data.response[SCOPE.option.page].count) {

			if (SCOPE.option.page < Data.response.length) {

				// 현제 추가된 된 list 갯수가, 요청된 page 의 list 갯수와 일치하면 다음 그룹으로 넘어가고
				// 현재 진행중인 page 카운트가 작으면, 만족할 때까지 증가
				// 이것은 다음달 리스트를 불러오기 위한 판단기준이 된다
				SCOPE.option.page++;
			}
			else {

				// 다음달 리스트 가져오는 메서드 여기서 실행
			}
		}

		return this;
	}

	ani (arg) {

		const SCOPE = this;

		let Selector = SCOPE.option.selector;

		SCOPE.select(Selector.completeGroup).style.opacity = 1;

		let items = SCOPE.select(Selector.item);
		let itemsLen = items.length;

		for (let i=0; i<itemsLen; i++) {

			items[i].style.transform = 'translateY(0)';
			items[i].style.opacity = 1;
			items[i].style.transitionDelay = (30*i)+'ms';
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

		let grid = [[]]; // grid[0][0] = x , grid[1][0] = y : (y는 동적 생성)

		let map = {
			iwidth: items[0].offsetWidth,
			iworld: parent.clientWidth
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

			items[i].style.top = (cnt.h > 0 ? grid[cnt.h][cnt.w] : 0) + 'px';
			items[i].style.left = grid[0][cnt.w] + 'px';

			cnt.w++;
		}

		// 마지막 행 + 아이템 하나의 높이 = 전체 높이
		// 모든 카드의 크키가 같으면 편하지
		parent.style.height = grid[grid.length-1][0] + items[0].offsetHeight + 'px';

		grid = null;

		return this;
	}

	bind (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;

		// 다음 화면 호출시 증가된 SCOPE.option.count 로 다음 달 데이터 불러옴

		let list = Data.response[SCOPE.option.page].list;
		let listCnt = Data.response[SCOPE.option.page].count;

		let Str = SCOPE.storage();
		let _Str = SCOPE._storage({ list: [], history: '', month: '' });

		let i = 0;

		Data.completeBind = '';

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

			Data.completeBind += _Str.list[i];

			i++;

			if (i < SCOPE.option.limit) {

				return keyBind(0);
			} 
			else {

				Data.completeBind = '\n'+function () {

					if (SCOPE.option.count != 0) {
						return '';
					}

					_Str.history = Str.history;

					for (let i=0; i<Data.response.length; i++) {
						
						_Str.month += Str.month({ y: y, m: m-i });
					}

					return _Str.history.replace(SCOPE.reg('month'), _Str.month);
				}()+
				'\n<div class="group" id="group'+(y+m)+'" style="opacity:0">'+Data.completeBind+'</div>';

				// 생성된 그룹 저장	
				Selector.completeGroup = '#group'+(y+m);
			}

			return 1;
		})(0);


		return SCOPE;
	}

	append (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;

		// 추가
		SCOPE.select(Selector.parent).innerHTML += Data.completeBind;

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

		let Data = SCOPE.option.data;
		
		// 새로 불러오면 초기화
		SCOPE.option.count = 0;

		// 새것은 새그릇에
		Data.response = null;
		Data.completeBind = null;

		return SCOPE.request(res => {

			Data.response = res;

			return SCOPE.returnCall(callback);
		});
	}
}

window.$UI_PINTEREST = new main({/* user only => _config.js */});