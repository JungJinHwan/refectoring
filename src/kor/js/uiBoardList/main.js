function _liveColumns (args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	var Data = SCOPE.option.data;
	var Selector = SCOPE.option.selector;

	Selector.parent = $(SCOPE.option.parent);

	Data.parent = Selector.parent.html();

	SCOPE.setDefault();
	
	SCOPE.setRemoveColumns();

	var rw, rh, rtime;

	$WINDOW.resize(function() {
		var t = $(this);

		if(rw != t.width() || rh != t.height()) {

			clearTimeout(rtime);

			rtime = setTimeout(function() {
				SCOPE.setDefault();
				SCOPE.setRemoveColumns();

			}, 100);

			rw = rw || t.width(), rh = rh || t.height();
		}

	});

	return 1;
};

_liveColumns.prototype.setDefault = function() {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Selector = SCOPE.option.selector;

	if(Data.remove) {
		Selector.parent.html(Data.parent);
		Data.remove = 0;
	}

	Selector.colgroup = Selector.parent.find('colgroup').children();
	Selector.thead = Selector.parent.find('thead').children();
	Selector.tbody = Selector.parent.find('tbody').children();

};

_liveColumns.prototype.setRemoveColumns = function() {

	var SCOPE = this;
	var Data = SCOPE.option.data;
	var Selector = SCOPE.option.selector;

	var w = ClientWidth();

	var screenType = function() {	

		var tab = Data.columns.tab;
		var mo = Data.columns.mo;

		if(w < mo.width) {
			return mo.col;

		}else if(w <= tab.width) {
			return tab.col;

		}

		return 0;

	}();


	if(screenType) {

		Data.remove = 1;

		var screenTypeLen = screenType.length;

		for (var colNum=0; colNum<screenTypeLen; colNum++) {

			if(screenType[colNum]){
				Selector.colgroup.eq(colNum)
					.removeAttr('style')
						.attr('class', screenType[colNum]);
			}
			else{
				Selector.colgroup.eq(colNum).remove();
			}
		}

		var theadTr = Selector.thead.children();
		var theadTrLen = theadTr.length;	
		for (var theadTrNum=0; theadTrNum<theadTrLen; theadTrNum++) {
			if(!screenType[theadTrNum]){
				theadTr.eq(theadTrNum).remove();
			}

		}

		var tbodyLen = Selector.tbody.length;
		for (var trNumBody=0; trNumBody<tbodyLen; trNumBody++) {

			var tbodyTr = Selector.tbody.eq(trNumBody).children();
			var tbodyTrLen = tbodyTr.length;
			for (var tbodyTrNum=0; tbodyTrNum<tbodyTrLen; tbodyTrNum++) {

				if(!screenType[tbodyTrNum]){
					tbodyTr.eq(tbodyTrNum).remove();
				}
			}
		}

		return 1;
	}
	
};

window.LiveColumns = new _liveColumns({
	parent: '.basic_table',
	data: {
		columns: {
			tab: {
				width: 1024,
				col: [0, 'columns_1', 'columns_2', 'columns_3', 0, 0]
			},
			mo: {
				width: 768,
				col: [0, 'columns_1', 'columns_2', 0, 0, 0]
			}
		},
		index: 0
	},
	selector: {}
});