var Future = Npm.require('fibers/future');
const SECRET_KEY = '0g4mSVuxf7JaR1kLtKIodaxCK7-a_3WamyANT5ZtNSznbWV3wYKZNduCY2ydx2Ud';
const API_URL = 'https://qjchuhm517.execute-api.eu-central-1.amazonaws.com/latest'; //url to the API-Gateway
const AUTH0_DOMAIN = '5lvl-tf.eu.auth0.com';
const AUTH0_CLIENTID = '3VcTXlDJyBUZVrppBuP6dQMm3l6H1CXN';
const AUTH0_REALM = 'Username-Password-Authentication';
const AUTH0_USER = 'travelfolder@journey-concierge.com';
const AUTH0_PW = 'Masai!';
const auth0 = Npm.require('auth0-js');

RocketChat.tf = {};
RocketChat.models.Messages.updateMany = function(qry, upd) {
	return this._db.updateMany(qry,upd);
};
RocketChat.tf.formatting = function(x, arguments) {
			var formatted = x;
			for( var arg in arguments ) {
				formatted = formatted.replace("{" + arg + "}", arguments[arg]);
			}
			return formatted;
		};
Meteor.methods({
        'masai:getJourneysForUser'(userId) {
                const auth0 = Npm.require('auth0-js');
                var jwt = Npm.require('jsonwebtoken');
                var uuid = Npm.require('uuid4');
                var jwtdecode = Npm.require('jwt-decode');
                var unmarshalItem = Npm.require('dynamodb-marshaler').unmarshalItem;
                var marshalItem = Npm.require('dynamodb-marshaler').marshalItem;
                let auth0init = new auth0.WebAuth({
                domain: RocketChat.settings.get('Reisebuddy_AUTH0_DOMAIN'), // AUTH0_DOMAIN, // auth0-domain
                        clientID: RocketChat.settings.get('Reisebuddy_AUTH0_CLIENTID'), //AUTH0_CLIENTID //auth0 -ClientID
                });
                var future = new Future();
                auth0init.client.login({
                realm: RocketChat.settings.get('Reisebuddy_AUTH0_REALM'), //AUTH0_REALM, //connection name or HRD domain
                        username: RocketChat.settings.get('Reisebuddy_AUTH0_USER'), //AUTH0_USER,
                        password: RocketChat.settings.get('Reisebuddy_AUTH0_PW'), //AUTH0_PW,
                        scope: 'openid'
                }, function (error, authResult) {
                if (error)
                        future.return(error);
                        else
                        future.return(authResult);
                }
                );
                const result = future.wait();
                let idToken = result.idToken;
                ;
                let newToken = jwt.sign(jwtdecode(idToken), RocketChat.settings.get('Reisebuddy_AWS_SECRET_KEY'));
                //  console.log(newToken);
                const headers_content = {
                'Authorization': 'Bearer ' + newToken,
                        'Content-Type': 'application/json'
                };
                var url = RocketChat.settings.get('Reisebuddy_AWS_URL') + userId + '/journeys';
                var journeys = HTTP.get(url, {headers: headers_content});
                journeys = journeys.data.Items.map(unmarshalItem);
                return journeys;
        }
});
Meteor.methods({
        'masai:getMergeCandidates' (roomId) {
			room = RocketChat.models.Rooms.findOneById(roomId);

                chatomatic = RocketChat.models.Rooms.findByVisitorId(room.v._id);


                return {listing:chatomatic.fetch(), user: getUser(roomId)};
        },
		'masai:addJourney' (userId, title){
			const auth0 = Npm.require('auth0-js');
                var jwt = Npm.require('jsonwebtoken');
                var jwtdecode = Npm.require('jwt-decode');
                let auth0init = new auth0.WebAuth({
                domain: RocketChat.settings.get('Reisebuddy_AUTH0_DOMAIN'), // AUTH0_DOMAIN, // auth0-domain
                        clientID: RocketChat.settings.get('Reisebuddy_AUTH0_CLIENTID'), //AUTH0_CLIENTID //auth0 -ClientID
                });
                var future = new Future();
                auth0init.client.login({
                realm: RocketChat.settings.get('Reisebuddy_AUTH0_REALM'), //AUTH0_REALM, //connection name or HRD domain
                        username: RocketChat.settings.get('Reisebuddy_AUTH0_USER'), //AUTH0_USER,
                        password: RocketChat.settings.get('Reisebuddy_AUTH0_PW'), //AUTH0_PW,
                        scope: 'openid'
                }, function (error, authResult) {
                if (error)
                        future.return(error);
                        else
                        future.return(authResult);
                }
                );
                const result = future.wait();
                let idToken = result.idToken;
                let decodedToken = jwtdecode(idToken);
                let token = {};
                token.iss = decodedToken.iss;
                token.sub = decodedToken.sub;
                token.aud = decodedToken.aud;
                token.exp = decodedToken.exp;
                token.iat = decodedToken.iat;
                let newToken = jwt.sign(token, RocketChat.settings.get('Reisebuddy_AWS_SECRET_KEY'));
                var id = uuid();
                var date = new Date();
                const payload = {"JourneyId" : {"S" : id}, "title" : {"S" : title}, 'segments': {"L" : []}, 'created' : {"N" : date.valueOf().toString() }};
                var url = RocketChat.settings.get('Reisebuddy_AWS_URL') + userId + '/journeys';
                const headers_content = {
                'Authorization': 'Bearer ' + newToken,
                        'Content-Type': 'application/json'
                };
                HTTP.post(url, {data : payload, headers: headers_content});
                return {"status" : "200"};
        }
});

