import url from 'url';

WebApp = Package.webapp.WebApp;
const Autoupdate = Package.autoupdate.Autoupdate;
const mom = Npm.require("moment");

WebApp.connectHandlers.use('/apilivechat', Meteor.bindEnvironment((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader('Content-Encoding','UTF-8');
	res.setHeader('content-type', 'application/json; charset=UTF-8');
	const reqUrl = url.parse(req.url);
	
	const id = req.query.id;
	const extConf = RocketChat.models.Extconf.findOneById(id);
	
	let html = JSON.stringify(extConf, ["_id","questionbackground","showCallTwoAction","showNoOverlay","showNoButton","extendcolor","questioncolor","moreQuestions","extracss","headertitle","color","coloroffline","infomessage",
	"display"]);
	res.write(html);
	res.end();
}));
