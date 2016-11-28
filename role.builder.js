var action = require('action.creep');
var utilsRoom = require('utils.room');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var debug = false;
        //if(creep.name == 'Michael')
            //debug = true;

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && action.isCarryFull(creep)) {
	        creep.memory.building = true;
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
	    else if(creep.memory.building) {
	        action.doBuild(creep);
	    }
	    else {
	    	/*if(creep.room == utilsRoom.getMotherRoom()){
	    		var result = action.doGetEnergyFromStorage(creep);
	    		console.log(result)
	        	if(result==ERR_NOT_ENOUGH_RESOURCES)
	        		action.doHarvest(creep);
	    	}
	        else*/
	        	action.doHarvest(creep);
	    }
	}
};

module.exports = roleBuilder;