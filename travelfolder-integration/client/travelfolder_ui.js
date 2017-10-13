/**
 * Created by Wolfgang on 22.02.2017.
 */
RocketChat.TabBar.removeButton('visitor-info');
RocketChat.TabBar.removeButton('visitor-history');
RocketChat.TabBar.removeButton('external-search');
RocketChat.TabBar.removeGroup('starred-messages',['live']);
RocketChat.TabBar.addButton({
	groups: ['live'],
	id: 'travelfolder',
	i18nTitle: 'Travelfolder',
	icon: 'icon-info-circled',
	template: 'visitorInfo_travelFolder',
	order: 0,
	initialOpen: true
});

