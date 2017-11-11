/*

@ 개발노트

def 0.0.1 : 2017 11 10 정진환 => [ 드레그 드랍 비동기 멀티파일 업로드 에서 분리, 템플릿 파싱 모듈화 시작 ]

@ 개발 가능성
	- 간단한 콜백 사용으로 스킨 파일 config 블럭에서 내부 함수들을 Override 가능할 것 같으다.... 
		# json 에 text 로 기록한 함수를 가져와서 실행 가능하도록 만들기는 했는데 
		# 
		#

*/

function _Skin(args) {

	var SCOPE = this;

	SCOPE.option = args;

	SCOPE.option.rgxp = new RegExp('\{\%[a-zA-Z\u0020]+\%\}');
	SCOPE.option.rgxp.end = new RegExp('[{%\u0020]+(end)');

	SCOPE.SkinParser([ 'setStyleSheet', 'setDefault', 'setBind', 'setAppend' ]);

	return this
}

_Skin.prototype.SkinParser = function (callback) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Reg = SCOPE.option.rgxp;
	var indicate = SCOPE.option.indicate;
	var ParseString = SCOPE.option.parseString;
	var ParseData = SCOPE.option.parseData;

	// 템플릿 요청
	SCOPE.getRequester(Data.request, function (res) {

		var Skin = res.split('\n');

		for (var tempNum in Skin) {

			if(Reg.test(Skin[tempNum])) {

				if(!Boolean(Skin[tempNum].match(Reg.end))) {
					var id = Skin[tempNum].replace(/[\s+{%}]/g,'');
					indicate[id] = '';
				}
				else{

					indicate[id] = null;
					delete indicate[id];
				}
			}
			else{

				var keylen = Object.keys(indicate).length;
				var lastKey = Object.keys(indicate)[keylen-1];

				if(!ParseString[lastKey]) {
					ParseString[lastKey] = '';
				}

				ParseString[lastKey] += $.trim(Skin[tempNum]);
			}
		}

		// config 저장
		Data.config = JSON.parse(ParseString.config);

		// request 수정
		Data.request.url = Data.config.request.json;
		Data.request.dataType = 'json';

		// json 요청
		SCOPE.getRequester(Data.request, function (res) {

			ParseData.data = res.data;

			if(callback) {
				for (var i=0; i<callback.length; i++) {
					SCOPE[callback[i]].call(SCOPE);

				}

				return 1;
			}
		});

	});

	return this;
}

_Skin.prototype.setStyleSheet = function(args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;

	var doc = document;
	var GET_ELEMENT_POSITION = doc.getElementsByTagName('script')[0];

	var MAKE_ELEMENT = doc.createElement("link");

	MAKE_ELEMENT.id = 'uiUploadMachineStyle';
	MAKE_ELEMENT.rel = 'stylesheet';
	MAKE_ELEMENT.href = Data.config.request.css;

	GET_ELEMENT_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_ELEMENT_POSITION);

	return this;
}

_Skin.prototype.setDefault = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;

	// 함수 덮어 쓰기가 가능하다
	var Override = SCOPE.option.data.config.override;

	var htmlAppend = new Function('return function() {'+Override.htmlAppend+'}')();

	htmlAppend('arguments1','arguments2', 'arguments3');

	return this;
};

_Skin.prototype.setBind = function (args) {

	var SCOPE = this;
	var ParseString = SCOPE.option.parseString;
	var ParseData = SCOPE.option.parseData;
	var Process = SCOPE.option.process;

	Process.keyBind = function(key) {

		return new RegExp('\{\{'+key+'\}\}', 'gi');
	}

	Process.dataBind = function (key, parsed) {

		return ParseString[key].replace(Process.keyBind(key), parsed);
	};

	for (var key in ParseData.data) {

		ParseString[key] = Process.dataBind(key, ParseData.data[key]);
	}

	return this;
};

_Skin.prototype.setAppend = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var ParseString = SCOPE.option.parseString;
	var Process = SCOPE.option.process;

	Process.htmlAppend = function (node, parsed) {

		document.querySelector(node).innerHTML = parsed;

		return this;
	};

	for (var key in Data.config.indicate) {

		Process.htmlAppend(Data.config.indicate[key], ParseString[key]);
	}

	SCOPE.option.indicate = null;
	delete SCOPE.option.indicat;

	return this;
};

_Skin.prototype.getRequester = function (args, callback) {

	return $.ajax({
		type: args.type,
		url: args.url,
		dataType: args.dataType,
		data: args.data,
		success: callback,
		error: function (res) {
			console.log('ERROR', res);
		}
	});
};

window.Skin = new _Skin({

	data: {
		request: {
			type: 'GET',
			url: '/modules/js/skin/xhr/case_1.skin',
			dataType: 'html',
			data: {}
		}
	},
	parseString: {},
	parseData: {},
	indicate: {},
	process: {}

});


