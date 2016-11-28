var action = require('action.creep');
var utilsRoom = require('utils.room');
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
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
	    else if(creep.memory.harvesting) {
            //action.doHarvest(creep);
            action.doHarvestInRoom(creep,utilsRoom.getMotherRoom().name);
        }
        else {
            action.doTransferToStorage(creep);
        }
	}
};

module.exports = roleHarvester;