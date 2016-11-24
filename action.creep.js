var utilsRoom = require('utils.room');
var utilsCreep = require('utils.creep');
var saves = require('saves');

var actionCreep = {
    doHarvest : function(creep){
        var room = creep.room;
        var roomName = room.name;
        
        var maxEnergy = 0;
        if(!Game.flags[creep.memory.destinationFlagName]){
            creep.memory.destinationFlagName = undefined;
        }
        else if(creep.memory.destinationFlagName && room == Game.flags[creep.memory.destinationFlagName].room){
            console.log('['+creep.name+'] reached room: '+Game.flags[creep.memory.destinationFlagName]);
            creep.memory.destinationFlagName = undefined;
        }
        else if(creep.memory.destinationFlagName && Game.flags[creep.memory.destinationFlagName]){
            creep.moveTo(Game.flags[creep.memory.destinationFlagName]);
            creep.memory.action = 'moving to flag: '+Game.flags[creep.memory.destinationFlagName];
            return;
        }
        
        var droppedEnergy = saves[roomName].targets.energyDrops[0];
        if(droppedEnergy){
            creep.memory.action = 'picking up dropped energy: '+droppedEnergy;
            if(creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE)
                creep.moveTo(droppedEnergy);
            return;
        }
        
        var sources = saves[roomName].targets.sources;
        var sourcesHaveEnergy = saves[roomName].targets.sourcesHaveEnergy;

        if(sourcesHaveEnergy && sources.length){ // source in this room have energy
            
            if(creep.memory.moveSourcesIndex == undefined)
                creep.memory.moveSourcesIndex = 0;
    
            if(creep.memory.moveSourcesIndex >= sources.length){
                creep.memory.moveSourcesIndex = 0;
            }
    
            creep.memory.action = 'harvesting source: '+sources[creep.memory.moveSourcesIndex];
            if(sources[creep.memory.moveSourcesIndex].energy <= 0)
                creep.memory.moveSourcesIndex++;
            else if(creep.harvest(sources[creep.memory.moveSourcesIndex]) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(sources[creep.memory.moveSourcesIndex]) == ERR_NO_PATH){
                    creep.memory.moveSourcesIndex++;
                }
            }
        }
        else{
            /*var storages = utilsRoom.getMotherRoom().find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return  (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) 
                                && structure.store[RESOURCE_ENERGY] > 0;
                }
            });
            
            if(storages.length > 0){ // storages in this room have energy
                var keys = Object.keys(storages);
                
                if(creep.memory.moveSourcesIndex == undefined)
                    creep.memory.moveSourcesIndex = 0;
        
                if(creep.memory.moveSourcesIndex >= keys.length){
                    creep.memory.moveSourcesIndex = 0;
                }
                if(storages[keys[creep.memory.moveSourcesIndex]].store[RESOURCE_ENERGY] <= 0)
                    creep.memory.moveSourcesIndex++;
                else if(creep.withdraw(storages[keys[creep.memory.moveSourcesIndex]],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    if(creep.moveTo(storages[keys[creep.memory.moveSourcesIndex]]) == ERR_NO_PATH){
                        creep.memory.moveSourcesIndex++;
                    }
                }
            }
            else{*/
                var sourceFlags = saves.globalTargets.sourceFlags;
                
                if(sourceFlags.length){
                    var index = 0;
                    try{
                        index = parseInt(Math.random()*sourceFlags.length);
                        //console.log('index is randomized');
                    }catch(e){
                        var lastChar = creep.name[creep.name.length-1];
                        index = lastChar.charCodeAt(0) % sourceFlags.length;
                    }
                    console.log('['+creep.name+'] move to '+ sourceFlags[index]+' for harvesting, flag index:'+index);
                    creep.memory.destinationFlagName = sourceFlags[index].name;
                    creep.moveTo(sourceFlags[index]);
                    creep.memory.action = 'moving to flag: '+Game.flags[creep.memory.destinationFlagName];
                }
            //}
        }
    },
    doUpgrade : function(creep){
        creep.memory.action = 'upgrading: '+utilsRoom.getMotherRoom().controller;
        if(creep.upgradeController(utilsRoom.getMotherRoom().controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(utilsRoom.getMotherRoom().controller);
        }
    },
    doTransferEnergy : function(creep){

        var room = creep.room;
        var roomName = room.name;
        
        var targets = saves.globalTargets.transfers;
    
        if(!targets.length){
            actionCreep.doUpgrade(creep);
            return;
        }
        
        if(creep.memory.moveTargetIndex == undefined)
            creep.memory.moveTargetIndex = 0;
        
        creep.memory.action = 'transfering energy to: '+targets[creep.memory.moveTargetIndex];
        if(creep.transfer(targets[creep.memory.moveTargetIndex], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.moveTo(targets[creep.memory.moveTargetIndex]) == ERR_NO_PATH){
                creep.memory.moveSourcesIndex++;
            }
        }
        if(creep.memory.moveTargetIndex >= targets.length)
            creep.memory.moveTargetIndex = 0;
    },
    doBuild : function(creep){

        var room = creep.room;
        var roomName = room.name;
        var targets = saves.globalTargets.constructionSites;
        var targetKeys = Object.keys(targets);

        if(creep.memory.moveBuildingIndex == undefined)
            creep.memory.moveBuildingIndex = 0;

        var site = targets[targetKeys[creep.memory.moveBuildingIndex]];
        
        if(targetKeys) {
            creep.memory.action = 'building: '+site;
            if(creep.build(site) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(site) == ERR_NO_PATH){
                creep.memory.moveBuildingIndex++;
                }
            }
            if(creep.memory.moveBuildingIndex >= targets.length)
                creep.memory.moveBuildingIndex = 0;
        }
        else{
            if(utilsRoom.isMotherRoomEnergyFull())
                actionCreep.doUpgrade(creep);
            else if(utilsCreep.isCreepEnergyFull(creep))
                actionCreep.doTransferEnergy(creep);
            else
                actionCreep.doHarvest(creep);
                
        }
            
    },
    doRepair : function(creep){
        if(creep.room != utilsRoom.getMotherRoom())
            creep.moveTo(utilsRoom.getMotherRoom());

        var room = creep.room;
        var roomName = room.name;

        
        
        var currentRepairTarget = Game.getObjectById(creep.memory.currentRepairTargetId);
        if( (currentRepairTarget && creep.memory.originalTargetHits) 
            && currentRepairTarget.hits < currentRepairTarget.hitsMax
            && currentRepairTarget.hits < creep.memory.originalTargetHits + creep.memory.maxRepairPoint ){
            creep.memory.action = 'repairing: '+currentRepairTarget;
            if(creep.repair(currentRepairTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(currentRepairTarget);
            }    
        }
        else{
            
            var isRepairUrgent = saves.globalTargets.isRepairUrgent;

            if(!isRepairUrgent && !utilsRoom.isMotherRoomEnergyFull()){
                if(utilsCreep.isCreepEnergyFull(creep))
                    actionCreep.doTransferEnergy(creep);
                else
                    actionCreep.doHarvest(creep);
                return;
            }

            /*var damagedStructures = saves.globalTargets.damagedStructures;
            var index = undefined;
            var min = 90000000;

            for(var i in damagedStructures){
                var hits = damagedStructures[i].hits;
                if(hits < min){
                    index = i;
                    min = damagedStructures[i].hits;
                }
            }
            
            if(damagedStructures[index]) {
                
                creep.memory.currentRepairTargetId = damagedStructures[index].id;
                creep.memory.originalTargetHits = damagedStructures[index].hits;
                creep.memory.maxRepairPoint = creep.carry.energy * 100;
                console.log('['+creep.name+'] has new repair target: ' + damagedStructures[index] + ', energy:'+creep.carry.energy+', maxRepair:'+creep.memory.maxRepairPoint);
                creep.memory.action = 'repairing: '+damagedStructures[index];
                if(creep.repair(damagedStructures[index]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(damagedStructures[index]);
                }
            }*/
            var mostUrgentRepair = saves.globalTargets.mostUrgentRepair;

            if(mostUrgentRepair){
                creep.memory.currentRepairTargetId = mostUrgentRepair.id;
                creep.memory.originalTargetHits = mostUrgentRepair.hits;
                creep.memory.maxRepairPoint = creep.carry.energy * 100;
                console.log('['+creep.name+'] has new repair target: ' + mostUrgentRepair + ', energy:'+creep.carry.energy+', maxRepair:'+creep.memory.maxRepairPoint);
                creep.memory.action = 'repairing: '+mostUrgentRepair;
                if(creep.repair(mostUrgentRepair) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mostUrgentRepair);
                }
            }
            else{
                if(utilsRoom.isMotherRoomEnergyFull())
                    actionCreep.doUpgrade(creep);
                else if(utilsCreep.isCreepEnergyFull(creep))
                    actionCreep.doTransferEnergy(creep);
                else
                    actionCreep.doHarvest(creep);
            }
        }
    },
    doNeedRenew : function(creep){
        if(creep.ticksToLive < 300){
            //if(!creep.memory.renewing)
                //console.log('Creep ['+creep.name+'] needs renewing.');
            creep.memory.renewing = true;
            return true;
        }
        return false;
    },
    doRenew : function(creep){
        var spawn = Game.spawns['Talkroom'];
        creep.memory.action = 'renewing at: '+spawn;
        var renewResult = spawn.renewCreep(creep);
        if(renewResult == ERR_NOT_IN_RANGE)
            creep.moveTo(spawn);
        else if(renewResult == OK && creep.carry.energy > 0 && spawn.energy < spawn.energyCapacity)
            creep.transfer(spawn, RESOURCE_ENERGY);
        else if(renewResult != OK){
            creep.memory.renewing = false;
            //console.log('Creep ['+creep.name+'] finished renewing.');
        }
        return renewResult;
    },
    isDanger : function(creep){
        if(creep.room.find(FIND_HOSTILE_CREEPS).length > 0){
            console.log('['+creep.name+'] found hostiles!');
            return true;
        }
        return false;
    },
    doAvoid : function(creep){
        console.log('['+creep.name+'] retreats to savezone');
        creep.memory.action = 'avoiding enemy';
        creep.moveTo(Game.flags['SaveZone']);
    },
    doAttack : function(creep){
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            creep.memory.action = 'attacking enemy: '+closestHostile;
            if(creep.attack(closestHostile)==ERR_NOT_IN_RANGE)
                creep.moveTo(closestHostile);
        }
    }
}

module.exports = actionCreep;