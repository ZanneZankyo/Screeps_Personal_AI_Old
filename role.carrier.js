var action = require('action.creep');

var roleCarrier = {
	run : function(creep){
		if(!creep.memory.carrying && creep.carry.energy <= 0)
            creep.memory.carrying = true;
        if(creep.memory.carrying && action.isCarryFull(creep))
            creep.memory.carrying = false;
        if(!creep.memory.renewing)
	    	action.doNeedRenew(creep);

        if (creep.memory.renewing){
            action.doRenew(creep);
        }
        else if(action.isDanger(creep)){
            action.doAvoid(creep);
        }
	    else if(creep.memory.carrying) {
            action.doGetEnergyFromStorage(creep);
        }
        else {
            action.doTransferEnergy(creep);
        }
	}
}

module.exports = roleCarrier;