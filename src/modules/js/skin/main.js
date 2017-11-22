
function _Skin(args) {

	// 사용자에게 제공 할 필요가 없는 객체
	args.parseString = {
		config: ''
	},
	args.parseData = {},
	args.indicate = {},
	args.process = {},
	args.status = {}

	var SCOPE = this;

	SCOPE.option = args;

	SCOPE.option.rgxp = /\{\%[a-zA-Z\u0020]/;
	SCOPE.option.rgxp.config = /\{\%[\u0020]+(config)/;
	SCOPE.option.rgxp.end = /\{\%[\u0020]+(end)/;
	SCOPE.option.rgxp.remove = /[\s+{%}]/g;
	SCOPE.option.rgxp.tail = /\%\}/g;
	SCOPE.option.rgxp.empty = /\{\%[a-z\u0020]+\[[\,\"a-z\u0020]+\]/;
	SCOPE.option.rgxp.empty.range = /\{\%[\u0020][a-zA-Z]+/g;
	SCOPE.option.rgxp.empty.remove = /\{\%[\u0020]+(empty)/g;

	var Data = SCOPE.option.data;

	var doc = document;
	var GET_ELEMENT_POSITION = doc.getElementsByTagName('script')[0];

	var MAKE_ELEMENT = doc.createElement("link");

	MAKE_ELEMENT.id = 'uiUploadMachineStyle';
	MAKE_ELEMENT.rel = 'stylesheet';
	MAKE_ELEMENT.href = Data.styleSheet;

	GET_ELEMENT_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_ELEMENT_POSITION);

	SCOPE.SkinParser([ 'setDefault', 'setEmpty', 'setBind', 'setAppend' ]);

	return this
}

_Skin.prototype.SkinParser = function (callback) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Reg = SCOPE.option.rgxp;
	var indicate = SCOPE.option.indicate;
	var ParseString = SCOPE.option.parseString;
	var ParseData = SCOPE.option.parseData;
	var Process = SCOPE.option.process;
	var Status = SCOPE.option.status;

	// 템플릿 요청
	SCOPE.getRequester(Data.request, function (res) {

		var Skin = res.split('\n');

		var id = '', parseConfig = '';

		for (var tempNum in Skin) {

			if (Reg.test(Skin[tempNum])) {

				if (!Reg.end.test(Skin[tempNum])) {

					id = Skin[tempNum].replace(Reg.remove,'');
				}
				else {
					// end 
					if(id == 'config') {
						var sliceNum = tempNum;
						break;
					}
				}
			}
			else{

				if(id == 'config') {
					parseConfig += $.trim(Skin[tempNum]);
				}
				else{
					continue;
				}
			}
		}

		Skin = Skin.slice(++sliceNum);

		// config 저장
		Data.config = JSON.parse(parseConfig);

		// request 수정
		Data.request.url = Data.config.request.json;
		Data.request.dataType = 'json';

		// json 요청
		SCOPE.getRequester(Data.request, function (res) {

			ParseData.data = res.data;

			for (var tempNum in Skin) {

				Status.isMaybe = Reg.empty.test(Skin[tempNum]);

				if (Reg.test(Skin[tempNum])) {

					if (!Reg.end.test(Skin[tempNum])) {

						if (Status.isMaybe) {

							var empty = {
								order: $.trim(Skin[tempNum].match(Reg.empty.range)[0].replace(/\{\%[\u0020]+/g, '')),
								attr: JSON.parse($.trim(Skin[tempNum].replace(Reg.empty.range, '').replace(Reg.tail, ''))),
								tempNum: {
									start: tempNum,
									empty: []
								}
							}
						}
						else{
							id = Skin[tempNum].replace(Reg.remove,'');

							ParseString[id] = '';
						}

						indicate[id] = '';
					}
					else {
						// end 
						id =  $.trim(Skin[tempNum].replace(Reg.remove,'')).replace(/^end/, '');

						indicate[id] = null;
						delete indicate[id];

						// 소모되어 가치가 없어진 데이터를 삭제
						id = empty = null;
					}
				}
				else{

					if (empty) {

						Process.empty = empty;
						Process.empty.key = id;
						Process.empty.string = $.trim(Skin[tempNum]);
						
						var emptyData = ParseData.data[id];
						var emptyDataLen = emptyData.length;

						var emptyIndex = '';
						var emptyBoolean = true;

						var emptyAttr = Process.empty.attr;
						var emptyAttrLen = emptyAttr.length;

						for (var i=0; i<emptyDataLen; i++) {

							for (var j=0; j<emptyAttrLen; j++) {

								if (!emptyData[i][emptyAttr[j]]) {
									emptyBoolean = false;
								}
							}

							if (emptyBoolean) {
								// 몇개를 검사해야할지 모르는 상황에서 배열을보다 일반 문자열을 생성 해봄....
								emptyIndex.length ? emptyIndex += (','+i) : emptyIndex += i;
							}

							emptyBoolean = true;
						}

						Process.empty.tempNum.empty.push(tempNum);

						if (tempNum == Process.empty.tempNum.empty[0]) {
							ParseString[lastKey] += '{{empty['+emptyIndex+']}}';
						}

						continue;
					}

					var keylen = Object.keys(indicate).length-1;
					var lastKey = Object.keys(indicate)[keylen];

					ParseString[lastKey] += $.trim(Skin[tempNum]);
				}
			}

			if (callback) {
				for (var i=0; i<callback.length; i++) {
					SCOPE[callback[i]].call(SCOPE);

				}

				// 소모되어 가치가 없어진 데이터를 삭제
				Skin = ParseString = null;

				return 1;
			}
		});
	});

	return this;
}

_Skin.prototype.setDefault = function (args) {

	var SCOPE = this;

	// 함수 재정의(Override)가 가능하다
	var Override = SCOPE.option.data.config.override;

	for (var key in Override) {

		Override[key] = new Function(
			'return function ('+Override[key].arguments+') {'+
				Override[key].logics+
			'}'
		)();
	}

	return this;
};

_Skin.prototype.setBind = function (args) {

	var SCOPE = this;
	var ParseString = SCOPE.option.parseString;
	var ParseData = SCOPE.option.parseData;
	var Process = SCOPE.option.process;

	var Override = SCOPE.option.data.config.override;

	Process.keyBind = function(key) {

		return new RegExp('\{\{'+key+'\}\}', 'g');
	}

	Process.dataBind = Override.dataBind || function (key, parsed) {

		if (Array.isArray(parsed)) {

			var str = '';

			for (var i=0; i<parsed.length; i++ ) {

				var _str = ParseString[key];

				// empty 로 시작하는 인덱스 번호를 가진 배열형태의 텍스트를 찾는다
				var emptyRegEx = Process.keyBind('(empty)\[[\,0-9]+\]');

				// empty!
				if (emptyRegEx.test(_str)) {
					var emptyArr = JSON.parse(_str.match(/\[[\,0-9]+\]/g)[0]);
					
					if (emptyArr.indexOf(i) == -1) {
						continue;
					}
					else {

						_str = _str.replace(emptyRegEx, Process.empty.string);
					}
				}

				for(var dataKey in parsed[i]) {

					_str = _str.replace(Process.keyBind(dataKey), parsed[i][dataKey]);
				}

				str += _str;
			}

			return str;
		}

		return ParseString[key].replace(Process.keyBind(key), parsed)
	};	

	for (var key in ParseData.data) {

		ParseString[key] = Process.dataBind.call(SCOPE, key, ParseData.data[key]);
	}

	return this;
};

_Skin.prototype.setAppend = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var ParseString = SCOPE.option.parseString;
	var Process = SCOPE.option.process;

	var Override = SCOPE.option.data.config.override;

	Process.htmlAppend = Override.htmlAppend || function (node, parsed) {

		document.querySelector(node).innerHTML = parsed;

		return this;
	};

	for (var key in Data.config.indicate) {

		Process.htmlAppend.call(SCOPE, Data.config.indicate[key], ParseString[key]);
	}

	SCOPE.option.indicate = null;
	delete SCOPE.option.indicat;

	return this;
};

_Skin.prototype.setEmpty = function (args) {

	var SCOPE = this;

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
	/* user only */
	data: {
		styleSheet: '/modules/js/skin/css/style.css',
		request: {
			type: 'GET',
			url: '/modules/js/skin/xhr/case_1.skin',
			dataType: 'html',
			data: {}
		}
	}

});