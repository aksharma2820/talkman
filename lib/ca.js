class CA {

	constructor (opts = {}) {
		if (!opts.onReq)
			throw new Error ('manadatory onReq handler missing');

		if (!opts.onInfo)
			throw new Error ('manadatory onInfo handler missing');

		if (!opts.transportInstance)
			throw new Error ('manadatory transportInstance missing');


		const defaults = this._getDefaults ();
		this._opts = {
			...defaults,
			...opts
		};

		this.transport = opts.transportInstance;
		this.onReq     = opts.onReq;
		this.onInfo    = opts.onInfo;

		this.seq = 0;
		this.reqPromises = new Map ();
		this.transport.onMessage = this.onMessage.bind(this);
	}

	sendReq (userPayload) {
		const seqId = this._getSeqId ();
		const type  = 'REQUEST';
		const systemPayload = {
			type,
			seqId,
			userPayload,
		};

		this.transport.send (systemPayload);

		return new Promise ((resolve, reject) => {
			const metaPromise = {
				resolve,
				reject
			};

			this.reqPromises.set (seqId, metaPromise);
		});

	}

	sendInfo (userPayload) {
		const seqId = this._getSeqId ();
		const type  = 'INFO';
		const systemPayload = {
			type,
			seqId,
			userPayload,
		};

		this.transport.send (systemPayload);
	}

	onMessage (systemPayload) {
		const type = systemPayload.type;

		switch (type) {
			case 'REQUEST':
				this._handleRequest(systemPayload);
				break;
			case 'INFO':
				this._handleInfo (systemPayload);
				break;
			case 'RESPONSE':
				this._handleResponse (systemPayload);
				break;
			default :
				throw new Error ('bad message type');
		}
	}

	_handleInfo (systemPayload) {
		const userPayload = systemPayload.userPayload;
		//const seqid       = systemPayload.seqId;


		/* Defensive checks */
		this.onInfo(userPayload);
	}

	async _handleRequest (systemPayload) {
		const userPayload = systemPayload.userPalyoad;
		const seqId       = systemPayload.seqId;


		let responsePayload = {
			type  : "RESPONSE",
			seqId : seqId
		};

		try {
			const response = await this.onReq(userPayload);

			responsePayload.userPayload = response;
			responsePayload.subType = 'ACK';
		}
		catch (err) {
			responsePayload.userPayload = err;
			responsePayload.subType = 'NACK';
		}

		this.transport.send(responsePayload);

	}

	_handleResponse (systemPayload) {
		const subType = systemPayload.subType;
		const userPayload = systemPayload.userPalyoad;
		const seqId       = systemPayload.seqId;

		/*
		 * TODO 
		 * Defensive checks for missing keys
		 */

		const reqPromise = this.reqPromises.get (seqId);

		if (subType === 'ACK') {
			reqPromise.resolve (userPayload);
			return;
		}
		if (subType === 'NACK') {
			reqPromise.reject (userPayload);
			return;
		}

		/*
		 * TODO
		 * Defensive check for bad subType 
		 * or for subType missing 
		 */
	}

	_getSeqId () {
		return '' + this.seq++;
	}

	_getDefaults () {
		return {};
	}
}

export default CA;
