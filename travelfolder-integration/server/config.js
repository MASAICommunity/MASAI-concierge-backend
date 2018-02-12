Meteor.startup(function () {
	RocketChat.settings.addGroup('Reisebuddy');
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
	RocketChat.settings.add('Reisebuddy_Travelfolder_URL', 'www.journey-concierge.com/', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AUTH0',
		public: true,
		i18nLabel: 'Reisebuddy_Travelfolder_URL'
	});
	RocketChat.settings.add('Reisebuddy_Travelfolder_URL', 'www.journey-concierge.com/', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'AUTH0',
		public: true,
		i18nLabel: 'Reisebuddy_Travelfolder_URL'
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
	RocketChat.settings.add('Reisebuddy_GATEWAY_PASSWORT', "", {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		'public': true,
		i18nLabel: 'Reisebuddy_GATEWAY_PASSWORT'
	});
});

RocketChat.theme.addPackageAsset(() => {
	return Assets.getText('assets/stylesheets/redlink.less');
});
