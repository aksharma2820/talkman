import SystemPayload from './system-payload';

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

	sendReq (payload = {}, opts = {}) {

		const seqId         = this._getSeqId ();
		const type          = 'REQUEST';

		const header = {
			seqId,
			type
		};

		const msg = {
			header,
			payload
		};

		const systemPayload = new SystemPayload (msg, opts);

		this.transport.send (systemPayload);

		return new Promise ((resolve, reject) => {
			const metaPromise = {
				resolve,
				reject
			};

			this.reqPromises.set (seqId, metaPromise);
		});
	}

	sendInfo (payload = {}, opts = {}) {

		const seqId  = this._getSeqId ();
		const type   = 'INFO';

		const header = {
			seqId,
			type
		};

		const msg = {
			header,
			payload
		};

		const systemPayload = new SystemPayload (msg, opts);

		this.transport.send (systemPayload);
	}

	onMessage (msg) {
		if (!msg.header)
			return;

		const systemPayload = new SystemPayload (msg);

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
		const userPayload = systemPayload.payload;
		//const seqid       = systemPayload.seqId;


		/* Defensive checks */
		this.onInfo(userPayload);
	}

	async _handleRequest (systemPayload) {
		const userPayload = systemPayload.payload;
		const seqId       = systemPayload.seqId;


		let responsePayload = new SystemPayload ({
			header : {
				type : "RESPONSE",
				seqId : seqId
			}
		});

		try {
			const response = await this.onReq(userPayload);

			responsePayload.payload = response;
			responsePayload.subType = 'ACK';
		}
		catch (err) {
			responsePayload.payload = err;
			responsePayload.subType = 'NACK';
		}

		this.transport.send(responsePayload);
	}

	_handleResponse (systemPayload) {
		const subType     = systemPayload.subType;
		const userPayload = systemPayload.payload;
		const seqId       = systemPayload.seqId;

		/*
		 * TODO 
		 * Defensive checks for missing keys
		 */

		if (!seqId) {
			console.log ({systemPayload},'no seqId, ignoring message')
			return;
		}

		const reqPromise = this.reqPromises.get (seqId);

		if (!reqPromise) {
			console.log ({systemPayload}, 'no reqPromise corresponding to seqId, ignoring...')
			return;
		}

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
