/*

@ 개발노트

def 0.0.1 : 2017 11 10 정진환 => [ 드레그 드랍 비동기 멀티파일 업로드 에서 분리, 템플릿 파싱 모듈화 시작 ]

def 0.0.2 : 2017 11 12 정진환
	- skin 파일의 config 블록에 로직 등록 가능 
		# json 으로 파싱 해오는 config 블럭에 text 로 기록한 로직을 가져와서 실행 가능하도록 new Function 을 사용해서 *(1)컨버전
		# skin 파일 config 블록 override 에 로직만 등록하고 함수는 내부에서 new Function 으로 만들어지기 때문에 arguments 를 사용해서 외부 로직으로 내부 data 연결이 가능 
		#

def 0.0.3 : 2017 11 13 정진환
	- override 대상을 데이터 호출 가공이 끝난 후 바인딩 처리용으로 사용중인 process 객체로 한정하고 진행
	- 다음의 형태 를 취하고 내부 로직에서 객체 키를 가져오는 for in 문으로 기 등록된 객체를 재정의 한다
		# "override": { 
		# 	"key": {
		#		"arguments": "받아올 인자 작성",
		#		"logics": "로직 작성"
		# 	}
		# }
		# 
	- 현재버전에서 override 대상 process 자식 객체는 dataBind, htmlAppend 두가지 뿐이다.
	- override 대상을 .call 로 호출하여 scope(this) 를 전달한다, 외부에서 내부에 접근 가능하게 되므로 모든 객체와 메서드의 접근과 수정, 실행이 가능하다.
	- config override logics escape 방법
		# JSON.strigify 로 1차 파싱 되어 오고 JSON.parse 로 json 객체로 변환되는 과정에서 escape 처리 하기위해서는 
		# \n => \\n,
		# str='<p style="color:#c8c8c8"><p>' => str='<p style=\"color:#c8c8c8\"><p>'
		# 

def 0.0.4 : 2017 11 16 정진환
	- 반복할 대상을 수동 선택 해야했던 방식에서 배열인지 확인하여 반복 
		# Process.dataBind 에 들어온 parsed 인자가 배열이면 배열이 가지고 있는 객체의 자식 객체를 가지고 데이터 바인딩
		#

def 0.0.5 : 2017 11 17 정진환
	- empty 조건식 추가 
		# {% empty not { "thumbnail" : ["src"] } %}
		# 	<img src="{{src}}" alt="{{alt}}"><br>
		# {% end empty %}
		# 


--------------------

	*각주

	(1) 상충되는 분야/기술 등이 단일 기반 환경으로 통합/융합/수렴되는 것을 말함

--------------------


*/

Error.skinChecker = function (_val) {

	var err = true;

	if (_val) {
		if (_val.start != _val.end) {
			err = 'Skin Error ( START : '+_val.start+', END : '+_val.end+' )';
			document.write(err);
			throw err;
		}
	}

	return err;
};

function _Skin(args) {

	// 사용자에게 제공 할 필요가 없는 객체
	args.parseString = {},
	args.parseData = {},
	args.indicate = {},
	args.process = {},
	args.status = {}

	var SCOPE = this;

	SCOPE.option = args;

	// 자바스크립트는 알아서 객체 생성 해주죠, 참쉽죠?
	SCOPE.option.rgxp = /\{\%[a-zA-Z\u0020]+\%\}/;
	SCOPE.option.rgxp.end = /\{\%[\u0020]+(end)/;
	SCOPE.option.rgxp.remove = /[\s+{%}]/g;
	SCOPE.option.rgxp.tail = /\%\}/g;
	SCOPE.option.rgxp.empty = /\{\%[a-zA-Z\u0020]+\{[a-zA-Z\"\:\u0020]+\[[\"\,a-zA-Z\u0020]+\][\u0020\}]+\%\}/;
	SCOPE.option.rgxp.empty.range = /\{\%[\u0020][a-zA-Z]+\s[a-zA-Z]+/g;
	SCOPE.option.rgxp.empty.remove = /\{\%[\u0020]+(empty\s)/g;

	var Data = SCOPE.option.data;

	var doc = document;
	var GET_ELEMENT_POSITION = doc.getElementsByTagName('script')[0];

	var MAKE_ELEMENT = doc.createElement("link");

	MAKE_ELEMENT.id = 'uiUploadMachineStyle';
	MAKE_ELEMENT.rel = 'stylesheet';
	MAKE_ELEMENT.href = Data.styleSheet;

	GET_ELEMENT_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_ELEMENT_POSITION);

	SCOPE.SkinParser([ 'setDefault', 'setMaybe', 'setBind', 'setAppend' ]);

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

		var id = '';

		for (var tempNum in Skin) {

			Status.isMaybe = Reg.empty.test(Skin[tempNum]);

			if (Reg.test(Skin[tempNum]) || Status.isMaybe) {

				if (!Reg.end.test(Skin[tempNum])) {

					if (Status.isMaybe) {

						var empty = {
							order: $.trim(Skin[tempNum].match(Reg.empty.range)[0].replace(Reg.empty.remove, '')),
							attr: JSON.parse($.trim(Skin[tempNum].replace(Reg.empty.range, '').replace(Reg.tail, ''))),
							key: '',
							string: '',
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

					empty = null;

				}
			}
			else{

				var keylen = Object.keys(indicate).length-1;
				var lastKey = Object.keys(indicate)[keylen];

				if (empty) {

					Process.empty = empty;
					Process.empty.key = id;
					Process.empty.tempNum.empty.push(tempNum);
					Process.empty.string += $.trim(Skin[tempNum]);

					continue;
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

			if (callback) {
				for (var i=0; i<callback.length; i++) {
					SCOPE[callback[i]].call(SCOPE);

				}

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

		return ParseString[key].replace(Process.keyBind(key), parsed);
	};	

	for (var key in ParseData.data) {

		var _key = args ? args.key : key;
		var _parsed  = args ? args.parsed : ParseData.data[key];

		ParseString[key] = Process.dataBind.call(SCOPE, _key, _parsed);
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

		var _node = args ? args.node : Data.config.indicate[key];
		var _parsed  = args ? args.parsed : ParseString[key];

		Process.htmlAppend.call(SCOPE, _node, _parsed);
	}

	SCOPE.option.indicate = null;
	delete SCOPE.option.indicat;

	return this;
};

_Skin.prototype.setMaybe = function (args) {

	var SCOPE = this;
	var Process = SCOPE.option.process;
	var ParseString = SCOPE.option.parseString;
	var ParseData = SCOPE.option.parseData;
	var Process = SCOPE.option.process;

	args = {};

	switch (Process.empty.order) {
		case 'N': args.n = false; break;
		case 'Y': args.y = true; break;
		default : 
			var err = 'Skin Error ( '+Process.empty.order +' ) 해당 조건식 명령은 사용할 수 없습니다';
			document.write(err); 
			throw err;
		break;
	}

	var key = Object.keys(Process.empty.attr)[0];

	if (args[Process.empty.order.toLowerCase()] && Process.empty.key == key) {

		var row = Process.empty.tempNum.empty[0] - Process.empty.tempNum.start;

		console.log(Process.empty);

	}

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