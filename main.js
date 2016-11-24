var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleClaimer = require('role.claimer');
var roleRepairer = require('role.repairer');
var actionCreep = require('action.creep');
var utilsRoom = require('utils.room');
var utilsCreep = require('utils.creep');

module.exports.loop = function () {

    utilsCreep.clearDeadCreeps();
    
    var tower = Game.getObjectById('583475f06925cd5373e8c228');
    if(tower) {
        
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
        /*else{
            var damagedStructures = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax - 800
            });
            var index = undefined;
            var min = 9000000;
            for(var i in damagedStructures){
                if(damagedStructures[i].hits < min){
                    index = i;
                    min = damagedStructures[i].hits;
                }
            }
            if(damagedStructures[index]) {
                tower.repair(damagedStructures[index]);
            }
        }*/
    }

    utilsRoom.spawnCreep();
    
    utilsRoom.findAndSaveTargets();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester')
            roleHarvester.run(creep);
        else if(creep.memory.role == 'upgrader')
            roleUpgrader.run(creep);
        else if(creep.memory.role == 'builder')
            roleBuilder.run(creep);
        else if(creep.memory.role == 'claimer')
            roleClaimer.run(creep);
        else if(creep.memory.role == 'repairer')
            roleRepairer.run(creep);
    }
}