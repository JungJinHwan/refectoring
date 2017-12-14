import Config from './_config';

class main extends Config {

	auto (arg) {

		const SCOPE = this;

		let Status = SCOPE.option.status;
		let Data = SCOPE.option.data;

		Status.fade = 1000;
		Status.dlay = 700;

		Status.auto = setInterval(() => {

			if (Status.index < Data.circleLen-1) {

				Status.index++;
			}
			else {

				Status.index = 0;
			}

			return SCOPE.returnCall([ 'next' ]);

		}, SCOPE.option.interval);

		return SCOPE;
	}

	next (arg) {

		const SCOPE = this;

		let Selector = SCOPE.option.selector;
		let Status = SCOPE.option.status;
		let Data = SCOPE.option.data;

		let circle = SCOPE.select(Selector.circle);
		let item = SCOPE.select(Selector.item);
		let bg = SCOPE.select(Selector.bg);
		let more = SCOPE.select(Selector.more)[0];

		let circlelen = circle.length;

		for (let i=0; i<circlelen; i++) {

			if (Status.index == i) {

				continue;
			}

			circle[i].setAttribute('class', 'circle');

			$(item[i]).stop(1,0).fadeOut(Status.fade);
			$(bg[i]).stop(1,0).delay(Status.dlay).fadeOut(Status.fade);
		}

		circle[Status.index].setAttribute('class', 'circle ov');
		
		$(item[Status.index]).stop(1,0).fadeIn(Status.fade);
		$(bg[Status.index]).stop(1,0).delay(Status.dlay).fadeIn(Status.fade);

		more.setAttribute('href', Data.circle[Status.index].url);

		return SCOPE;
	}

	screenDown (arg) {

		const SCOPE = this;

		let Selector = SCOPE.option.selector;

		let parent = SCOPE.select(Selector.parent)[0];

		$(Selector.scroll).animate({ scrollTop: parent.clientHeight }, 1000, 'easeOutExpo');

		return SCOPE;
	}

	listener () {

		const SCOPE = this;

		let Selector = SCOPE.option.selector;
		let Status = SCOPE.option.status;
		let Event = SCOPE.option.event;

		let circle = SCOPE.select(Selector.circle);
		let circle_film = SCOPE.select(Selector.circle_film)[0];

		$DOCUMENT.on(Event.def, Selector.circle, function (event) {

			Status.index = SCOPE.index(circle, this);

			Status.fade = 300;
			Status.dlay = 300;

			return SCOPE.returnCall([ 'next' ]);

		});

		$DOCUMENT.on(Event.mouse, Selector.circle, function (event) {

			if (event.type === 'mouseenter') {

				clearInterval(Status.auto);

				circle_film.style.opacity = '1';
				circle_film.style.zIndex = '10';
			}

			if (event.type === 'mouseleave') {

				circle_film.style.opacity = '0';
				circle_film.style.zIndex = '0';

				return SCOPE.returnCall([ 'auto' ]);
			}
		});

		return SCOPE;
	}

	bind (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;

		let Str = SCOPE.storage();
		let _Str = SCOPE._storage({ visual: Str.visual });

		Data.circleLen = Data.circle.length;

		let bg = '', circle = '', titleGroup = '';

		for (let i=0; i<Data.circleLen; i++) {

			_Str.bg = Str.bg;
			_Str.circle = Str.circle;
			_Str.titleGroup = Str.titleGroup;

			bg += '\n'+_Str.bg.replace(SCOPE.reg('i'), i);

			circle += '\n'+_Str.circle.replace(SCOPE.reg('i'), i);

			titleGroup += '\n'+_Str.titleGroup
				.replace(SCOPE.reg('label'), Data.circle[i].label)
					.replace(SCOPE.reg('summary'), Data.circle[i].summary);

		}

		Data.strings =  _Str.visual
			.replace(SCOPE.reg('bg'), bg)
				.replace(SCOPE.reg('circle'), circle)
					.replace(SCOPE.reg('titleGroup'), titleGroup);

		return SCOPE;
	}

	append (arg) {

		const SCOPE = this;

		let Data = SCOPE.option.data;
		let Selector = SCOPE.option.selector;

		SCOPE.select(Selector.parent)[0].innerHTML = Data.strings;

		return SCOPE;
	}

	resize (callback) {

		const SCOPE = this;

		return SCOPE.returnCall(callback);
	}

	render (callback) {

		const SCOPE = this;

		return SCOPE.request((res) => {

			SCOPE.option.data.circle = res;

			return SCOPE.returnCall(callback);	
		});
	}
}

window.$UI_HEADLINE = new main({/* user only => _config.js */});