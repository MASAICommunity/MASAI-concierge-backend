import moment from 'moment';

RocketChat.models.Botresult = new class extends RocketChat.models._Base {
	constructor() {
		super('botresult');
	}
	adaptDelta(arr) {
		arr.sort(function(a, b) {
			
			let res = a.code - b.code;
			if (res==0) {
				return a.ts - b.ts;
			}
			return res;
		});
		
		let lastCode = null;
		let lastCodeMap = [];
		for (var i = 0; i < arr.length; i++) {
			var a = arr[i];
			
			if (lastCode==null) {
				lastCode = a;
			}
			if (lastCode.code == a.code) {
				a.delta = lastCode.respondedAt; 
				
			}
			if (a.respondedAt!=null && a.ts != null) {
				if (lastCodeMap[a.code] == null) {
					lastCodeMap[a.code]  = { count: 0, second: 0, modetime: 0 };
				}
				
				const aS = a.ts == null ? 0 : a.ts.getTime();
				const minTime = a.takenTs == null || (a.respondedAt != null && a.takenTs.getTime() > a.respondedAt.getTime()) || a.takenTs.getTime() < aS ? aS : a.takenTs.getTime();
				//const minTime = a.takenTs == null || a.takenTs.getTime() > a.respondedAt.getTime() || a.takenTs.getTime() < a.ts.getTime() ? a.ts.getTime() : a.takenTs.getTime();
				if (a.transfer) {
					lastCodeMap[a.code].modetime = minTime;
				}
				if (lastCodeMap[a.code].modetime > 0) {
					lastCodeMap[a.code].second += (a.respondedAt.getTime() - minTime);
					
				} else {
					lastCodeMap[a.code].count += (a.respondedAt.getTime() - minTime);
				}
			}
			lastCode = a;
		}
		for (var i = 0; i < arr.length; i++) {
			var a = arr[i];
			
			const aS = a.ts == null ? 0 : a.ts.getTime();
			const minTime = a.takenTs == null || (a.respondedAt != null && a.takenTs.getTime() > a.respondedAt.getTime()) || a.takenTs.getTime() < aS ? aS : a.takenTs.getTime();
			//const minTime = a.takenTs == null || a.takenTs.getTime() > a.respondedAt.getTime() || a.takenTs.getTime() < a.ts.getTime() ? a.ts.getTime() : a.takenTs.getTime();
			if (lastCodeMap[a.code].modetime !== 0 && lastCodeMap[a.code].modetime <= minTime) {
				a.processingtime = lastCodeMap[a.code].second;
			} else {
				a.processingtime = lastCodeMap[a.code].count;
			}
		}
		
		return arr;
	}
	findMatching(code, date,date2,cat,category) {
		var data = this.fetchMatching(code, date,date2, Array.isArray(cat)?null:cat,category);
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
				itm.room = room;
				itm.closecomment = room.closecomment;
				itm.closereason = room.closereason;
				itm.startAt = room.ts;
				itm.closedAt = room.closedAt;
				itm.takenTs = room.takenTs;
			}
			else {
				itm.startAt = null;
				itm.closedAt = null;
			}
			if (category!=null && category != "" && itm.closereason != category) {
				return;
			}
			if (cat!=null && Array.isArray(cat) && cat.length > 0 && !cat.includes(itm.origin)) {
				return;
			}
			if(!itm.respondedAt) {
				itm.respondedAt = itm.ts;
			}
			data2.push(itm);
		});
		return this.adaptDelta(data2);
	}
	findMatching2(code, date,date2,cat, category) {
		var data = this.fetchMatching2(code, date,date2,Array.isArray(cat)?null:cat);
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
				itm.room = room;
				itm.closecomment = room.closecomment;
				itm.closereason = room.closereason;
				itm.startAt = room.ts;
				itm.closedAt = room.closedAt;
				itm.takenTs = room.takenTs;
			}
			else {
				itm.startAt = null;
				itm.closedAt = null;
			}
			
			if (category!=null && category != "" && itm.closereason != category) {
				return;
			}
			if (cat!=null && Array.isArray(cat) && cat.length > 0 && !cat.includes(itm.origin)) {
				return;
			}
			if(!itm.respondedAt) {
				itm.respondedAt = itm.ts;
			}
			data2.push(itm);
		});
		return this.adaptDelta(data2);
	}
	fetchMatching2(code, date,date2,cat) {
		if (code=="") {
			code = null;
		}
		if (date=="") {
			date = null;
		}
		
		if (date2=="") {
			date2 = null;
		}
		if (cat!=null && cat!="") {
			catFil = {
				'origin' : cat
			};
		} else {
			catFil = { };
		}
		
		if ((code==null && date==null && date2==null) || (code=="" && date=="" && date2=="")) {
			return this.find(Object.assign(catFil,{
			}),{offset:0,limit:1000000}).fetch();
		} else if ((date2==null)&&(date==null || date=="")) {

			return this.find(Object.assign(catFil,{
				'code' : parseInt(code)
			})).fetch();
		}
		else if ((date2==null)&&(code==null || code=="")) {

			return this.find(Object.assign(catFil,{
				ts : {
					$gte : date
				}
			}),{offset:0,limit:1000000}).fetch();
		} else if ((date==null)&&(code==null || code=="")) {

			return this.find(Object.assign(catFil,{
				ts : {
					$lt : date2
				}
			}),{offset:0,limit:1000000}).fetch();
		} else if ((code==null || code=="")) {
			
			return this.find(Object.assign(catFil,{
				ts : {
					$lt : date2,
					$gte : date
				}
			}),{offset:0,limit:1000000}).fetch();
		}
		else if ((date==null || date=="")) {

			return this.find(Object.assign(catFil,{
				ts : {
					$lt : date2
				},
				code : parseInt(code)
			}),{offset:0,limit:1000000}).fetch();
		}
		else if ((date2==null || date2=="")) {

			return this.find(Object.assign(catFil,{
				ts : {
					$gte : date
				},
				code : parseInt(code)
			}),{offset:0,limit:1000000}).fetch();
		}

		return this.find(Object.assign(catFil,{
				code : parseInt(code),
				ts : {
					$gte : date,
					$lt: date2
				}
			}),{offset:0,limit:1000000}).fetch();
	}

	fetchMatching(code, date,date2,cat,category) {
		if (code=="") {
			code = null;
		}
		if (date=="") {
			date = null;
		}
		if (date2=="") {
			date2 = null;
		}
		if (cat!=null && cat!="") {
			catFil = {
				'origin' : cat
			};
		} else {
			catFil = { };
		}
		
		catFil2 = { };
		if ((code==null && date==null && date2==null) || (code=="" && date=="" && date2=="")) {
			return this.find(Object.assign(catFil2,Object.assign(catFil,{
			})),{offset:0,limit:100}).fetch();
		} else if ((date2==null)&&(date==null || date=="")) {
			return this.find(Object.assign(catFil2,Object.assign(catFil,{
				'code' : parseInt(code)
			}))).fetch();
		}
		else if ((date2==null)&&(code==null || code=="")) {
			return this.find(Object.assign(catFil2,Object.assign(catFil,{
				ts : {
					$gte : date
				}
			})),{offset:0,limit:100}).fetch();
		} else if ((date==null)&&(code==null || code=="")) {

			return this.find(Object.assign(catFil2,Object.assign(catFil,{
				ts : {
					$lt : date2
				}
			})),{offset:0,limit:100}).fetch();
		} else if ((code==null || code=="")) {

			return this.find(Object.assign(catFil2,Object.assign(catFil,{
				ts : {
					$lt : date2,
					$gte : date
				}
			})),{offset:0,limit:100}).fetch();
		}
		else if ((date==null || date=="")) {

			return this.find(Object.assign(catFil2,Object.assign(catFil,{
				ts : {
					$lt : date2
				},
				code : parseInt(code)
			})),{offset:0,limit:100}).fetch();
		}
		else if ((date2==null || date2=="")) {

			return this.find(Object.assign(catFil2,Object.assign(catFil,{
				ts : {
					$gte : date
				},
				code : parseInt(code)
			})),{offset:0,limit:100}).fetch();
		}

		return this.find(Object.assign(catFil2,Object.assign(catFil,{
				code : parseInt(code),
				ts : {
					$gte : date,
					$lt: date2
				}
			})),{offset:0,limit:100}).fetch();
	}
	createIntermediateResult(code, userMessage, userid, origin) {
		const record = {
			intent : null,
			userid: userid,
			code: code,
			origin: origin,
			input: userMessage,
			alternative : null,
			output: null,
			ts: new Date(),
			channel: null,
			conversation: null,
			respondedAt: new Date(),
			msg: null
		}
		record._id = this.insert(record);
		//console.log(record);
		return record;
	}
	createResult(code,message, userid, alternative, respondedAt) {

		var result = this.find({code: code, msg: null}).fetch();
		var room = RocketChat.models.Rooms.findOne({code:parseInt(code)},{});
		
		if(result.length > 0) {
			var res = this.update({code: code, msg: null}, {
				$set : {
					intent : message==null?null:message.intents[0].intent,
					userid : userid,
					code : code,
					respondedAt: respondedAt,
					origin : room==null || room.rbInfo == null ? null : room.rbInfo.origin,
					confidence : message==null?null:message.intents[0].confidence,
					alternative : alternative,
					output : message==null?null:message.output.text[0],
					channel : message==null?null:message.context.channel,
					conversation: message==null?null:message.context.conversation_id,
					msg : message
					}
				});
				return;
		}
		else {
			const record = {
				intent : message==null?null:message.intents[0].intent,
				userid : userid,
				code : code,
					origin : room==null || room.rbInfo == null ? null : room.rbInfo.origin,
				confidence : message==null?null:message.intents[0].confidence,
				input : message==null?null:message.input.text,
				alternative : alternative,
				output : message==null?null:message.output.text[0],
				channel : message==null?null:message.context.channel,
				conversation: message==null?null:message.context.conversation_id,
				ts: new Date(),
				msg : message
			};
			record._id = this.insert(record);
			return record;
		}

	}
};
