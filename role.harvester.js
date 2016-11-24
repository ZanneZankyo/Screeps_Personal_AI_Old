var action = require('action.creep');
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(!creep.memory.harvesting && creep.carry.energy <= 0)
            creep.memory.harvesting = true;
        if(creep.memory.harvesting && creep.carry.energy >= creep.carryCapacity)
            creep.memory.harvesting = false;
        action.doNeedRenew(creep);

        if (creep.memory.renewing){
            action.doRenew(creep);
        }
        else if(action.isDanger(creep)){
            action.doAvoid(creep);
        }
	    else if(creep.memory.harvesting) {
            action.doHarvest(creep);
        }
        else {
            action.doTransferEnergy(creep);
        }
	}
};

module.exports = roleHarvester;