
var $DOCUMENT = $(document);
var $WINDOW = $(window);
var ClientWidth = function(get) {
	var result = get || '#wrap';
	return document.querySelector(result).clientWidth;
};
