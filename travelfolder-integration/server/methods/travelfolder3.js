
Meteor.methods({
	'masai:botCSV' : function (code,dat,dat2) {
		//var collectionData = CollectionToExtract.find().fetch();
		var heading = true; // Optional, defaults to true
		var delimiter = ";" // Optional, defaults to ",";
		var collectionData =  RocketChat.models.Botresult.findMatching2(code,dat,dat2);
		return CSV.unparse(collectionData, heading, delimiter);

	},
	'masai:botResults' : function (code,dat,dat2) {
		if (dat2) {
			dat2.setHours(23);
		dat2.setMinutes(59);
		}
		lis =  RocketChat.models.Botresult.findMatching(code,dat,dat2);
		return lis;
	},
	'masai:storeWatson' : function (code,msgs, alternative) {
		console.log(msgs);
		userid = Meteor.userId();

		bot =  RocketChat.models.Botresult.createResult(code,JSON.parse(msgs), userid, alternative);

		return bot;
	},
	'masai:storeIntermediateWatson' : function(code, msg) {
		console.log("Called store intermediate message");
		userid = Meteor.userId();
		bot = RocketChat.models.Botresult.createIntermediateResult(code, msg, userid);
		return bot;
	},
	'masai:checkWatson' : function (code,msgs) {
		console.log("Called checkWatson", code, msgs);

		var http = require("http");

		headers = {
		   'X-IBM-Client-ID': RocketChat.settings.get('Reisebuddy_WATSON_TOKEN'),
		   'Content-Type' : 'application/json'
		};

		totals = [];
		if (msgs==null) {
			return [];
		}
		msgs = JSON.parse(msgs.trim());
		unn = [];

		for (k=0;k<msgs.length;k++) {
			msg = msgs[k];
			if (msg==null || msg.trim()=="") {
				continue;
			}
			msg = msg.trim();
			//tabs and new lines are not allowed
			msg = msg.replace(/\t/g, ' ').replace(/\n/g,' ');

			cachedResult = RocketChat.models.BotresultCache.findCachedResult(msg);
			//Load from cache
			if(cachedResult) {
				var req = {
					data: cachedResult.output
				};

				console.log(req.data.intents.length);
				for (var i=0;i<req.data.intents.length;i++) {
					if (req.data.output.text[i]==null) {
						continue;
					}
					/* not really sure what this does
					if (unn[req.data.output.text[i]]!=null) {
						continue;
					}
					unn[req.data.output.text[i]] = 1; */
					totals.push({
						org : msg, 
						confidence : Math.round( req.data.intents[i].confidence * 100 * 100) / 100,
						intent : req.data.intents[i].intent,
						text : req.data.output.text[i],
						code : code,
						watson : JSON.stringify(req.data)
					});
				}
			}
			else { // query watson
				var req = HTTP.post(RocketChat.settings.get('Reisebuddy_WATSON_HOST'),
				{
					headers : headers,
					data : {
						"input" : { "text" : msg },
						"context" : { "clientID" : RocketChat.settings.get('Reisebuddy_WATSON_CLIENTID'), "channel": RocketChat.settings.get('Reisebuddy_WATSON_CHANNEL') }
					}
				})
				for (var i=0;i<req.data.intents.length;i++) {
					if (req.data.output.text[i]==null) {
						continue;
					}
					if (unn[req.data.output.text[i]]!=null) {
						continue;
					}
					unn[req.data.output.text[i]] = 1;
					console.log("t++",totals.length);
					totals.push({
						org : msg,
						confidence : Math.round( req.data.intents[i].confidence * 100 * 100) / 100,
						intent : req.data.intents[i].intent,
						text : req.data.output.text[i],
						code : code,
						watson : JSON.stringify(req.data)
					});
				}
				RocketChat.models.BotresultCache.createResult(req.data);

			}
		}
		console.log(totals.length);
		totals.sort(function(a, b) {
			return b.confidence - a.confidence;
		})
		return totals;
	},
	'masai:clearWatsonCache' : function() {
		return RocketChat.models.BotresultCache.clearCache();
	}
});
