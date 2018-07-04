const TouchManager = function constructor(obj) {
    const pool = {};

	const eventsPool = {}
	const canvas = obj instanceof CanvasRenderingContext2D ? obj.canvas : obj instanceof HTMLCanvasElement ? obj : null
	
	this.add = function (touch) {
		pool[touch.identifier] = {
			pos: [
				(touch.clientX-canvas.getBoundingClientRect().left) * canvas.width/canvas.offsetWidth,
				(touch.clientY-canvas.getBoundingClientRect().top) * canvas.height/canvas.offsetHeight,
			],
			touch: touch
        }
        for (let id in eventsPool) {
            if (eventsPool[id].eventType === 'add') {
                eventsPool[id].callback(pool[touch.identifier],this)
            }
        }
		return this;
	};

	this.remove = function (touch) {
		if (touch.identifier in pool) {
            for (let id in eventsPool) {
                if (eventsPool[id].eventType === 'remove') {
                    eventsPool[id].callback(pool[touch.identifier], this)
                }
            }
			delete pool[touch.identifier];
		}
		return this;
	}

	this.update = function (touch) {
		pool[touch.identifier].pos = [
		        (touch.clientX - canvas.getBoundingClientRect().left) * canvas.width / canvas.offsetWidth,
		        (touch.clientY - canvas.getBoundingClientRect().top) * canvas.height / canvas.offsetHeight,
		    ]
		
		pool[touch.identifier].touch = touch

		for (let id in eventsPool) {
		    if (eventsPool[id].eventType === 'update') {
		        eventsPool[id].callback(pool[touch.identifier], this)
		    }
        }
        return this
	};
	
	Object.defineProperties(this, {
		'pool': {
			'enumerable': true,
			'configurable': false,
			get: () => pool,
        },
        'addEventListener': {
            'enumerable': true,
            'configurable': false,
            'writable': false,
            'value': function (eventType,callback) {
                const id = Math.floor(1000000*Math.random()).toString()
                eventsPool[id] = {eventType, callback}
                return id
            }
        },
	})
	
	canvas.addEventListener('touchstart', event => {
		event.preventDefault()
		for (let i = 0; i < event.changedTouches.length; i++ ) {
			let touch = event.changedTouches[i];
			this.add(touch);
		}
	}, false);
	
	canvas.addEventListener('touchmove', event => {
		event.preventDefault()
		for (let i = 0; i < event.changedTouches.length; i++ ) {
			let touch = event.changedTouches[i];
			this.update(touch);
		}
	}, false);

	canvas.addEventListener('touchend', event => {
		for (let i = 0; i < event.changedTouches.length; i++ ) {
			let touch = event.changedTouches[i];
			this.remove(touch);
		}
	}, false);
	
	canvas.addEventListener('touchcancel', event => {
		for (let i = 0; i < event.changedTouches.length; i++ ) {
			let touch = event.changedTouches[i];
			this.remove(touch);
		}
	}, false);
    
    ['mousemove','mousedown','mouseup'].forEach( eventName =>
        canvas.addEventListener(eventName, event => {
            event.identifier = 'mouse'
            
            if (event.buttons === 1 && !(event.identifier in pool)) {
                this.add(event)
            } else if (event.buttons === 1 && (event.identifier in pool)) {
                this.update(event)
            } else if (event.buttons !== 1 && (event.identifier in pool)) {
                this.remove(event)
            }
            
        })
    )
	
}