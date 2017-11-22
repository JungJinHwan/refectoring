import Requester from './_requester';

class main extends Requester {

	bind (args) {

		const SCOPE = this;

		const Str = this.storage();

		let Data = SCOPE.option.data;
		let Page = SCOPE.option.page;

		let list = Data.response[Page.count].list;
		let listCnt = Data.response[Page.count].count;

		let _Str = this._storage();

		for (let key in list) {

			_Str.list.push( Str.list.replace( SCOPE.reg(key), list[key] ) );
		}

		console.log(_Str);
		console.log(Data.response[Page.count].count);
		console.log(Data.response[Page.count].list);

		return this;
	}

	append (args) {

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

	render (args) {

 		return this.parse(args);
	}
}

window.$UI_PINTEREST = new main({/* user only => _config.js */});

