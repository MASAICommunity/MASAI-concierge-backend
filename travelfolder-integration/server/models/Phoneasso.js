RocketChat.models.Phoneasso = new class extends RocketChat.models._Base {
	constructor() {
		super('phoneasso');
	}

	findOneByNum(origin) {
		var result = this.find({num: origin}).fetch();
		if(result.length > 0) {
			return result[0];
		}
		
		return null;
	}
	
	createAsso(userid,num,departments,name,greetings,interfacet,hpid) {

		var result = this.find({num: num}).fetch();
		if(result.length > 0) {
			var res = this.update({num: num}, {
				$set : {
					departments : departments,
					name : name,
					greetings : greetings,
					interfacet : interfacet,
					hpid:hpid
					}
				});
				return;
		}
		else {
			const record = {
				departments : departments,
				userid : userid,
				num : num,
				name : name,
				interfacet : interfacet,
					greetings : greetings,
				ts: new Date(),
					hpid:hpid
			};
			record._id = this.insert(record);
			return record;
		}

	}
};
