RocketChat.tf = RocketChat.tf ? RocketChat.tf : {};

RocketChat.tf.checkWatson = function(code, msgs) {
	
	var http = require("http");
	totals = [];
	if (msgs==null) {
		return [];
	}
	msgs = JSON.parse(msgs.trim());
	unn = [];

	const room = RocketChat.models.Rooms.findLivechatByCode(code);
	if (room.closed) {
		return []; 
	}
	let channel = RocketChat.settings.get('Reisebuddy_WATSON_CHANNEL');
	let clientId = RocketChat.settings.get('Reisebuddy_WATSON_CLIENTID');
	let watsonURL = RocketChat.settings.get('Reisebuddy_WATSON_HOST');
	let headers = { 
	   'X-IBM-Client-ID': RocketChat.settings.get('Reisebuddy_WATSON_TOKEN'),
	   'Content-Type' : 'application/json'
	};
	if (room) {
		const hp = RocketChat.models.Extconf.getByRoom(room);
		room.hp = hp;
		if (hp && hp.watsonchannel) {
			channel = hp.watsonchannel;
		}
		if (hp && hp.skillid) {
			clientId = hp.skillid;
		}
		if (hp && hp.watsonendpoint) {
			watsonURL = hp.watsonendpoint;
		}
		if (hp && hp.watsonuser && hp.watsonpass) {
			
			var auth = 'Basic ' + Buffer.from( hp.watsonuser + ':' +  hp.watsonpass).toString('base64');
			headers = { 
				'Authorization' : auth,
			   'Content-Type' : 'application/json'
			};
		}
	}
	
	for (k=0;k<msgs.length && room;k++) {
		msg = msgs[k];
		if (msg==null || msg.trim()=="") {
			continue;
		}
		msg = msg.trim();
		//tabs and new lines are not allowed
		msg = msg.replace(/(\r?\n|\r|\t)/gm,' ');

		cachedResult = RocketChat.models.BotresultCache.findCachedResult(msg, room.hp ? room.hp._id : null);
		//Load from cache
		if(cachedResult) {
			var req = {
				data: cachedResult.output
			};

			for (var i=0;i<req.data.intents.length;i++) {
				if (req.data.output.text[i]==null) {
					continue;
				}
				
				totals.push({
					org : msg, 
					room: room,
					confidence : Math.round( req.data.intents[i].confidence * 100 * 100) / 100,
					intent : req.data.intents[i].intent,
					text : req.data.output.text[i],
					code : code,
					watson : JSON.stringify(req.data)
				});
			}
		}
		else { // query watson
			var req = HTTP.post(watsonURL,
			{
				headers : headers,
				data : {
					"input" : { "text" : msg.length < 2000 ? msg : msg.substring(0,1999) },
					"context" : { "clientID" : clientId, "SkillID": clientId, "channel": channel, code: room.code }
				}
			});
			
			console.log("WATSON RESULT >>>>>>>>>>>> ", req);
			
			
			for (var i=0;i<req.data.intents.length;i++) {
				let question = req.data.output.text[i];
				if (req.data.output.text[i]==null) {
					if (req.data.output.generic[i] && req.data.output.generic[i].options) {
						question = req.data.output.generic[i].title+"\n";
						for (let mi=0;mi<req.data.output.generic[i].options.length;mi++) {
							question += "\n"+(mi+1)+". "+ (req.data.output.generic[i].options[mi].label);
						}
						req.data.output.text[i] = question;
					}
				}
				if (unn[question]!=null) {
					continue;
				}
				unn[question] = 1;
				
				totals.push({
					org : msg,
					room: room,
					confidence : Math.round( req.data.intents[i].confidence * 100 * 100) / 100,
					intent : req.data.intents[i].intent,
					text : question,
					code : code,
					watson : JSON.stringify(req.data)
				});
			}
			RocketChat.models.BotresultCache.createResult(req.data, room.hp ? room.hp._id : null);

		}
	}
	
	totals.sort(function(a, b) {
		return b.confidence - a.confidence;
	})
	return totals;

};
Meteor.methods({
	'masai:botCSV' : function (code,dat,dat2,dienst) {
		//var collectionData = CollectionToExtract.find().fetch();
		var heading = true; // Optional, defaults to true
		var delimiter = ";" // Optional, defaults to ",";
		var collectionData =  RocketChat.models.Botresult.findMatching2(code,dat,dat2,dienst);
		return CSV.unparse(collectionData, heading, delimiter);

	},
	'masai:botResults' : function (code,dat,dat2,dienst,category) {
		if (dat2) {
			dat2.setHours(23);
		dat2.setMinutes(59);
		}
		lis =  RocketChat.models.Botresult.findMatching(code,dat,dat2,dienst,category);
		return lis;
	},
	'masai:storeWatson' : function (code,msgs, alternative) {
		userid = Meteor.userId();

		//bot =  RocketChat.models.Botresult.createResult(code,JSON.parse(msgs), userid, alternative, new Date());

		return bot;
	},
	'masai:storeIntermediateWatson' : function(code, msg) {
		console.log("Called store intermediate message");
		userid = Meteor.userId();
		bot = RocketChat.models.Botresult.createIntermediateResult(code, msg, userid);
		return bot;
	},
	'masai:checkWatson' : function (code,msgs) {
		console.log(code);
		console.log(msgs);
		return RocketChat.tf.checkWatson (code, msgs);
	},
	'masai:clearWatsonCache' : function() {
		return RocketChat.models.BotresultCache.clearCache();
	}
});
