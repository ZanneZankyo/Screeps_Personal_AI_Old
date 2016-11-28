var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleClaimer = require('role.claimer');
var roleRepairer = require('role.repairer');
var roleCarrier = require('role.carrier');
var roleLinkCarrier = require('role.linkCarrier');
var roleOutsideHarvester = require('role.outsideHarvester');
var roleOutsideCarrier = require('role.outsideCarrier');

var actionCreep = require('action.creep');
var utilsRoom = require('utils.room');
var utilsCreep = require('utils.creep');
var saves = require('saves');

module.exports.loop = function () {

    //console.log(Object.keys(saves.outsideHarvesters) + '/' + Object.keys(saves.outsideCarriers) );


    utilsCreep.clearDeadCreeps();
    
    for(var i in saves.towers){
        var tower = saves.towers[i];
        if(tower) {
            
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            }
        }
    }
    
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
        else if(creep.memory.role == 'carrier')
            roleCarrier.run(creep);
        else if(creep.memory.role == 'linkCarrier')
            roleLinkCarrier.run(creep);
        else if(creep.memory.role == 'outsideHarvester')
            roleOutsideHarvester.run(creep);
        else if(creep.memory.role == 'outsideCarrier')
            roleOutsideCarrier.run(creep);
    }

    utilsCreep.clearAssignments();
    utilsRoom.spawnCreep();
    //console.log(saves.outsideCarriers['E1S41.source']);

    var linkSender = saves.linkSenders[0];
    var linkReceiver = saves.linkReceivers[0];
    if(linkReceiver && linkReceiver.energy < linkReceiver.energyCapacity){
        if(linkSender){
            var result = linkSender.transferEnergy(linkReceiver);
            //console.log('linkSender.transferEnergy(linkReceiver):'+result);
        }
    }
}