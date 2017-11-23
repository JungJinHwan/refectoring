import Requester from './_requester';

class main extends Requester {

	ani (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;

		SCOPE.selector(Selector.completeGroup).style.opacity = 1;

		let items = SCOPE.selector(Selector.item);

		items.forEach((t, i) => {

			t.style.transform = 'translateY(0)';
			t.style.transitionDelay = (30*(i/1.5))+'ms';
			t.style.transitionDuration = '0.3s';
			t.style.transitionProperty = 'transform';
		});

		return SCOPE;
	}

	sort (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;

		// 재귀 종료지점, 정렬 시작
		Data.save.items = SCOPE.selector(Selector.item);
		Data.save.itemsLen = Data.save.items.length;

		let iWorld = SCOPE.selector(Selector.parent).clientWidth;
		let iWidth = 0;
		let iCount = 0;
		let cutCount = 0;

		for(let i=0; i<Data.save.itemsLen; i++) {

	    	let curr = Data.save.beforeItem = Data.save.items[i];
	    	let prev = Data.save.items[function () { 

	    		let n = --SCOPE._storage({ n: i }).n;
	    		
	    		return n < 0 ? 0 : n;
	    	}.call(SCOPE)];

	    	iWidth += curr.offsetWidth;

			if(iWidth > iWorld) {

				iWidth = curr.offsetWidth;
				cutCount = iCount;
				iCount = 0;
			}

			// 다음의 큰것(before), 이전의 작은것(after) 판단
	    	if(i%cutCount === 0) {
	    		let setLength = i+cutCount;


	    		for(let k=i; k<setLength; k++) {

	    			if(k === Data.save.itemsLen){
	    				break;

	    			}

	    			Data.save.sort.before[k-i] = Data.save.items[k].offsetWidth;
	    			Data.save.sort.after[k-i] = Data.save.items[k-cutCount].offsetWidth+
	    				parseInt(getComputedStyle(Data.save.items[k-cutCount], null).top);
	    		}

	    		Data.save.row = i;
	    	}

	    	if(cutCount){

	     		// 이것은 다음 줄의 가장 길이가 긴 것의 위치가 된다.
	     		let min = Math.min.apply(null, Data.save.sort.before);
	     		let max = Math.max.apply(null, Data.save.sort.after);

	    		Data.save.sort.beforeIndex = Data.save.sort.before.indexOf(min);
	    		Data.save.sort.afterIndex = Data.save.sort.after.indexOf(max);

	    		Data.save.sort.before[Data.save.sort.beforeIndex] = 100000000;
	    		Data.save.sort.after[Data.save.sort.afterIndex] = 0;

				Data.save.beforeItem = Data.save.items[Data.save.row + Data.save.sort.beforeIndex];
				Data.save.afterItem = Data.save.items[(Data.save.row - cutCount) + Data.save.sort.afterIndex];
			}

	        $(Data.save.beforeItem).css({
	            'top': cutCount ? function() {

					return parseInt(getComputedStyle(Data.save.afterItem, null).top) + Data.save.afterItem.offsetHeight;
	            }() : 0,
	            'left': i ? function() {

					let result = parseInt(getComputedStyle(prev, null).left) + prev.offsetWidth;

	            	return i%cutCount ? parseInt(getComputedStyle(Data.save.afterItem, null).left) : function() {
						return iCount ? result : parseInt(getComputedStyle(Data.save.afterItem, null).left)
	            	}();
	            }() : 0
	        });

	        iCount++;
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

		let Str = this.storage();
		let _Str = this._storage({ list: [] });

		let i = 0;

		Data.completeBind = '';

		(function keyBind(_n){

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

				_Str.list[i] = _Str.list[i].replace( SCOPE.reg(key), list[i][key]);

				_n++;
			}

			if (_n < list[i].length) {

				return keyBind(_n);
			}
			else{

				Data.completeBind += _Str.list[i];

				i++;

				if (i < listCnt) {

					return keyBind(0);
				} 
				else {

					Data.completeBind = '<div class="group" id="group'+(y+m)+'" style="opacity:0">'+Data.completeBind+'</div>';
	
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
		document.querySelector(Selector.parent).innerHTML = Data.completeBind;

		// 이미지 로딩 완료 확인 후 정렬 시작
		Data.save = {};
		Data.save.sort = { before: [], after: [] };

		let img = $(Selector.img).slice(Data.save.itemsLen);
		let imgLen = img.length;

		// limit 보다 작을때 재귀
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

				let callList = SCOPE.option.completeFunctionList;
				let callListLen = callList.length;

				for (let i=0; i<callListLen; i++) {

					SCOPE[callList[i]].call(SCOPE);
				}
			}
		})(0);

		return SCOPE;
	}

	render (callback) {

		const SCOPE = this;

		return SCOPE.request.call(SCOPE, res => {

			SCOPE.option.data.response = res;
			SCOPE.option.page.count = 0;

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