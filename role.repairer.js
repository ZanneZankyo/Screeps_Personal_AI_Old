var action = require('action.creep');

var roleRepairer = {
    run : function(creep){
        if(creep.carry.energy <= 0){
            creep.memory.isRepairing = false;
        }
        else if (action.isCarryFull(creep)){
            creep.memory.isRepairing = true;
        }
        if(!creep.memory.renewing)
            action.doNeedRenew(creep);

        if(action.isCarryingOtherResource(creep)){
            action.doTransferToStorage(creep);
        }
        else if (creep.memory.renewing){
            action.doRenew(creep);
        }
        else if(action.isDanger(creep)){
            action.doAvoid(creep);
        }
        else if(creep.memory.isRepairing){
            action.doRepair(creep);
        }
        else{
            action.doHarvest(creep);
        }
    }
}

module.exports = roleRepairer;