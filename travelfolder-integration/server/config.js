Meteor.startup(function () {
	RocketChat.settings.addGroup('Reisebuddy');
	
	RocketChat.settings.add('TRAVELFOLDER_ALREADYCLOSED_MESSAGE', 'Durch Kunden beendet', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Travelfolder',
		public: true,
		i18nLabel: 'TRAVELFOLDER_ALREADYCLOSED_MESSAGE'
	});
	RocketChat.settings.add('Reisebuddy_TRAVELFOLDER_AUTOCLOSE_USER', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Travelfolder',
		public: true,
		i18nLabel: 'Reisebuddy_TRAVELFOLDER_AUTOCLOSE_USER'
	});
	RocketChat.settings.add('Reisebuddy_WATSON_HOST', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'Reisebuddy_WATSON_HOST'
	});
	RocketChat.settings.add('Reisebuddy_WATSON_PORT', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'Reisebuddy_WATSON_PORT'
	});
	RocketChat.settings.add('Reisebuddy_WATSON_CHANNEL', 'sms_official', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'Reisebuddy_WATSON_CHANNEL'
	});
	RocketChat.settings.add('Reisebuddy_WATSON_CLIENTID', '1', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'Reisebuddy_WATSON_CLIENTID'
	});
	//
	RocketChat.settings.add('Reisebuddy_WATSON_TOKEN', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'Reisebuddy_WATSON_TOKEN'
	});
	RocketChat.settings.add('Reisebuddy_WATSON_Intermediate_Message', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'WATSON_Intermediate_Message'
	});
	
	RocketChat.settings.add('Reisebuddy_Watson_Minimum', 101, {
		type: 'int',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'Minimum Percentage for auto trigger'
	});
	RocketChat.settings.add('Reisebuddy_Google_API', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Google',
		public: true,
		i18nLabel: 'Reisebuddy_Google_API'
	});
	RocketChat.settings.add('Reisebuddy_AWS_SECRET_KEY', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AWS',
		public: true,
		i18nLabel: 'Reisebuddy_AWS_SECRET_KEY'
	});
	RocketChat.settings.add('Reisebuddy_AWS_URL', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AWS',
		public: true,
		i18nLabel: 'Reisebuddy_AWS_URL'
	});
	RocketChat.settings.add('Reisebuddy_GRANT_URL', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AWS',
		public: true,
		i18nLabel: 'Reisebuddy_GRANT_URL'
	});
	RocketChat.settings.add('Reisebuddy_AUTH0_DOMAIN', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AUTH0',
		public: true,
		i18nLabel: 'Reisebuddy_AUTH0_DOMAIN'
	});

	RocketChat.settings.add('Reisebuddy_AUTH0_CLIENTID', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AUTH0',
		public: true,
		i18nLabel: 'Reisebuddy_AUTH0_CLIENTID'
	});

	RocketChat.settings.add('Reisebuddy_AUTH0_REALM', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AUTH0',
		public: true,
		i18nLabel: 'Reisebuddy_AUTH0_REALM'
	});
	RocketChat.settings.add('Reisebuddy_AUTH0_USER', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AUTH0',
		public: true,
		i18nLabel: 'Reisebuddy_AUTH0_USER'
	});
	RocketChat.settings.add('Reisebuddy_AUTH0_PW', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AUTH0',
		public: true,
		i18nLabel: 'Reisebuddy_AUTH0_PW'
	});
	RocketChat.settings.add('Reisebuddy_AWS_GRANTURL', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Knowledge Base',
		public: true,
		i18nLabel: 'Reisebuddy_AWS_GRANTURL'
	});
	RocketChat.settings.add('Reisebuddy_Travelfolder_AUTOANSWER', 'Der Chat wurde geschlossen. Bei Rückfragen geben Sie bitte Ihre Referenz-ID {0} an.', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Travelfolder',
		public: true,
		i18nLabel: 'Automatische Antwort mit Referenznummer'
	});
	RocketChat.settings.add('Reisebuddy_Travelfolder_AUTOANSWERUSER', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Travelfolder',
		public: true,
		i18nLabel: 'Name des Agents, mit dem geantwortet werden soll'
	});
	RocketChat.settings.add('Reisebuddy_Travelfolder_URL', 'www.journey-concierge.com/', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AUTH0',
		public: true,
		i18nLabel: 'Reisebuddy_Travelfolder_URL'
	});
	
	RocketChat.settings.add('Reisebuddy_GATEWAY_HOST', "cloud-mailgate.deutschebahn.com", {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		'public': true,
		i18nLabel: 'Reisebuddy_GATEWAY_HOST'
	});
	RocketChat.settings.add('Reisebuddy_TF_URL', "http://www.journey-concierge.com/", {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		'public': true,
		i18nLabel: 'Reisebuddy_TF_URL'
	});
	RocketChat.settings.add('Reisebuddy_GATEWAY_PORT', "25", {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		'public': true,
		i18nLabel: 'Reisebuddy_GATEWAY_PORT'
	});
	RocketChat.settings.add('Reisebuddy_GATEWAY_USER', "masai@deutschebahn.com", {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		'public': true,
		i18nLabel: 'Reisebuddy_GATEWAY_USER'
	});
	RocketChat.settings.add('Reisebuddy_GATEWAY_PASSWORT', "1Kcy_4hKzv!HtBF", {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		'public': true,
		i18nLabel: 'Reisebuddy_GATEWAY_PASSWORT'
	});
	
	RocketChat.settings.add('Reisebuddy_WATSON_CONTINUEPROCESSING', '#nc', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'Schluesselwort zur Weiterverarbeitung'
	});
	RocketChat.settings.add('Reisebuddy_WATSON_DELAY', '180', {
		type: 'int',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'Zeit bis zur Anzeige einer Warnung (sek)'
	});
	
	RocketChat.settings.add('Reisebuddy_WATSON_AUTOCLOSE_CATEGORY', 'Automatisch geschlossen', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Travelfolder',
		public: true,
		i18nLabel: 'Kategorie bei automatischer Beantwortung'
	});
	
	RocketChat.settings.add('Reisebuddy_WATSON_AUTOPROCESSING_CATEGORY', 'Automatisch beantwortet', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Watson',
		public: true,
		i18nLabel: 'Kategorie bei automatischer Beantwortung'
	});
	
	RocketChat.settings.add('Reisebuddy_Travelfolder_CLOSEBYVISITOR', 'Durch Kunden beendet', {
		type: 'string', 
		group: 'Reisebuddy',
		section: 'Travelfolder',
		public: true,
		i18nLabel: 'Kategorie beim Schließen durch Kunden'
	});
});

RocketChat.theme.addPackageAsset(() => {
	return Assets.getText('assets/stylesheets/redlink.less');
});
