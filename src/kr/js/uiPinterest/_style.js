export default class Style {

	static addStyleSheet (arg) {

		const GET_DOC = document;
		const GET_ELEMENT_POSITION = GET_DOC.getElementsByTagName('script')[0];

		for (let i=0; i<arg.length; i++) {

			let MAKE_ELEMENT = GET_DOC.createElement("link");

			MAKE_ELEMENT.rel = 'stylesheet';
			MAKE_ELEMENT.href = arg[i];

			GET_ELEMENT_POSITION.parentNode.insertBefore(MAKE_ELEMENT, GET_ELEMENT_POSITION);
		}

		return this;
	}
}