RocketChat.tf.createTransaction = function (room) {
	
			const auth0 = Npm.require('auth0-js');
			var jwt = Npm.require('jsonwebtoken');
			var jwtdecode = Npm.require('jwt-decode');
			let auth0init = new auth0.WebAuth({
			domain: RocketChat.settings.get('Reisebuddy_AUTH0_DOMAIN'), // AUTH0_DOMAIN, // auth0-domain
					clientID: RocketChat.settings.get('Reisebuddy_AUTH0_CLIENTID'), //AUTH0_CLIENTID //auth0 -ClientID
			});
			var future = new Future();
			auth0init.client.login({
			realm: RocketChat.settings.get('Reisebuddy_AUTH0_REALM'), //AUTH0_REALM, //connection name or HRD domain
					username: RocketChat.settings.get('Reisebuddy_AUTH0_USER'), //AUTH0_USER,
					password: RocketChat.settings.get('Reisebuddy_AUTH0_PW'), //AUTH0_PW,
					scope: 'openid'
			}, function (error, authResult) {
			if (error)
					future.return(error);
					else
					future.return(authResult);
			}
			);
			const result = future.wait();
			let idToken = result.idToken;
			let decodedToken = jwtdecode(idToken);
			let token = {};
			token.iss = decodedToken.iss;
			token.sub = decodedToken.sub;
			token.aud = decodedToken.aud;
			token.exp = decodedToken.exp;
			token.iat = decodedToken.iat;
			let newToken = jwt.sign(token, RocketChat.settings.get('Reisebuddy_AWS_SECRET_KEY'));
			const headers_content = {
			'Authorization': 'Bearer ' + newToken,
					'Content-Type': 'application/json'
			};
			const payload = {
				'UserId': {"S" : room.v._id },
			};
			var url = RocketChat.settings.get('Reisebuddy_AWS_URL') +'/users/' + room.v._id + '/transaction';
			 
			
			HTTP.post(url, {data : payload, headers: headers_content});
}

RocketChat.tf.closeMasaiRoom = function( user, room, comment , comment1) {
		const now = new Date();
		
		
		RocketChat.models.Rooms.update({
				_id: room._id
			}, {
				$set: {

					closecomment: comment,
					closereason: comment1,
					closedBy: {
						_id: user._id,
						username: user.username
					},
					closedAt: now,
					chatDuration: (now.getTime() - room.ts) / 1000
				},
				$unset: {
					open: 1
				}
			});

		const message = {
			t: 'livechat-close',
			msg: comment,
			groupable: false
		};


		RocketChat.models.Subscriptions.hideByRoomIdAndUserId(room._id, user._id);
		RocketChat.models.Messages.createCommandWithRoomIdAndUser('promptTranscript', room._id, user);

		Meteor.defer(() => {
			RocketChat.callbacks.run('livechat.closeRoom', room);
		});

		return true;
	};

