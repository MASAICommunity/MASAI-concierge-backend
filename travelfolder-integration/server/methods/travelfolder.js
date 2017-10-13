var Future = Npm.require('fibers/future');
var jwtdecode = Npm.require('jwt-decode');
var jwt = Npm.require('jsonwebtoken');
var unmarshalItem = Npm.require('dynamodb-marshaler').unmarshalItem;
var marshalItem = Npm.require('dynamodb-marshaler').marshalItem;
var uuid = Npm.require('uuid4');
const SECRET_KEY = '';
const API_URL = ''; //url to the API-Gateway
const AUTH0_DOMAIN = '';
const AUTH0_CLIENTID = '';
const AUTH0_REALM = '';
const AUTH0_USER = '';
const AUTH0_PW = '';
Meteor.methods({
	'masai:getJourneysForUser'(userId) {

		const auth0 = Npm.require('auth0-js');
		let auth0init = new auth0.WebAuth({
			domain: AUTH0_DOMAIN, // auth0-domain
			clientID: AUTH0_CLIENTID //auth0 -ClientID
		});
		var future = new Future();
		auth0init.client.login({
				realm: AUTH0_REALM, //connection name or HRD domain
				username: AUTH0_USER,
				password: AUTH0_PW,
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
		let newToken = jwt.sign(jwtdecode(idToken), SECRET_KEY);
		//  console.log(newToken);
		const headers_content = {
			'Authorization': 'Bearer ' + newToken,
			'Content-Type': 'application/json'
		};


		var url = API_URL + userId + '/journeys';
		
		var journeys = HTTP.get(url, {headers: headers_content});
	
		journeys = journeys.data.Items.map(unmarshalItem);
	
		return journeys;
	}
});
Meteor.methods({
	'masai:addJourney' (userId, title){
		const auth0 = Npm.require('auth0-js');
		let auth0init = new auth0.WebAuth({
			domain: AUTH0_DOMAIN,
			clientID: AUTH0_CLIENTID
		});
		var future = new Future();
		auth0init.client.login({
				realm: AUTH0_REALM, //connection name or HRD domain
				username: AUTH0_USER,
				password: AUTH0_PW,
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

		let newToken = jwt.sign(token,SECRET_KEY);
		var id = uuid();
		var date = new Date();
		const payload = {"JourneyId" : {"S" : id}, "title" : {"S" : title}, 'segments': {"L" : []}, 'created' : {"N" : date.valueOf().toString() }};
		var url = API_URL + userId + '/journeys';
		const headers_content = {
			'Authorization': 'Bearer ' + newToken,
			'Content-Type': 'application/json'
		};

		HTTP.post(url, {data : payload,  headers: headers_content});
		return {"status" : "200"};
	}
}),
Meteor.methods({
	'masai:addSegment'(userId, journeyId, title, oldsegments, newsegment) {

		const auth0 = Npm.require('auth0-js');
		let auth0init = new auth0.WebAuth({
			domain: AUTH0_DOMAIN,
			clientID: AUTH0_CLIENTID
		});
		var future = new Future();
		auth0init.client.login({
				realm: AUTH0_REALM, //connection name or HRD domain
				username: AUTH0_USER,
				password: AUTH0_PW,
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

		let newToken = jwt.sign(token, SECRET_KEY);

		const headers_content = {
			'Authorization': 'Bearer ' + newToken,
			'Content-Type': 'application/json'
		};
		const payload = {
			'JourneyId': {"S" : journeyId },
			'title': {"S" : title },
			'segments': segments
		};

		var url = API_URL + userId + '/journeys';

		HTTP.post(url, {data : payload,  headers: headers_content});
       return {"status" : "200"};
	}
});

function getUser(roomId){
	const travelfolder = _dbs.travel_folder;
	let user = travelfolder.findOne({_id: roomId});
	if(user)
		return user.userid;
	else return null;
}

Meteor.methods({
		'masai:getUser' (roomId){
		return getUser(roomId);
		}
	}
);
Meteor.methods({
	'masai:getJWT' (roomId){
		const travelfolder = _dbs.travel_folder;
		let user = travelfolder.findOne({_id: roomId});
		const auth0 = Npm.require('auth0-js');
		let auth0init = new auth0.WebAuth({
			domain: AUTH0_DOMAIN,
			clientID: AUTH0_CLIENTID
		});
		var future = new Future();
		auth0init.client.login({
				realm: AUTH0_REALM, //connection name or HRD domain
				username: AUTH0_USER,
				password: AUTH0_PW,
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

		let newToken = jwt.sign(token, SECRET_KEY);
		return {jwt: newToken, orginalresult:result, user: getUser(roomId)};
	},
});
Meteor.methods({
	'masai:addNote' (roomId, noteToSave){
		
		_dbs.travel_folder_notes.insert({rid: roomId, note: noteToSave});
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
