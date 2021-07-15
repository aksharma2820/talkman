

class TransportBrowserWindow {

	constructor (config = {}) {
		if (!config.sourceWindow)
			throw new Error ('mandatory source missing');

		if (!config.targetWindow)
			throw new Error('mandatory target missing');



		this.config       = config;
		this.sourceWindow = config.sourceWindow;
		this.targetWindow = config.targetWindow;

		this.targetOrigin = config.targetOrigin || "*";
	}

	set onMessage (listener) {
		this.listener = listener;
		this.addEventListener();
	}

	get onMessage () {
		return this.listener;
	}

	addEventListener () {
		let self = this;
		this.sourceWindow.addEventListener ("message", (ev) => {
			self.onMessage(ev.data);
		});
	}


	send (systemPayload) {
		this.targetWindow.postMessage(systemPayload, this.targetOrigin);
	}
}

export default TransportBrowserWindow;
