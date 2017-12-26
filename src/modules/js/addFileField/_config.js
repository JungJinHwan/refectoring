import Style from './_style';

export default class Config {

	constructor (arg) {

		this.option = arg;

		this.option.styleSheet = [
			'/modules/js/addFileField/css/style.css'
		];

		this.option.request = {
			type: 'GET',
			url: $SKIN.ADDFILEFIELD,
			data: {},
			dataType: 'html',
		};

		this.option.data = {};
		this.option.status = { inserted: 0, deleted: [] };
		this.option.process = {};

		this.option.selector = {
			parent: '#addFileField',
			draw: '#addFileFieldDrawArea',
			insert: '#addFileFieldInsertButton'
		};

		this.option.event = {
			def: 'click.def'
		};

		// 스타일시트 리스트 추가
		Style.addStyleSheet(this.option.styleSheet);

		// 실행할 메서드 등록
		this.render([]);
	}

	request (callback) {

		const SCOPE = this;

		return $.ajax({
			type: SCOPE.option.request.type,
			url: SCOPE.option.request.url,
			data: SCOPE.option.request.data,
			dataType: SCOPE.option.request.dataType,
			success: callback,
			error: res => {

				let err = '$ADDFILEFIELD Request Error, AJAX 요청이 실패하였습니다';
				console.log('ERROR', res);
				document.write(err);
				throw err;
			}
		});
	}

	storage (a) {

		a = {};

		a.body = '\n'+
    		'\n<div id="addFileFieldDrawArea"></div>'+
			'\n<div id="addFileFieldInsertButton"><button id="field{{i}}-insert" type="button" onclick="return $ADDFILEFIELD.append();">추가</button></div>';

		return a;
	}

	select (a) {

		return document.querySelectorAll(a);
	}

	reg (a) {

		return new RegExp ('\{\{'+a+'\}\}', 'g');
	}

	hasAttr (a, b, c) {

		return document.querySelector(a).getAttributeNode(b).nodeValue.indexOf(c) != -1 ? true : false;
	}

	returnCall (a) {
		
		for (let i=0; i<a.length; i++) {

			this[a[i]].call(this);
		}
	}

	index (a, b) {

		let aLen = a.length;

		for (var i=0; i<aLen; i++) {
			
			if (a[i] === b) {
				break;
			}
		}

		return i;
	}
};
	