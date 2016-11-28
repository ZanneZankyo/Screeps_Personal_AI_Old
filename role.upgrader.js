var action = require('action.creep');
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
	    }
	    if(!creep.memory.upgrading && action.isCarryFull(creep)) {
	        creep.memory.upgrading = true;
	    }
	    if(!creep.memory.renewing)
            action.doNeedRenew(creep);
        
        if (creep.memory.renewing){
            action.doRenew(creep);
        }
        else if(action.isDanger(creep)){
            action.doAvoid(creep);
        }
	    else if(creep.memory.upgrading) {
            action.doUpgrade(creep);
        }
        else {
            action.doGetEnergyFromLinkReceiver(creep);
        }
	}
};

module.exports = roleUpgrader;