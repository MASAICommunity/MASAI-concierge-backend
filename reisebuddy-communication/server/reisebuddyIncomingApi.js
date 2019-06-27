import { Meteor } from 'meteor/meteor';
import {LivechatVisitors} from 'meteor/rocketchat:livechat';
import { RocketChat } from 'meteor/rocketchat:lib';
/**
 * Api-Extension for Reisebuddy
 */
const RB_API = new Restivus({
	apiPath: 'reisebuddy-api/',
	useDefaultAuth: true,
	prettyJson: true
});

RB_API.addRoute('incoming/:service', {
	/**
	 * Creates a message based on the service provided by the url. Based on the service, there may be a basicAuth
	 * @see rocketchat-livechat\server\api.js
	 * @return {*} statusCode 40x on error or  200 + recived timestamp as json body
	 */
	post() {
		const service = _dbs.getCommunicationService(this.urlParams.service);
		if (!service) {
			return {statusCode: 404, message: "no service found"};
		}
		let message;
		try {
			message = service.parse(this.bodyParams);
		} catch (e) {
			SystemLogger.warn("rejected malformed request: " + JSON.stringify(this.bodyParams) + "\nException: " +
							  e.message);
			return {statusCode: 500, message: "malformed request"};
		}
		
		if (message.from!=null && !message.from.startsWith("00")) {
			if (message.from.startsWith("+49")) {
				message.from =  "00" + message.from.replace('+49', '49');
			} else if (message.from.startsWith("0")) {
				message.from = message.from.replace('0',"0049");
			} else {
				message.from = "0049" + message.from;
			}
		}

		let visitor = RocketChat.models.LivechatVisitors.findOneVisitorByPhone(message.from);
		if (visitor) {
			visitor.profile = visitor;
		} else {
			const query = {
				'username': message.from
			};
			
			
			visitor =  RocketChat.models.LivechatVisitors.findOne(query);
			if (visitor) {
				visitor.profile = visitor;
			} 
		}
		
		
		if (this.bodyParams.origin!=null) {
			finalOrigin = RocketChat.models.Phoneasso.find({num : this.bodyParams.origin}).fetch();
			if (finalOrigin!=null && finalOrigin.length>0) {
			finalOrigin = finalOrigin[0].name;
			}
		} else {
			finalOrigin = null;
		}
		
		let sendStub = {
			message: {
				_id: Random.id(),
				msg: message.body.length < 1000 ? message.body : message.body.substring(0, 1000),
				dbsms: this.bodyParams.dbsms,
				origin : finalOrigin
			},
			roomInfo: {
				origin : finalOrigin,
				rbInfo: {
					origin : finalOrigin,
					source: service.getRoomType(message.from),
					visitorSendInfo: message.from,
					serviceName: service.getServiceName(),
					dbsms: this.bodyParams.dbsms
				}
			}
		};
		if (visitor) {
			const rooms = RocketChat.models.Rooms.findOpenByVisitorToken(visitor.profile.token).fetch();
			if (rooms && rooms.length > 0) {
				sendStub.message.rid = rooms[0]._id;
			} else {
				sendStub.message.rid = Random.id();
			}
			
			sendStub.message.token = visitor.profile.token;
		} else {
			
			sendStub.message.rid = Random.id();
			sendStub.message.token = Random.id();

			const guestInfo = service.extendNewUser({
				username: message.from, 
				token: sendStub.message.token
            }, this.bodyParams);
            const userId = RocketChat.Livechat.registerGuest(guestInfo);
			
			visitor = RocketChat.models.LivechatVisitors.findById(userId).fetch();
			if (visitor==null || visitor.length <= 0) {
			visitor = RocketChat.models.Users.findById(userId);
			}
			else {
				visitor = visitor[0];
			}
		}
		sendStub.guest = visitor;
		
		RocketChat.Livechat.sendMessage(sendStub);
		return {
			statusCode: 200,
			body: {received: new Date() }
		};
	}
});
