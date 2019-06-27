Package.describe({
	name: 'masai:googleplaces',
	version: '0.0.1',
	summary: 'masai google places search in livechat',
	git: '',
	documentation: 'README.md'
});

function addDirectoryMG(api, pathInPackage, environment) {
	const PACKAGE_PATH = 'packages/masai-googleplaces/';
	//const _ = Npm.require('underscore');
	const fs = Npm.require('fs');
	//const files = _.compact(_.map(fs.readdirSync(PACKAGE_PATH + pathInPackage), function (filename) {
	//	return pathInPackage + '/' + filename
	//}));
	fs.readdirSync(PACKAGE_PATH + pathInPackage).forEach(function(file){
		
        api.addFiles(pathInPackage+"/"+file, environment);
    });
	//api.addFiles(files, environment);
}

Package.onUse(function (api) {

	api.versionsFrom('1.2.1');
	api.use(['rocketchat:lib','ecmascript','templating','less@2.5.1','mongo']);
	//api.use('templating');
	//api.use('less@2.5.1');
	//api.use();
	//api.use('mongo');

	api.addAssets('assets/stylesheets/redlink.less', 'server');

	api.addFiles('server/config.js', 'server');
	api.addFiles('lib/core.js');
	addDirectoryMG(api, 'server/methods', 'server');
	addDirectoryMG(api, 'server/lib', 'server');
	//addDirectoryMG(api, 'server/hooks', 'server');

	api.addFiles('client/googleplaces_ui.js', 'client');
	api.addAssets('assets/icons/google.png', 'server'); 
	addDirectoryMG(api,'client/views/app/tabbar', 'client');

	//i18n
	//var _ = Npm.require('underscore');
	//var fs = Npm.require('fs');
	//var tapi18nFiles = _.compact(_.map(fs.readdirSync('packages/masai-googleplaces/i18n'), function(filename) {
	//	return 'i18n/' + filename;
	//}));
	//api.addFiles(tapi18nFiles);

	//api.use('tap:i18n');
});
