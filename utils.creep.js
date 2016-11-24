/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utils.creep');
 * mod.thing == 'a thing'; // true
 */
 
var utilsCreep = {
    clearDeadCreeps : function(){
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing dead creep memory:', name);
            }
        }
    },
    getCreepsLength : function(){
        return Object.keys(Game.creeps).length;
    },
    isCreepEnergyFull : function(creep){
        return creep.carry.energy >= creep.carryCapacity;
    }
}

module.exports = utilsCreep;