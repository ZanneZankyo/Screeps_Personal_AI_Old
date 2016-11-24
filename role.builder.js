var action = require('action.creep');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var debug = false;
        //if(creep.name == 'Michael')
            //debug = true;

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }
	    action.doNeedRenew(creep);

        if (creep.memory.renewing){
            action.doRenew(creep);
            if(debug) console.log('doRenew');
        }
        else if(action.isDanger(creep)){
            action.doAvoid(creep);
            if(debug) console.log('doAvoid');
        }
	    else if(creep.memory.building) {
	        action.doBuild(creep);
	        if(debug) console.log('doBuild');
	    }
	    else {
	        action.doHarvest(creep);
	        if(debug) console.log('doHarvest');
	    }
	}
};

module.exports = roleBuilder;