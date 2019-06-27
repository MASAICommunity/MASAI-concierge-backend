Package.describe({
	name: 'masai:travelfolder',
	version: '0.0.1',
	summary: 'masai travelfolder integration',
	git: '',
	documentation: 'README.md'
});

function addDirectory(api, pathInPackage, environment) {
const PACKAGE_PATH = 'packages/travelfolder-integration/'; 
	const fs = Npm.require('fs');
	
	fs.readdirSync(PACKAGE_PATH + pathInPackage).forEach(function(file){
		console.log(pathInPackage+"/"+file);
        api.addFiles(pathInPackage+"/"+file, environment);
    });
} 

Package.onUse(function (api) {

	//api.versionsFrom('1.2.1');
	api.use([
		'ecmascript',
		'webapp',
		'autoupdate',
		'rocketchat:utils',
		'rocketchat:lib',
		'rocketchat:authorization',
		'rocketchat:logger',
		'rocketchat:api',
		'rocketchat:theme',
		'rocketchat:streamer',
		'konecty:user-presence',
		'rocketchat:ui',
		'kadira:flow-router',
		'kadira:blaze-layout',
		'templating',
		'http',
		'check',
		'mongo',
		'ddp-rate-limiter',
		'rocketchat:sms',
		'tracker',
		'less',
	]);

	api.addFiles('assets/stylesheets/redlink.less', 'client');

	api.addFiles('server/config.js', 'server');
	api.addFiles('server/webapp.js', 'server');
	api.addFiles('server/restlivechat.js', 'server');
	api.addFiles('lib/core.js');
	addDirectory(api, 'server/methods', 'server');
	addDirectory(api, 'server/lib', 'server');
	addDirectory(api, 'server/hooks', 'server');
	addDirectory(api,'server/models', 'server');
	
	api.addFiles('handler.js','client');
	api.addFiles('client/route.js', 'client');
	api.addFiles('client/travelfolder_ui.js', 'client');
	addDirectory(api,'client/views/app/admin', 'client');
	addDirectory(api,'client/views/app/tabbar', 'client');
	addDirectory(api,'client/views/app/window', 'client');

});
Npm.depends({
  'auth0-js': '8.10.1',
  'jsonwebtoken': '7.4.3',
  'jwt-decode': '2.2.0',
  'dynamodb-marshaler': '2.0.0',
});
