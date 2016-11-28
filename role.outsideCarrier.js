var action = require('action.creep');
var saves = require('saves');
var utilsCreep = require('utils.creep');

var roleOutsideCarrier = {
	run : function(creep){

		var waitUntilSafe = 0;

		if(!creep.memory.flagName || !Game.flags[creep.memory.flagName])
			utilsCreep.assignCarryRoom(creep);
		saves.outsideCarriers[creep.memory.flagName] = creep.name;

		if(creep.memory.carrying && creep.carry.energy <= 0)
            creep.memory.carrying = false;
        if(!creep.memory.carrying && action.isCarryFull(creep))
            creep.memory.carrying = true;
        if(!creep.memory.renewing)
	    	action.doNeedRenew(creep);

        if (creep.memory.renewing){
            action.doRenew(creep);
            return;
        }
        waitUntilSafe = action.isDanger(creep);
        waitUntilSafe--;
        if(waitUntilSafe > 0){
            action.doAvoid(creep);
            return;
        }

        if(creep.memory.carrying){
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