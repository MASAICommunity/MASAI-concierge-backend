RocketChat.models.BotresultCache = new class extends RocketChat.models._Base {
	constructor() {
		super('botresultcache');
	}
	createResult(message) {
		const record = {
			ts: new Date(),
			input : message.input.text,
			output : message
		};
		record._id = this.insert(record);
		return record;
	}
	findCachedResult(input) {
		return this.findOne({input: input, ts : { $gte : new Date(Date.now() - 86400000) }});
	}
	clearCache() {
		return this.remove({});
	}
};
