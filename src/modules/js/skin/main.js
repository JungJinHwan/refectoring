/*

@ 개발노트

def 0.0.1 : 2017 11 03 정진환 
	- 스킨 개념, html 조각을 필요한 형태로 코딩 후 데이터가 들어갈 곳을 지정 약속어 형태로 데이터 바인딩
		# UpperCase 만 사용
		# {{약속어}} => {{TITLE}}
		#

	- {% abc %} 형태로 지시자 활용
		#
		# {% loop %}
		#   // 지시구간 블럭 선언
		# 	<li>{{PATH}}{{DATE}}</li>
		# {% end loop %}
		#

	- ajax 요청을 담당하는 메서드를 만들고 이 메서드는 요청 결과를 담은 객체를 반환한다. 변수에 담아 요청하면 '.done', '.complete' 등 재요청 없이 추가 사용이 가능

def 0.0.2 : 2017 11 06 정진환
	- 소소한 설정 선언
		# {% config %}
		# 	{
		# 		"loop": "#multi_upload_template_file_list"
		#       // loop 
		# 	}
		# {% end config %}
		#
		# '{% [a-zA-Z] %}' 블럭 선언 후 처음 등장하는 공백없는 영문자를 지시자로 사용
		# 지시구간 끝 선언은 {% end %} 로 충분하지만 명확한 이해를 위해 다음과 같이 약속
		# {% loop %}
		# 	[ ... ]
		# {% end loop %}
		#

	- 실행 후 쓸모 없어진 객체 삭제 : delete 하면 연결만 끊길 뿐, null 혹은 undefined 로 비운후 delete
		# this.option.indicate = null;
		# delete this.option.indicate;
		# 

def 0.0.3 : 2017 11 10 정진환 => [ 드레그 드랍 비동기 멀티파일 업로드 에서 분리, 템플릿 파싱 모듈화 시작 ]
	- config.indicate 에 담아놓은 


@ 개발 가능성
	- 간단한 콜백 사용으로 스킨 파일 config 블럭에서 내부 함수들을 Override 가능할 것 같으다.... 


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

	return this;
};

_Skin.prototype.setBind = function (args) {

	var SCOPE = this;
	var ParseString = SCOPE.option.parseString;
	var ParseData = SCOPE.option.parseData;
	var Process = SCOPE.option.process;

	Process.bindKey = function(key) {

		return new RegExp('\{\{'+key+'\}\}', 'gi');
	}

	Process.setBind = function (key, parsed) {

		return ParseString[key].replace(Process.bindKey(key), parsed);
	};

	for (var key in ParseData.data) {

		ParseString[key] = Process.setBind(key, ParseData.data[key]);
	}

	return this;
};

_Skin.prototype.setAppend = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var ParseString = SCOPE.option.parseString;
	var Process = SCOPE.option.process;

	Process.setAppend = function (node, parsed) {

		document.querySelector(node).innerHTML = parsed;

		return this;
	};

	for (var key in Data.config.indicate) {
		Process.setAppend(Data.config.indicate[key], ParseString[key]);
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


