import Requester from './_requester';

class main extends Requester {

	resizebled (callback) {

		const SCOPE = this;

		let Data = SCOPE.option.data;

		for (let i=0; i<Data.save.itemsLen; i++) {
			Data.save.items[i].style.transitionProperty = 'top, left';
		}

		if (callback) {
			
			for (let i=0; i<callback.length; i++) {

				SCOPE[callback[i]].call(SCOPE);
			}
		}

		return this;
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

			let parent = SCOPE.selector(Selector.parent);

			parent.style.transitionProperty = 'transform, top, left, opacity';
			parent.style.transitionDuration = '300ms';
			parent.style.opacity = 0;

			let items = SCOPE.selector(Selector.item);
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

				if (callback) {

					for (let i=0; i<callback.length; i++) {

						SCOPE[callback[i]].call(SCOPE);
					}
				}

				Status.ani = true;

			}, 600);
		}

		return this;
	}

	next (arg) {
		// 이 메서드는 모든 실행이 1회 완료 된 후 처리 되어야하는 상태를 판단하는 기준으로 활용할 값들을 변경하거나 초기화 한다.
		// 반드시 모든 콜백들보다 늦게 등장해야한다.

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Page = SCOPE.option.page;
		let Status = SCOPE.option.status;

		// Status.count 는 ani 가 실행 된 후에 증가
		if (Status.count === Data.response[Page.count].count) {

			// 저장되어 있는 전체 리스트들의 갯수 보디 작을때, 다음달 리스트를 불러오기 위해 Page.count 증가
			if (Page.count < Data.response.length) {
				Page.count++;

				// 초기롸 후 빠져나감
				Status.count = 0;
			}
		}

		return this;
	}

	ani (arg) {

		const SCOPE = this;

		let Status = SCOPE.option.status;
		let Selector = SCOPE.option.selector;

		SCOPE.selector(Selector.completeGroup).style.opacity = 1;

		let items = SCOPE.selector(Selector.item);
		let itemsLen = items.length;

		for (let i=0; i<itemsLen; i++) {

			items[i].style.transform = 'translateY(0)';
			items[i].style.opacity = 1;
			items[i].style.transitionDelay = (30*i)+'ms';
			items[i].style.transitionDuration = '300ms';
			items[i].style.transitionProperty = 'transform, opacity';
		}

		// count 저장
		Status.count = items.length;

		return this;
	}

	sort (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;

		// 재귀 종료지점, 정렬 시작
		Data.save.items = SCOPE.selector(Selector.item);
		Data.save.itemsLen = Data.save.items.length;

		let grid = [[]]; // grid[0][0] = x , grid[1][0] = y : (y는 동적 생성)

		let map = {
			iwidth:Data.save.items[0].offsetWidth,
			iworld:SCOPE.selector(Selector.parent).clientWidth
		};

		let cnt = { w:0, h:0, n:0, y:0, max:0 };

		// 너비 한계선
		for(let i=0; i<Data.save.itemsLen; i++){
			// 너비 한계치에 도달하면
			if(map.iwidth*(cnt.w+1) > map.iworld){

				cnt.h++; // 높이 단계 값 증가

				grid[cnt.h] = []; // 높이 단계 증가시 배열 추가

				// 한계치 도달점을 기준으로 현재까지의 각 목록의 높이를 여백을 포함하여 배열 저장
				for(let k=cnt.n; k<cnt.n+cnt.w; k++){
					cnt.i = Data.save.items[k].offsetHeight;

					grid[cnt.h][cnt.y] = (cnt.h > 1) ? cnt.i+grid[cnt.h-1][cnt.y] : cnt.i;

					cnt.y++;

				}

				cnt.n += cnt.w;
				cnt.y = 0;

				cnt.max = cnt.w;

				cnt.w = 0; // 너비 한계값 초기화

			}

			grid[0][cnt.w] = map.iwidth*(cnt.w); // x 좌표

			Data.save.items[i].style.top = (cnt.h > 0 ? grid[cnt.h][cnt.w] : 0) + 'px';
			Data.save.items[i].style.left = grid[0][cnt.w] + 'px';

			cnt.w++;

		}

		return this;
	}

	bind (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Page = SCOPE.option.page;
		let Selector = SCOPE.option.selector;

		// 다음 화면 호출시 증가된 page.count 로 다음 달 데이터 불러옴
		let list = Data.response[Page.count].list;
		let listCnt = Data.response[Page.count].count;

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
					Data.dateSplit = list[i].date.split('-');

					var y = Data.dateSplit[0];
					var m = Data.dateSplit[1];
					var d = Data.dateSplit[2];

					list[i].date = SCOPE.option.month_string[Number(m)-1].toUpperCase()+'\u0020'+d+',\u0020'+y;
				}

				_Str.list[i] = _Str.list[i].replace( SCOPE.reg(key), list[i][key] );

				_val++;
			}

			if (_val < list[i].length) {

				return keyBind(_val);
			}
			else{

				Data.completeBind += _Str.list[i];

				i++;

				if (i < listCnt) {

					return keyBind(0);
				} 
				else {

					Data.completeBind = '\n'+function () {

						if (Page.count != 0) {
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
		SCOPE.selector(Selector.parent).innerHTML += Data.completeBind;

		let img = $(Selector.img).slice(Data.save.itemsLen);
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
				let callList = SCOPE.option.completeFunctionList;

				for (let i=0; i<callList.length; i++) {

					SCOPE[callList[i]].call(SCOPE);
				}
			}
		})(0);

		return SCOPE;
	}

	render (callback) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Page = SCOPE.option.page;
		
		// 새로 불러오면 초기화
		Page.count = 0;

		return SCOPE.request.call(SCOPE, res => {

			Data.response = res;

			if (callback) {
				
				let len = callback.length;

				for (let i=0; i<len; i++) {

					SCOPE[callback[i]].call(SCOPE);
				}
			}
		});
	}
}

window.$UI_PINTEREST = new main({/* user only => _config.js */});