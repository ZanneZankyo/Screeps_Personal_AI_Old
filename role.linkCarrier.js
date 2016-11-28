/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.linkCarrier');
 * mod.thing == 'a thing'; // true
 */
var action = require('action.creep');
var saves = require('saves');
var roleLinkCarrier = {
    run : function(creep){

        if(!creep.memory.renewing){
        	//console.log('roleLinkCarrier.doNeedRenew');
	    	action.doNeedRenew(creep);
        }

	    //console.log('roleLinkCarrier.renewing:'+creep.memory.renewing);
        if (creep.memory.renewing){
            action.doRenew(creep);
        }
        else if(action.isCarryFull(creep)){
        	action.doTransferToLinkSender(creep);
        }
        else {
        	if(saves.storages[0].store[RESOURCE_ENERGY] < 800){
        		creep.memory.action='storage energy too low';
        		return;
        	}
            action.doGetEnergyFromStorage(creep);
        }
    }
}

module.exports = roleLinkCarrier;