import url from 'url';

WebApp = Package.webapp.WebApp;
const Autoupdate = Package.autoupdate.Autoupdate;
const mom = Npm.require("moment");

WebApp.connectHandlers.use('/watsoncsvdownload', Meteor.bindEnvironment((req, res, next) => {
	const reqUrl = url.parse(req.url);
	if (reqUrl.pathname !== '/') {
	//	return next();
	}
	
	var code = req.query.order;
	if (code=="") {
		code = null;
	}
	var date = req.query.date1;
	if (date==undefined) {
		date = null;
	} else if (date!=null && date!="") {
		date = new Date(date);
	}
	var date2 = req.query.date2;
	if (date2==undefined) {
		date2 = null;
	} else if (date2!=null && date2!="") {
		date2 = new Date(date2);
		date2.setHours(23);
		date2.setMinutes(59);
	}
	var cat = req.query.service;
	if (cat=="") {
		cat = null;
	}else {
		cat = cat.split(",");
	}
	var category =  req.query.category;
	if (category == null || category=="") {
		category = null;
	} 
	
	res.setHeader('Content-Encoding','UTF-8');
	res.setHeader('Content-Disposition', 'attachment; filename=watson.csv');
	res.setHeader('content-type', 'application/csv; charset=UTF-8');

	var collectionData =  RocketChat.models.Botresult.findMatching2(code,date,date2,cat, category);

	var html = '\ufeffDienst;ChatID;Chat angenommen;Chat eingegangen;Antwortzeit;Reaktionszeit;Bearbeitungszeit;Chat geschlossen;Agent-ID;Intent;User-request;Answer-watson;Human_agent;Confidence_Level;Category\n';
	for (i=0;i<collectionData.length;i++) {
		html += collectionData[i].origin==null?"":collectionData[i].origin;
		html += ";";
		html += collectionData[i].code==null?"":collectionData[i].code;
		html += ";";
		
		html += (collectionData[i].takenTs==null?"":mom(collectionData[i].takenTs).utcOffset(60).format("D.M.YYYY HH:mm:ss"));
		html += ";";
		html += (collectionData[i].ts==null?"":mom(collectionData[i].ts).utcOffset(60).format("D.M.YYYY HH:mm:ss"));
		html += ";";
		html += (collectionData[i].respondedAt==null?"":mom(collectionData[i].respondedAt).utcOffset(60).format("D.M.YYYY HH:mm:ss"));
		html += ";";
		endDate = collectionData[i].respondedAt==null||collectionData[i].ts==null?null:mom(collectionData[i].respondedAt);
		if (endDate!=null) {
			var ms = 0;
			ms = endDate.diff(mom(collectionData[i].ts));
			
			var d = mom.duration(ms);
			var s = Math.floor(d.asHours()) + mom.utc(ms).format(":mm:ss");
			html += s;
		} else {
			html+="";
		}
		html += ";";
		endDate = collectionData[i].processingtime==null||collectionData[i].startAt==null?null:collectionData[i].processingtime;
		if (endDate!=null) {
			var d = mom.duration(endDate);
			var s = Math.floor(d.hours())+":"+Math.floor(d.minutes()) + ":"+Math.floor(d.seconds());
			html += s;
		} else {
			html+="";
		}
		html += ";";
		html += (collectionData[i].closedAt==null?"":mom(collectionData[i].closedAt).utcOffset(60).format("D.M.YYYY HH:mm:ss"));
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
		console.log(collectionData[i]); 
		html += (collectionData[i].closereason==null?"":collectionData[i].closereason);
		html += ";\n";
	}
	res.write(html);
	res.end();
}));
