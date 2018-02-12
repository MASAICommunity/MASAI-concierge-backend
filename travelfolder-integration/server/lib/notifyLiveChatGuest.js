/* globals Push */
import moment from 'moment';

function localize(msg, language) {
	if(language && language.toLowerCase() == "en") {
		//filesharing
		if(msg === 'Uploaded an image') {
			msg = "An image was shared with you";
		}
		if(msg === 'Uploaded a file') {
			msg = "A file was shared with you";
		}
		//Google share
		//'{"html_attributions":["https://lh3.googleusercontent.com/p/AF1QipPC81IsTVNHRJDRxA_wWK9eeQ4XWRPokaAAlYBi=s1600-w100"],"results":[{"formatted_address":"Parkring 12A, 1010 Wien, Austria","geometry":{"location":{"lat":48.20488570000001,"lng":16.3776537},"viewport":{"northeast":{"lat":48.2063764302915,"lng":16.37847},"southwest":{"lat":48.2036784697085,"lng":16.37562}}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/lodging-71.png","id":"e80fd7c73b20d4a13f8bd0457fa0f03468011c46","name":"Vienna Marriott Hotel","opening_hours":{"open_now":true,"weekday_text":[]},"photos":[{"height":423,"html_attributions":["<a href=\\"https://maps.google.com/maps/contrib/114898369925695319005/photos\\">Vienna Marriott Hotel</a>"],"photo_reference":"CmRaAAAAmP44eubfLz8mLDExHCySfIkOe45YgZsFrrC_DAPUGp49jVXu9yuPm2NrV4htmDj4o1WMHRJG_Ad-54lAz49m5l-oXcAzXCOnbbxV-9dIdXu1oTrhUbhOdkElETwAfVL8EhCRUWOjNmMThz5ccMCn7UpkGhT_0ysgyGOdUytYtJMfiFyDrzCgRg","width":610}],"place_id":"ChIJoVUa5XUHbUcRWXQBiM7IK6s","rating":4.4,"reference":"CmRSAAAACk3Mwe9Iv3S2eBG72QA2F4RNbmjXJ823i-LQiwWQSW2Pmhb54jcHH1_gVsIQmsRwndQiUl9mbC74CBN6Ci76NSeSDtGJXIbUmRQRV51dpko42zFgqSAs4s4leljDuGkuEhC7PNnJ7lNq7fZR7t3KtrKAGhSjDm3WatBRdAly2wlbpCm6beOUrw","types":["lodging","point_of_interest","establishment"]}]}'
		if(msg.startsWith('{"html_attributions":')) {
			msg = "A location was shared with you";
		}

		//request access
		//{"url":"https://qjchuhm517.execute-api.eu-central-1.amazonaws.com/latest/users/me/access/grants/ce244c43eec449f0","payload":{"scope":["personal","contact","address_private","address_billing","esta","passport","journey","preference"]}}
		if(msg.startsWith('{"url":')) {
			msg = "Request for Travelfolder access permission";
		}
	}
	else {
		//filesharing
		if(msg === 'Uploaded an image') {
			msg = "Ein Bild wurde geteilt";
		}
		if(msg === 'Uploaded a file') {
			msg = "Eine Datei wurde geteilt";
		}
		//Google share
		//'{"html_attributions":["https://lh3.googleusercontent.com/p/AF1QipPC81IsTVNHRJDRxA_wWK9eeQ4XWRPokaAAlYBi=s1600-w100"],"results":[{"formatted_address":"Parkring 12A, 1010 Wien, Austria","geometry":{"location":{"lat":48.20488570000001,"lng":16.3776537},"viewport":{"northeast":{"lat":48.2063764302915,"lng":16.37847},"southwest":{"lat":48.2036784697085,"lng":16.37562}}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/lodging-71.png","id":"e80fd7c73b20d4a13f8bd0457fa0f03468011c46","name":"Vienna Marriott Hotel","opening_hours":{"open_now":true,"weekday_text":[]},"photos":[{"height":423,"html_attributions":["<a href=\\"https://maps.google.com/maps/contrib/114898369925695319005/photos\\">Vienna Marriott Hotel</a>"],"photo_reference":"CmRaAAAAmP44eubfLz8mLDExHCySfIkOe45YgZsFrrC_DAPUGp49jVXu9yuPm2NrV4htmDj4o1WMHRJG_Ad-54lAz49m5l-oXcAzXCOnbbxV-9dIdXu1oTrhUbhOdkElETwAfVL8EhCRUWOjNmMThz5ccMCn7UpkGhT_0ysgyGOdUytYtJMfiFyDrzCgRg","width":610}],"place_id":"ChIJoVUa5XUHbUcRWXQBiM7IK6s","rating":4.4,"reference":"CmRSAAAACk3Mwe9Iv3S2eBG72QA2F4RNbmjXJ823i-LQiwWQSW2Pmhb54jcHH1_gVsIQmsRwndQiUl9mbC74CBN6Ci76NSeSDtGJXIbUmRQRV51dpko42zFgqSAs4s4leljDuGkuEhC7PNnJ7lNq7fZR7t3KtrKAGhSjDm3WatBRdAly2wlbpCm6beOUrw","types":["lodging","point_of_interest","establishment"]}]}'
		if(msg.startsWith('{"html_attributions":')) {
			msg = "Ein Ort wurde geteilt";
		}

		//request access
		//{"url":"https://qjchuhm517.execute-api.eu-central-1.amazonaws.com/latest/users/me/access/grants/ce244c43eec449f0","payload":{"scope":["personal","contact","address_private","address_billing","esta","passport","journey","preference"]}}
		if(msg.startsWith('{"url":')) {
			msg = "Eine Anfrage auf Zugriff zum Reiseordner wurde gestellt";
		}
	}


	return msg;
}

RocketChat.callbacks.add('afterSaveMessage', function(message, room) {
	// skips this callback if the message was edited
	if (message.editedAt) {
		return message;
	}

	if (message.ts && Math.abs(moment(message.ts).diff()) > 60000) {
		return message;
	}

	//notification should only trigger for livechat
	if(room.t !== 'l') {
		return message;
	}

	var guest = RocketChat.models.Users.findOneById(room.v._id);
	var locale = 'de'
	if(guest.locale) {
		locale = guest.locale;
	}

	var msg = localize(message.msg, locale);


	//dont notify for messages sent by guest
	if(message.u._id == guest._id) {
		return message;
	}

	if (Push.enabled === true) {

		var pushObject = {
			roomId: message.rid,
			roomName: 'Neue Nachricht',
			username: '',
			message:  msg,
			payload: {
				host: Meteor.absoluteUrl(),
				rid: message.rid,
				sender: message.u,
				type: room.t,
				cmd: 'open_room',
				name: ''
			},
			usersTo: {
				userId: guest._id
			}
		};
		console.log("PushMessage", pushObject);

		RocketChat.PushNotification.send(pushObject);
	}

	return message;
}, RocketChat.callbacks.priority.LOW, 'sendNotificationOnMessageForLiveChat');
