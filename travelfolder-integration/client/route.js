import { RocketChat } from 'meteor/rocketchat:lib';
import { AccountBox } from 'meteor/rocketchat:ui';
extconfRoutes = FlowRouter.group({
	prefix: '/extended-configuration',
	name: 'extconf'
});

AccountBox.addRoute({
	name: 'extconf',
	path: '/',
	i18nPageTitle: 'Handelspartner Setup',
	pageTemplate: 'extconf'
}, extconfRoutes);

phoneRoutes = FlowRouter.group({
	prefix: '/phone',
	name: 'phone'
});

AccountBox.addRoute({
	name: 'phone-asso',
	path: '/asso',
	i18nPageTitle: 'Phone Association',
	pageTemplate: 'phone'
}, phoneRoutes);

watsonRoutes = FlowRouter.group({
	prefix: '/watson',
	name: 'watson'
});

AccountBox.addRoute({
	name: 'watson-export',
	path: '/export',
	i18nPageTitle: 'Watson Export',
	pageTemplate: 'watsonExport'
}, watsonRoutes);
categoriesRoutes = FlowRouter.group({
	prefix: '/livechatmanagement',
	name: 'livechatmanagement'
});
AccountBox.addRoute({
	name: 'livechatmanagement-categories',
	path: '/categories',
	i18nPageTitle: 'Categories',
	pageTemplate: 'livechatmanagementcategory'
}, categoriesRoutes);


FlowRouter.route('/livechatmerge/:code(.+)', {
	name: 'livechatmerge',

	action(params) {
		BlazeLayout.render('livechatMerge', { center: `account${ params.group }` });
	},
	triggersExit: [function() {
		$('.main-content').addClass('rc-old');
	}]
});
FlowRouter.route('/livechathistory/:code(.+)', {
	name: 'livechathistory',

	action(params) {
		BlazeLayout.render('livechatHistory', { center: `account${ params.group }` });
	},
	triggersExit: [function() {
		$('.main-content').addClass('rc-old');
	}]
});


FlowRouter.route('/watsoncsv/:code(.+)/:date(.+)', {
	name: 'watsoncsv',

	action(params) {
		BlazeLayout.render('watsoncsv', { center: `account${ params.group }` });
	},
	triggersExit: [function() {
		$('.main-content').addClass('rc-old');
	}]
});
