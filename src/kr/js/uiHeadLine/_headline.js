import Config from './_config';

class main extends Config {

	screenDown (arg) {

	}

	listener () {

		const SCOPE = this;

		let Selector = SCOPE.option.selector;
		let Event = SCOPE.option.event;
		let Data = SCOPE.option.data;

		let circle = SCOPE.select(Selector.circle);
		let circle_film = SCOPE.select(Selector.circle_film)[0];

		$DOCUMENT.on(Event.mouse, Selector.circle, function (event) {

			const t = this;

			let index = SCOPE.index(circle, t);

			if (event.type === 'mouseenter') {

				circle_film.style.opacity = '1';
				circle_film.style.zIndex = '10';
			}

			if (event.type === 'mouseleave') {

				circle_film.style.opacity = '0';
				circle_film.style.zIndex = '0';
			}
		});
	}

	bind (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;

		let Str = SCOPE.storage();
		let _Str = SCOPE._storage({ bg: '', circle: '', visual: Str.visual });

		let circles = Data.circle;
		let circlesLen = Data.circle.length;

		let bg = '', circle = '';

		for (let i=0; i<circlesLen; i++) {

			_Str.bg = Str.bg;
			_Str.circle = Str.circle;

			bg += '\n'+_Str.bg.replace(SCOPE.reg('i'), i);
			circle += '\n'+_Str.circle.replace(SCOPE.reg('i'), i);
		}

		Data.strings = _Str.visual
			.replace(SCOPE.reg('bg'), bg)
				.replace(SCOPE.reg('circle'), circle);

		return this;
	}

	append (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;

		SCOPE.select(Selector.parent)[0].innerHTML = Data.strings;

		return this;
	}

	resize (callback) {

		const SCOPE = this;

		return SCOPE.returnCall(callback);
	}

	render (callback) {

		const SCOPE = this;

		return SCOPE.returnCall(callback);
	}
}

window.$UI_HEADLINE = new main({/* user only => _config.js */});