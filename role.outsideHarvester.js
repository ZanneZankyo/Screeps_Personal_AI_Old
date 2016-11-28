var action = require('action.creep');
var saves = require('saves');
var utilsCreep = require('utils.creep');

var outsideHarvester = {
	run : function(creep){

		var waitUntilSafe = 0;

		if(!creep.memory.flagName || !Game.flags[creep.memory.flagName])
			utilsCreep.assignHarvestRoom(creep);
		saves.outsideHarvesters[creep.memory.flagName] = creep.name;
		//console.log(saves.outsideHarvesters[creep.memory.flagName]);

		if(!creep.memory.harvesting && creep.carry.energy <= 0)
            creep.memory.harvesting = true;
        if(creep.memory.harvesting && action.isCarryFull(creep))
            creep.memory.harvesting = false;
        if(!creep.memory.renewing)
	    	action.doNeedRenew(creep);

        if (creep.memory.renewing){
            action.doRenew(creep);
        }
        waitUntilSafe = action.isDanger(creep);
        waitUntilSafe--;
        if(waitUntilSafe > 0){
            action.doAvoid(creep);
            return;
        }
        
        if(creep.room != Game.flags[creep.memory.flagName].room){
        	//console.log(creep.name+' outsideHarvester moving to '+Game.flags[creep.memory.flagName]);
        	creep.memory.action = 'moving to '+Game.flags[creep.memory.flagName];
        	creep.moveTo(Game.flags[creep.memory.flagName]);
        }
	    else if(creep.memory.harvesting) {
	    	//console.log(creep.name+' doHarvestInRoom '+creep.room.name);
            action.doHarvestInRoom(creep,creep.room.name);
        }

        if(action.isCarryFull(creep)) {
            action.doTransferToStorageInRoom(creep,creep.room.name);
        }
	}
}

module.exports = outsideHarvester;