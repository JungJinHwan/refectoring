import Requester from './_requester';

class main extends Requester {

	bind (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Page = SCOPE.option.page;

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

				_Str.list[i] = _Str.list[i].replace( SCOPE.reg(key) , list[i][key]);

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
			}

			return 1;
		})(0);

		return this;
	}

	append (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;

		document.querySelector(Selector.parent).innerHTML = Data.completeBind;

		return this;
	}

	parse (callback) {

		const SCOPE = this;

		return this.request( res => {

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

	render (arg) {

 		return this.parse(arg);
	}
}

window.$UI_PINTEREST = new main({/* user only => _config.js */});