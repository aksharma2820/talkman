
class SystemPayload {

	constructor (msg, opts) {
		
		if (!msg.header)
			throw new Error('header attr missing, cannot parse further');

		if (!msg.header.seqId)
			throw new Error('mandatory seqId missing');

		if (!msg.header.type)
			throw new Error ('mandatory type missing');

		const _defaults  = this._getDefaultHeaders ();
		const _headers   = msg.header;

		this.header = {
			..._defaults,

			/* Overrides */
			..._headers
		};

		this.payload = msg.payload;
	}

	_getDefaultHeaders () {
		return {};
	}

	set subType (value) {
		this.header.subType = value;
	}

	get subType () {
		return this.header.subType;
	}

	get type () {
		return this.header.type;
	}

	get seqId () {
		return this.header.seqId;
	}

	get headers () {
		return this.header;
	}
}

export default SystemPayload;
