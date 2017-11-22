function _UMachine(args) {

	var SCOPE = this;

	SCOPE.option = args;

	SCOPE.option.rgxp = new RegExp('\{\%[a-zA-Z\u0020]+\%\}');
	SCOPE.option.rgxp.end = new RegExp('[{%\u0020]+(end)');

	SCOPE.setRender([ 'setStyleSheet', 'setDefault', 'setIndicator', 'onEvent' ]);

	return this
}

_UMachine.prototype.setRender = function (callback) {

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
			var callLen = callback.length;
			for (var i=0; i<callLen; i++) {
				SCOPE[callback[i]].call(SCOPE);

			}

			return 1;
		}
	});

	return this;
}

_UMachine.prototype.setStyleSheet = function(args) {

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

_UMachine.prototype.setDefault = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Process = SCOPE.option.process;

	Process.form = document.createElement('form');
	Process.form.id = 'processForm';
	Process.form.action = Data.config.action;
	Process.form.method = 'POST';
	Process.form.enctype = 'multipart/form-data';

	document.body.appendChild(Process.form);

	Process.input = function (args) {
		var el = document.createElement('input');
			el.type = 'file';
			el.name =  args || 'uploadFile';
			el.multiple = true;

		return el;
	};

	Process.store = [];
	Process.deleted = [];
};

_UMachine.prototype.setIndicator = function () {

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

_UMachine.prototype.onEvent = function (args) {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var ParseString = SCOPE.option.parseString;
	var Process = SCOPE.option.process;

	var prevfiles = null;
	
	// 파일 드랍되면 처리
	$DOCUMENT.on(
		'dragover drop', Data.config.drop, 
		function (event) {
			event.preventDefault();

			if(event.type != 'drop') {

				return 0;
			}
			else{

				var files = event.originalEvent.dataTransfer.files;
				var filesLen = files.length;

				var storeLen = Process.store ? Process.store.length : 0;

				var clonesData = [];

				console.log(SCOPE.clone(files));

				for (var i=0; i<filesLen; i++) {

					if(storeLen){

						for (var j=0; j<storeLen; j++) {
							if (files[i].name == Process.store[j].name) {
								alert('목록에 같은 파일이 이미 있습니다.');
								return 0;
								break;
							}
						}
					}

					var filesDate = files[i].lastModifiedDate.getFullYear()+
						'-'+(files[i].lastModifiedDate.getMonth()+1)+
						'-'+files[i].lastModifiedDate.getDate()+
						':'+files[i].lastModifiedDate.getHours()+
						':'+files[i].lastModifiedDate.getMinutes();

					// config 에 지정된 loop 에 리스팅
					var loop = ParseString.loop;
						loop = loop.replace(/{{NAME}}/g, files[i].name);
						loop = loop.replace(/{{SIZE}}/g, files[i].size);
						loop = loop.replace(/{{MODIFIED}}/g, files[i].lastModified);
						loop = loop.replace(/{{DATE}}/g, filesDate);

					Process.setQuery(Data.config.loop, loop);
				}



				// 추가한 파일이 동일 한 파일인가 등의 검증의 용도로 사용하기 위해 저장
				Process.store.push.apply(Process.store, files);

				var inputFiles = Process.input();
					inputFiles.files = files;

				Process.form.appendChild(inputFiles);

				prevfiles = files;
			}
		}
	);

	// 실제 올라갈 파일 갯수
	var resultLen = function() {
		var filesLen = Process.store.length;
		var deletedLen = Process.deleted.length;

		return filesLen - deletedLen;
	};

	// 삭제
	$DOCUMENT.on(
		'click', Data.config.del, 
		function (event) {
			event.preventDefault();

			var t = $(this);
			var index = $(Data.config.del).index(t);
			var deleteKey = t.val();

			Process.deleted.push(deleteKey);
			// 중복 요소 삭제 처리
			Process.deleted = SCOPE.removeDuplicates(Process.deleted);

			$(Data.config.item).eq(index).remove();

			if(!resultLen()){
				Process.setQuery(Data.config.loop, ParseString.empty);
			}
		}
	);

	// 업로드 보내기
	$DOCUMENT.on(
		'click', Data.config.submit,
		function (event) {
			event.preventDefault();

			var t = $(this);
			
			if(resultLen() > 0){

				if(confirm(resultLen()+'개의 파일을 업로드 하시겠습니까?')) {

					$('#'+Process.form.id).submit();

					return 0;
				}
			}
			else{

				alert('준비된 파일이 없습니다');

				return 0;
			}
		}
	);

	return this;
};

_UMachine.prototype.removeDuplicates = function (arr) {

	var i,
		len = arr.length,
		out = [],
		obj = {};

	for (i=0; i<len; i++) {

		obj[arr[i]] = 0;
	}

	for (i in obj) {

		out.push(i);
	}

	return out;
}

_UMachine.prototype.getRequester = function (args, callback) {

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

_UMachine.prototype.clone = function (args) {
  if (args === null || typeof(args) !== 'object')
  return args;
  var copy = args.constructor();
  for (var attr in args) {
    if (args.hasOwnProperty(attr)) {
      copy[attr] = clone(args[attr]);
    }
  }
  return copy;
}

window.UMachine = new _UMachine({

	parent: '#uiUploadMachine',
	data: {
		request: {
			type: 'GET',
			url: '/kor/js/uiUploadMachine/xhr/case_1.template',
			dataType: 'html',
			data: {}
		}
	},
	parseString: {},
	indicate: {},
	process: {}

});


