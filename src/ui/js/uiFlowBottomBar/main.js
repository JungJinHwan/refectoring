function main (args) {

	var SCOPE = this;

	SCOPE.option = args || {};

	SCOPE.setSection().clickEvent();

	return 1;
}

main.prototype.setSection = function (arg) {

	var Selector = this.option.selector;
	var Data = this.option.data;

	var section = $(Selector.section);
	var sectionLen = section.length;

	var headerHeight =  $(Selector.header).outerHeight(true);
	var footerHeight =  $(Selector.footer).outerHeight(true);

	for (var i=0; i<sectionLen; i++) {

		Data.map[i] = section.eq(i).outerHeight();
	}
	
	$(Selector.parent).css('height', Data.map[Data.idx]);

	if (document.body.clientHeight - headerHeight > Data.map[Data.idx]) {

		$(Selector.main).css('height', document.body.clientHeight - headerHeight);
	}
	else {

		$(Selector.main).css('height', Data.map[Data.idx] + footerHeight);	
	}

	if (arg) {

		$(Selector.parent).animate({ 'left': ['100%', '0%', '-100%'][Data.idx] }, 1000, 'easeOutExpo');
	}

	return this;
};


main.prototype.clickEvent = function () {
 	
 	var SCOPE = this;

	var Selector = this.option.selector;
	var Data = this.option.data;

	var fBttBar = $(Selector.fBttBar);
	var fBttBarBtn = $(Selector.fBttBarBtn);

	fBttBarBtn.on('click', function (event) {

		event.preventDefault();

		var t = $(this);

		var idx = t.data('idx');

		Data.idx = idx;

		SCOPE.setSection(1);

	});

	return this;
};


window.Main = new main ({
	selector: {
		header: '#header',
		footer: '#footer',
		main: '#main',
		parent: "#slideWrap",
		section: "#slideWrap .slide_section",
		fBttBar: '#fBttBar',
		fBttBarBtn: '#fBttBar a'

	},
	data: {
		idx: 0,
		map: []
	}

});

window.onresize = function() {

	Main.setSection();
	
};