Meteor.methods({
	
	'masai:closeRoom2'(roomId, comment, reason) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'close-livechat-room')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'livechat:closeRoom' });
		}

		const room = RocketChat.models.Rooms.findOneById(roomId);

		const user = Meteor.user();

		if (room.usernames!=null && room.usernames.indexOf(user.username) === -1 && !RocketChat.authz.hasPermission(Meteor.userId(), 'close-others-livechat-room')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'livechat:closeRoom' });
		}
		const closeMessage = RocketChat.tf.calcGreet(room);
		va = RocketChat.tf.closeHandling(room, user, comment, closeMessage);
		
		RocketChat.models.Subscriptions.removeByRoomId(roomId);
		RocketChat.tf.createTransaction(room);
		return va;
	},
	'masai:closeRoom'(roomId, comment, reason) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'close-livechat-room')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'livechat:closeRoom' });
		}

		const room = RocketChat.models.Rooms.findOneById(roomId);

		const user = Meteor.user();

		if (room.usernames!=null && room.usernames.indexOf(user.username) === -1 && !RocketChat.authz.hasPermission(Meteor.userId(), 'close-others-livechat-room')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'livechat:closeRoom' });
		}
		const closeMessage = RocketChat.tf.calcGreet(room);
		if (closeMessage) {
			RocketChat.sendMessage(user, {
					rid: room._id,
					_id: Random.id(), 
					msg: closeMessage,
					noinq: 1
				},room);
		}
		va = RocketChat.tf.closeMasaiRoom(
			user,
			room,
			comment,reason
		);
		
		RocketChat.models.Subscriptions.removeByRoomId(roomId);
		RocketChat.tf.createTransaction(room);
		return va;
	},
        'masai:mergeRoom' (roomId, comment, others) {
			room = RocketChat.models.Rooms.findOneById(roomId);
			if (room==null) {
				throw new Error("Room not found");
			}
			const me = RocketChat.models.Users.findOneById(Meteor.userId());

			room1 = {
				fname:room.fname,
				t: 'l',
				code : RocketChat.models.Rooms.getNextLivechatRoomCode(),
				mergeTarget: true,
				label : room.label,
				ts : new Date(),
				_updatedAt : new Date(),
				v : {
					_id : room.v._id,
					username : room.v.username,
					token: room.v.token
				},
				usernames:room.usernames,
				mcomment : comment,
				msgs: 0,
				u: {
					_id: Meteor.userId(),
					username: me.username
				}
			};

			room1._id = RocketChat.models.Rooms.insert(room1);
			for (roo in others) {
				if (roomId==others[roo]) {
				//	continue;
				} /* then */

				RocketChat.models.Messages.find({'rid':others[roo]}).forEach(function(msg) {
					const record = msg;
					//record._hidden = true;
					//record.parent = record._id;
					record.editedAt = new Date;
					record.editedBy = {
						_id: Meteor.userId(),
						username: me.username
					};
					record.rid = room1._id;
					delete record._id;
					RocketChat.models.Messages.insert(record);
				});
				RocketChat.models.Rooms.update({_id: others[roo]}, {$set: {mergedInto: room1.code}});
			}
			return room;
        },
		'masai:retrieveGRANT'() {
			return RocketChat.settings.get('Reisebuddy_AWS_GRANTURL');
    },
		'masai:retreiveTravelfolderURL'() {
			return RocketChat.settings.get('Reisebuddy_Travelfolder_URL');
    },
		'masai:addSegment'(userId, journeyId, title, oldsegments, newsegment) {

			const auth0 = Npm.require('auth0-js');
			var jwt = Npm.require('jsonwebtoken');
			var jwtdecode = Npm.require('jwt-decode');
			let auth0init = new auth0.WebAuth({
			domain: RocketChat.settings.get('Reisebuddy_AUTH0_DOMAIN'), // AUTH0_DOMAIN, // auth0-domain
					clientID: RocketChat.settings.get('Reisebuddy_AUTH0_CLIENTID'), //AUTH0_CLIENTID //auth0 -ClientID
			});
			var future = new Future();
			auth0init.client.login({
			realm: RocketChat.settings.get('Reisebuddy_AUTH0_REALM'), //AUTH0_REALM, //connection name or HRD domain
					username: RocketChat.settings.get('Reisebuddy_AUTH0_USER'), //AUTH0_USER,
					password: RocketChat.settings.get('Reisebuddy_AUTH0_PW'), //AUTH0_PW,
					scope: 'openid'
			}, function (error, authResult) {
			if (error)
					future.return(error);
					else
					future.return(authResult);
			}
			);
			const result = future.wait();
			oldsegments = oldsegments || [];
			oldsegments.push(newsegment);
			var segments = oldsegments.map(marshalItem);
			segments = segments.map(function(item){
			return {"M" : item};
			});
			segments = { "L" : segments};
			let idToken = result.idToken;
			let decodedToken = jwtdecode(idToken);
			let token = {};
			token.iss = decodedToken.iss;
			token.sub = decodedToken.sub;
			token.aud = decodedToken.aud;
			token.exp = decodedToken.exp;
			token.iat = decodedToken.iat;
			let newToken = jwt.sign(token, RocketChat.settings.get('Reisebuddy_AWS_SECRET_KEY'));
			const headers_content = {
			'Authorization': 'Bearer ' + newToken,
					'Content-Type': 'application/json'
			};
			const payload = {
			'JourneyId': {"S" : journeyId },
					'title': {"S" : title },
					'segments': segments
			};
			var url = RocketChat.settings.get('Reisebuddy_AWS_URL') + userId + '/journeys';
			HTTP.post(url, {data : payload, headers: headers_content});
			return {"status" : "200"};
        }
});
function getUser(roomId){
    const travelfolder = _dbs.travel_folder;
    let user = travelfolder.findOne({_id: roomId});
    if (user)
    return user.userid;
    else return null;
}
RocketChat.tf.getUser = getUser;
Meteor.methods({
  'masai:getUser2' (roomId) {
	room = RocketChat.models.Rooms.findOneById(roomId);
	let guest = RocketChat.models.Users.findOneById(room.v._id);
	if (guest) {
		
	} else {
		
		guest = RocketChat.models.LivechatVisitors.findById(room.v._id).fetch();
		if (guest==null || guest.length <= 0) {
		}
		else {
			guest = guest[0];
		}
	}  
	return guest;
  },
  'masai:getUser' (roomId){
    return getUser(roomId);
  }
});
Meteor.methods({
	'masai:getRooms'(visitorToken) { 
	
		const rooms = RocketChat.models.Rooms.findByVisitorToken(visitorToken, {
			fields: {
				name: 1,
				t: 1,
				cl: 1,
				u: 1,
				usernames: 1,
				v: 1,
				servedBy: 1
			}
		}).fetch();

		return rooms;
	}
});
Meteor.methods({
        'masai:getJWT' (roomId){
                const travelfolder = _dbs.travel_folder;
                let user = travelfolder.findOne({_id: roomId});
                var jwt = Npm.require('jsonwebtoken');
                var jwtdecode = Npm.require('jwt-decode');
                let auth0init = new auth0.WebAuth({

                domain: RocketChat.settings.get('Reisebuddy_AUTH0_DOMAIN'), // AUTH0_DOMAIN, // auth0-domain
                        clientID: RocketChat.settings.get('Reisebuddy_AUTH0_CLIENTID'), //AUTH0_CLIENTID //auth0 -ClientID
                });
                var future = new Future();
                auth0init.client.login({
                realm: RocketChat.settings.get('Reisebuddy_AUTH0_REALM'), //AUTH0_REALM, //connection name or HRD domain
                        username: RocketChat.settings.get('Reisebuddy_AUTH0_USER'), //AUTH0_USER,
                        password: RocketChat.settings.get('Reisebuddy_AUTH0_PW'), //AUTH0_PW,
                        scope: 'openid'
                }, function (error, authResult) {
                if (error)
                        future.return(error);
                        else
                        future.return(authResult);
                }
                );
				
                const result = future.wait();
                let idToken = result.idToken;
				
                let decodedToken = jwtdecode(idToken);
                let token = {};
                token.iss = decodedToken.iss;
                token.sub = decodedToken.sub;
                token.aud = decodedToken.aud;
                token.exp = decodedToken.exp;
                token.iat = decodedToken.iat;
                let newToken = jwt.sign(token, RocketChat.settings.get('Reisebuddy_AWS_SECRET_KEY'));
                return {jwt: newToken, orginalresult:result, user: getUser(roomId)};
        },
                });
        Meteor.methods({
        'masai:addNote' (roomId, noteToSave){

			const me = RocketChat.models.Users.findOneById(Meteor.userId());
        _dbs.travel_folder_notes.insert({rid: roomId, note: noteToSave,username:me.username, ts: new Date()});
                return _dbs.travel_folder_notes.find({rid: roomId}).fetch();
        }
        });
        Meteor.methods({
        'masai:getNotes' (roomId){
        let myresult = _dbs.travel_folder_notes.find({rid : roomId}).fetch();
                return myresult;
        }
});
RocketChat.callbacks.add('afterSaveMessage', function (message) {
  if (message.msg.includes('granted')) {
    let granted = JSON.parse(message.msg);
            const folderCollection = _dbs.travel_folder;
    if (granted && granted.granted_for && granted.rid) {
      const folderCollection = _dbs.travel_folder;
              folderCollection.update({_id: granted.rid}, {$set: {userid: granted.granted_for}}, {upsert: true});
    }
  }
  return message;
});
