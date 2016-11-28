var action = require('action.creep');

var roleOutsideCarrier = {
	run : function(creep){
		if(creep.memory.carrying && creep.carry.energy <= 0)
            creep.memory.carrying = false;
        if(!creep.memory.carrying && action.isCarryFull(creep))
            creep.memory.carrying = true;
        if(!creep.memory.renewing)
	    	action.doNeedRenew(creep);

        if (creep.memory.renewing){
            action.doRenew(creep);
        }
        else if(action.isDanger(creep)){
            action.doAvoid(creep);
        }
        else if(creep.memory.carrying){
        	action.doTransferToStorage(creep);
        }
        else if(creep.room != Game.flags[creep.memory.flagName].room){
        	creep.memory.action = 'moving to '+Game.flags[creep.memory.flagName];
        	creep.moveTo(Game.flags[creep.memory.flagName]);
        }
        else {
            action.doGetEnergyFromStorageInRoom(creep,creep.room.name);
        }
	}
}

module.exports = roleOutsideCarrier;