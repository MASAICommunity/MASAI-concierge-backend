RocketChat.models.Botresult = new class extends RocketChat.models._Base {
	constructor() {
		super('botresult');
	}

	findMatching(code, date,date2) {
		var data = this.fetchMatching(code, date,date2);
		var roomCache = {};
		var data2 = [];
		data.forEach(function(itm) {
			var room = null;
			if(roomCache[itm.code]) {
				room = roomCache[itm.code];
			}
			else {
				room = RocketChat.models.Rooms.findOne({code: parseInt(itm.code)});
				roomCache[itm.code] = room;
			}

			if(room) {
				itm.startAt = room.ts;
				itm.closedAt = room.closedAt;
			}
			else {
				itm.startAt = null;
				itm.closedAt = null;
			}
			if(!itm.respondedAt) {
				itm.respondedAt = itm.ts;
			}
			data2.push(itm);
		});
		return data2;
	}
	findMatching2(code, date,date2) {
		var data = this.fetchMatching2(code, date,date2);
		var roomCache = {};
		var data2 = [];
		data.forEach(function(itm) {
			var room = null;
			if(roomCache[itm.code]) {
				room = roomCache[itm.code];
			}
			else {
				room = RocketChat.models.Rooms.findOne({code: parseInt(itm.code)});
				roomCache[itm.code] = room;
			}
			if(room) {
				itm.startAt = room.ts;
				itm.closedAt = room.closedAt;
			}
			else {
				itm.startAt = null;
				itm.closedAt = null;
			}
			if(!itm.respondedAt) {
				itm.respondedAt = itm.ts;
			}
			data2.push(itm);
		});
		return data2;
	}
	fetchMatching2(code, date,date2) {
		if (code=="") {
			code = null;
		}
		if (date=="") {
			date = null;
		}
		if ((code==null && date==null && date2==null) || (code=="" && date=="" && date2=="")) {
			return this.find({
			},{offset:0,limit:1000000}).fetch();
		} else if ((date2==null)&&(date==null || date=="")) {

			return this.find({
				'code' : parseInt(code)
			}).fetch();
		}
		else if ((date2==null)&&(code==null || code=="")) {

			return this.find({
				ts : {
					$gte : date
				}
			},{offset:0,limit:1000000}).fetch();
		} else if ((date==null)&&(code==null || code=="")) {

			return this.find({
				ts : {
					$lt : date2
				}
			},{offset:0,limit:1000000}).fetch();
		} else if ((code==null || code=="")) {

			return this.find({
				ts : {
					$lt : date2,
					$gte : date
				}
			},{offset:0,limit:1000000}).fetch();
		}
		else if ((date==null || date=="")) {

			return this.find({
				ts : {
					$lt : date2
				},
				code : parseInt(code)
			},{offset:0,limit:1000000}).fetch();
		}
		else if ((date2==null || date2=="")) {

			return this.find({
				ts : {
					$gte : date
				},
				code : parseInt(code)
			},{offset:0,limit:1000000}).fetch();
		}

		return this.find({
				code : parseInt(code),
				ts : {
					$gte : date,
					$lt: date2
				}
			},{offset:0,limit:1000000}).fetch();
	}

	fetchMatching(code, date,date2) {
		if (code=="") {
			code = null;
		}
		if (date=="") {
			date = null;
		}
		if (date2=="") {
			date2 = null;
		}
		if ((code==null && date==null && date2==null) || (code=="" && date=="" && date2=="")) {
			return this.find({
			},{offset:0,limit:100}).fetch();
		} else if ((date2==null)&&(date==null || date=="")) {

			return this.find({
				'code' : parseInt(code)
			}).fetch();
		}
		else if ((date2==null)&&(code==null || code=="")) {

			return this.find({
				ts : {
					$gte : date
				}
			},{offset:0,limit:100}).fetch();
		} else if ((date==null)&&(code==null || code=="")) {

			return this.find({
				ts : {
					$lt : date2
				}
			},{offset:0,limit:100}).fetch();
		} else if ((code==null || code=="")) {

			return this.find({
				ts : {
					$lt : date2,
					$gte : date
				}
			},{offset:0,limit:100}).fetch();
		}
		else if ((date==null || date=="")) {

			return this.find({
				ts : {
					$lt : date2
				},
				code : parseInt(code)
			},{offset:0,limit:100}).fetch();
		}
		else if ((date2==null || date2=="")) {

			return this.find({
				ts : {
					$gte : date
				},
				code : parseInt(code)
			},{offset:0,limit:100}).fetch();
		}

		return this.find({
				code : parseInt(code),
				ts : {
					$gte : date,
					$lt: date2
				}
			},{offset:0,limit:100}).fetch();
	}
	createIntermediateResult(code, userMessage, userid) {
		const record = {
			intent : null,
			userid: userid,
			code: code,
			input: userMessage,
			alternative : null,
			output: null,
			channel: null,
			conversation: null,
			respondedAt: new Date(),
			msg: null
		}
		record._id = this.insert(record);
		console.log(record);
		return record;
	}
	createResult(code,message, userid, alternative) {

		var result = this.find({code: code, msg: null}).fetch();
		if(result.length > 0) {
			var res = this.update({code: code, msg: null}, {
				$set : {
					intent : message.intents[0].intent,
					userid : userid,
					code : code,
					confidence : message.intents[0].confidence,
					alternative : alternative,
					output : message.output.text[0],
					channel : message.context.channel,
					conversation: message.context.conversation_id,
					ts: new Date(),
					msg : message
					}
				});
				return;
		}
		else {
			const record = {
				intent : message.intents[0].intent,
				userid : userid,
				code : code,
				confidence : message.intents[0].confidence,
				input : message.input.text,
				alternative : alternative,
				output : message.output.text[0],
				channel : message.context.channel,
				conversation: message.context.conversation_id,
				ts: new Date(),
				msg : message
			};
			record._id = this.insert(record);
			return record;
		}

	}
};
