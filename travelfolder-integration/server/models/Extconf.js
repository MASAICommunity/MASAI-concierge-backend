RocketChat.models.Extconf = new class extends RocketChat.models._Base {
	constructor() {
		super('extconf');
	}

	getByRoom(room) { 
		if (!room) {
			return null
		}
		if (room.hpid) {
			const hp = RocketChat.models.Extconf.findOneById(room.hpid);
			room.hp = hp;
			if (hp) {
				return hp;
			}
		}
		if (room.origin) {
			
			let phone = RocketChat.models.Phoneasso.findOneByNum(room.origin);
			if (!phone) {
				phone = RocketChat.models.Phoneasso.findOne({name: room.origin});
			}
			if (phone && phone.hpid) {
				const hp = RocketChat.models.Extconf.findOneById(phone.hpid);
				if (hp) {
					return hp;
				}
			}
		}
		
		return null;
	}
	
	createExtconf(userid,name, domain) {

		
			const record = {
				name : name,
				userid : userid,
				domain : domain,
				ts: new Date()
			};
			record._id = this.insert(record);
			return record;

	}
};
