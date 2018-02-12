import url from 'url';

WebApp = Package.webapp.WebApp;
const Autoupdate = Package.autoupdate.Autoupdate;
const mom = Npm.require("moment");

WebApp.connectHandlers.use('/watsoncsvdownload', Meteor.bindEnvironment((req, res, next) => {
	const reqUrl = url.parse(req.url);
	if (reqUrl.pathname !== '/') {
	//	return next();
	}
	var code = req.url.split('/').length<=0? null :  req.url.split('/')[0];
	if (code=="") {
		code = null;
	}
	var date = req.url.split('/').length<=1? null :  req.url.split('/')[1];
	if (date==undefined) {
		date = null;
	} else if (date!=null && date!="") {
		date = new Date(date);
	}
	var date2 = req.url.split('/').length<=2? null :  req.url.split('/')[2];
	if (date2==undefined) {
		date2 = null;
	} else if (date2!=null && date2!="") {
		date2 = new Date(date2);
		date2.setHours(23);
		date2.setMinutes(59);
		console.log(date2);
	}
	res.setHeader('Content-Encoding','UTF-8');
	res.setHeader('Content-Disposition', 'attachment; filename=watson.csv');
	res.setHeader('content-type', 'application/csv; charset=UTF-8');

	var collectionData =  RocketChat.models.Botresult.findMatching2(code,date,date2);

	var html = '\ufeffChatID;Chat eingegangen;Antwortzeit;Reaktionszeit;Chat geschlossen;Bearbeitungszeit;Agent-ID;Intent;User-request;Answer-watson;Human_agent;Confidence_Level;Nodes_Visited;Conversation_id;Nodex_Output_Map\n';
	for (i=0;i<collectionData.length;i++) {
		console.log(collectionData[i]);
		html += collectionData[i].code==null?"":collectionData[i].code;
		html += ";";
		html += (collectionData[i].startAt==null?"":mom(collectionData[i].startAt).format("D.M.YYYY HH:mm"));
		html += ";";
		html += (collectionData[i].respondedAt==null?"":mom(collectionData[i].respondedAt).format("D.M.YYYY HH:mm"));
		html += ";";
		endDate = collectionData[i].respondedAt==null||collectionData[i].startAt==null?null:mom(collectionData[i].respondedAt);
		if (endDate!=null) {
			var ms = endDate.diff(mom(collectionData[i].startAt));
			var d = mom.duration(ms);
			var s = Math.floor(d.asHours()) + mom.utc(ms).format(":mm:ss");
			html += s;//(collectionData[i].ts==null?"":mom(collectionData[i].ts).format("D.M.YYYY HH:mm"));
		} else {
			html+="";
		}
		html += ";";
		html += (collectionData[i].closedAt==null?"":mom(collectionData[i].closedAt).format("D.M.YYYY HH:mm"));
		html += ";";
		endDate = collectionData[i].closedAt==null||collectionData[i].startAt==null?null:mom(collectionData[i].closedAt);
		if (endDate!=null) {
			var ms = endDate.diff(mom(collectionData[i].startAt));
			var d = mom.duration(ms);
			var s = Math.floor(d.asHours()) + mom.utc(ms).format(":mm:ss");
			html += s;//(collectionData[i].ts==null?"":mom(collectionData[i].ts).format("D.M.YYYY HH:mm"));
		} else {
			html+="";
		}
		html += ";";
		html += collectionData[i].userid;
		html += ";";
		html += (collectionData[i].intent==null?"":JSON.stringify(collectionData[i].intent.toString("utf8")));
		html += ";";
		html += (collectionData[i].input==null?"":JSON.stringify(collectionData[i].input.toString("utf8")));
		html += ";";
		html += (collectionData[i].output==null?"":JSON.stringify(collectionData[i].output.toString("utf8")));
		html += ";";
		html += (collectionData[i].alternative==null?"":JSON.stringify(collectionData[i].alternative.toString("utf8")));
		html += ";";
		html += collectionData[i].confidence;
		html += ";";
		html += (collectionData[i].msg==null?"":collectionData[i].msg.output.nodes_visited==null?"":collectionData[i].msg.output.nodes_visited.toString());
		html += ";";
		html += (collectionData[i].msg==null?"":collectionData[i].msg.output.nodes_visited==null?"":collectionData[i].msg.context.conversation_id.toString());
		html += ";";
		html += (collectionData[i].msg==null?"":collectionData[i].msg.context.system._node_output_map==null?"":JSON.stringify(collectionData[i].msg.context.system._node_output_map));
		html += ";\n";
	}
	res.write(html);
	res.end();
}));
