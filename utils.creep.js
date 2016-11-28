/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('utils.creep');
 * mod.thing == 'a thing'; // true
 */
var saves = require('saves');
 
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
    },
    getCostList : function(){
        var costs = {};
        costs['work'] = 100;
        costs['carry'] = 50;
        costs['move'] = 50;
        return costs;
    },
    assignHarvestRoom : function(creep){
        var sourceFlags = saves.globalTargets.sourceFlags;
        for(var i in sourceFlags){
            var flagName = sourceFlags[i].name;
            if(!saves.outsideHarvesters[flagName]){
                creep.memory.flagName = flagName;
                saves.outsideHarvesters[flagName] = creep.name;
                break;
            }
        }
        console.log('assign to room:'+creep.memory.flagName);
    },
    assignCarryRoom : function(creep){
        var sourceFlags = saves.globalTargets.sourceFlags;

        for(var i in sourceFlags){
            var flagName = sourceFlags[i].name;
            if(!saves.outsideCarriers[flagName]){
                creep.memory.flagName = flagName;
                saves.outsideCarriers[flagName] = creep.name;
                break;
            }
        }
        console.log('assign to room:'+creep.memory.flagName);
    },
    clearAssignments : function(){
        var sourceFlags = saves.globalTargets.sourceFlags;
        for(var i in sourceFlags){
            var flagName = sourceFlags[i].name;
            if(saves.outsideHarvesters[flagName] && !Game.creeps[saves.outsideHarvesters[flagName]]){
                console.log('clear dead assigned outsideHarvester:'+saves.outsideHarvesters[flagName]);
                saves.outsideHarvesters[flagName] = undefined;
            }
            if(saves.outsideCarriers[flagName] && !Game.creeps[saves.outsideCarriers[flagName]]){
                console.log('clear dead assigned outsideCarrier:'+saves.outsideCarriers[flagName]);
                saves.outsideCarriers[flagName] = undefined;
            }
        }
    }
}

module.exports = utilsCreep;