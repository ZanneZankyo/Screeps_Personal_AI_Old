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

        if(!creep.memory.renewing)
	    	action.doNeedRenew(creep);

        if (creep.memory.renewing){
            action.doRenew(creep);
        }
        else if(action.isCarryFull(creep)){
            action.doTransferToLinkSender(creep);
        }
        else {
            action.doGetEnergyFromStorage(creep);
        }
    }
}

module.exports = roleLinkCarrier;