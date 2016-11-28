var action = require('action.creep');

var outsideHarvester = {
	run : function(creep){
		if(!creep.memory.harvesting && creep.carry.energy <= 0)
            creep.memory.harvesting = true;
        if(creep.memory.harvesting && action.isCarryFull(creep))
            creep.memory.harvesting = false;
        if(!creep.memory.renewing)
	    	action.doNeedRenew(creep);

        if (creep.memory.renewing){
            action.doRenew(creep);
        }
        else if(action.isDanger(creep)){
            action.doAvoid(creep);
        }
        else if(creep.room != Game.flags[creep.memory.flagName].room){
        	creep.memory.action = 'moving to '+Game.flags[creep.memory.flagName];
        	creep.moveTo(Game.flags[creep.memory.flagName]);
        }
	    else if(creep.memory.harvesting) {
            action.doHarvestInRoom(creep,creep.room.name);
        }
        else {
            action.doTransferToStorageInRoom(creep,creep.room.name);
        }
	}
}

module.exports = outsideHarvester;