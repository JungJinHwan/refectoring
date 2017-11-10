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

	- 지시자 empty 삭제 
		# 목록이 없는 상태를 기본으로 본다. 
		# config 에 empty(목록이 없는 상태를 가리키는)를 선언 해당하는 요소를 파일이 리스팅 되는 순간 삭제
		# process 에 form 요소 추가, config 에서 action, method 지정
		# form => enctype="multipart/form-data" 으로 생성
		# input => type="file" 생성하여 객체에 저장 multiple 로 여러파일 저장 가능하도록 생성
		# 

	- 각종 보안 위협 요소 이슈
		# form 요소는 document 에 추가된 후에 전송이 가능하다
		# multiple input에 FileList 객체 리스트를 담아서 form 에 append 후 document.body 에 append 그리고 submit
		# 

def 0.0.3 : 2017 11 08 정진환
	- 임의 선언한 배열(Process.store = [])에 입력된 순서대로 FileList 를 push (apply 사용) 중복 파일 검사등의 처리에 사용
	- Process.input 을 함수화 하여 파일이 입력 될 때마다 생성하여 FileList 를 입력 후 Process.form 에 append
	- 삭제버튼 클릭시 해당 배열(Process.deleted = [])에 push 로 담고 안전 장치로 중복 제거 알고리즘을 사용
		# 저장한 삭제 리스트를 함께 보낸다
		#
	- empty 블럭 다시 선언 
		# 파일이 전부 목록에서 지워진 후 파일이 없는 상태를 표시해줘야 했다
		#
	- setStylesheet 메서드 추가 config 블럭 request.css 에 사용자가 기록한 css를 사용하도록 오픈
		#

def 0.0.4 : 2017 11 10 정진환 => [ 드레그 드랍 비동기 멀티파일 업로드 에서 분리, 템플릿 파싱 모듈화 시작 ]
	- 


@ 개발 가능성
	- 간단한 콜백 사용으로 스킨 파일 config 블럭에서 내부 함수들을 Override 가능할 것 같으다.... 


*/

function _Templates(args) {

	var SCOPE = this;

	SCOPE.option = args;

	SCOPE.option.rgxp = new RegExp('\{\%[a-zA-Z\u0020]+\%\}');
	SCOPE.option.rgxp.end = new RegExp('[{%\u0020]+(end)');
	SCOPE.option.rgxp.replace = new RegExp('[\s+{%}]', 'g');

	SCOPE.TemplateRenderer([ 'setStyleSheet', 'setDefault', 'setIndicator' ]);

	return this
}

_Templates.prototype.TemplateRenderer = function (callback) {

	var SCOPE = this;

	var Data = SCOPE.option.data;
	var Reg = SCOPE.option.rgxp;
	var indicate = SCOPE.option.indicate;
	var ParseString = SCOPE.option.parseString;

	SCOPE.getRequester(Data.request, function (res) {

		var templates = res.split('\n');

		for (var tempNum in templates) {

			if(Reg.test(templates[tempNum])) {

				if(!Boolean(templates[tempNum].match(Reg.end))) {
					var id = templates[tempNum].replace(/[\s+{%}]/g,'');
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

				ParseString[lastKey] += $.trim(templates[tempNum]);
			}
		}

		// config 저장
		Data.config = JSON.parse(ParseString.config);

		if(callback) {
			for (var i=0; i<callback.length; i++) {
				SCOPE.callback[i].call(SCOPE);

			}

			return 1;
		}
	});

	return this;
}

_Templates.prototype.setStyleSheet = function(args) {

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

_Templates.prototype.setDefault = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
};

_Templates.prototype.setIndicator = function () {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var ParseString = SCOPE.option.parseString;
	var Process = SCOPE.option.process;

	Process.setQuery = function (node, parsed){
		// Process.setQuery(null, null); 이면 전체 삭제

		if(!node && !parsed) {
			$(Data.config.loop).empty();
		}

		if($(Data.config.empty)) {
			$(Data.config.empty).remove();
		}

		$(node).prepend(parsed);

		return this;
	};

	// 템플릿 뷰
	Process.setQuery(SCOPE.option.parent, ParseString.template);
	Process.setQuery(Data.config.loop, ParseString.empty);

	SCOPE.option.indicate = null;
	delete SCOPE.option.indicat;

	return this;
};

_Templates.prototype.getRequester = function (args, callback) {

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

window.UMachine = new _Templates({

	parent: '#templates',
	data: {
		request: {
			type: 'GET',
			url: '/kor/js/uiUploadMachine/xhr/case_1.template',
			dataType: 'html',
			data: {}
		}
	},
	parseString: {},
	indicate: {}

});


