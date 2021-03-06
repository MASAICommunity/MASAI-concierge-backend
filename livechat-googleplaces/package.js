Package.describe({
	name: 'masai:googleplaces',
	version: '0.0.1',
	summary: 'masai google places search in livechat',
	git: '',
	documentation: 'README.md'
});

function addDirectory(api, pathInPackage, environment) {
	const PACKAGE_PATH = 'packages/livechat-googleplaces/';
	const _ = Npm.require('underscore');
	const fs = Npm.require('fs');
	const files = _.compact(_.map(fs.readdirSync(PACKAGE_PATH + pathInPackage), function (filename) {
		return pathInPackage + '/' + filename
	}));
	api.addFiles(files, environment);
}

Package.onUse(function (api) {

	api.versionsFrom('1.2.1');
	api.use(['ecmascript', 'underscore']);
	api.use('templating', 'client');
	api.use('less@2.5.1');
	api.use('rocketchat:lib');
	api.use('mongo');

	api.addAssets('assets/stylesheets/redlink.less', 'server');

	api.addFiles('server/config.js', 'server');
	api.addFiles('lib/core.js');
	addDirectory(api, 'server/methods', 'server');
	addDirectory(api, 'server/lib', 'server');
	//addDirectory(api, 'server/hooks', 'server');

	api.addFiles('client/googleplaces_ui.js', 'client');
	api.addAssets('assets/icons/google.png', 'server');
	addDirectory(api,'client/views/app/tabbar', 'client');

	//i18n
	var _ = Npm.require('underscore');
	var fs = Npm.require('fs');
	var tapi18nFiles = _.compact(_.map(fs.readdirSync('packages/livechat-googleplaces/i18n'), function(filename) {
		return 'i18n/' + filename;
	}));
	api.addFiles(tapi18nFiles);

	api.use('tap:i18n');
});
