var utilsRoom = require('utils.room');
var utilsCreep = require('utils.creep');
var saves = require('saves');

var actionCreep = {
    doHarvest : function(creep){
        var room = creep.room;
        var roomName = room.name;
        
        var maxEnergy = 0;
        if(Game.flags[creep.memory.destinationFlagName] || (creep.memory.destinationFlagName && room == Game.flags[creep.memory.destinationFlagName].room))
            creep.memory.destinationFlagName = undefined;
        else if(creep.memory.destinationFlagName && Game.flags[creep.memory.destinationFlagName]){
            creep.moveTo(Game.flags[creep.memory.destinationFlagName]);
            return;
        }
        
        var droppedEnergy = saves[roomName].targets.energyDrops[0];
        if(droppedEnergy){
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
                var sourceFlags = [];
                var flagRooms = [];
                for(var i in Game.flags){
                    if(Game.flags[i].color == COLOR_YELLOW){
                        sourceFlags.push(Game.flags[i]);
                    }
                }
                
                if(sourceFlags.length > 0){
                    var index = 0;
                    try{
                        index = parseInt(Math.random()*sourceFlags.length);
                        //console.log('index is randomized');
                    }catch(e){
                        var lastChar = creep.name[creep.name.length-1];
                        index = lastChar.charCodeAt(0) % sourceFlags.length;
                    }
                    creep.memory.destinationFlagName = sourceFlags[index].name;
                    creep.moveTo(sourceFlags[index]);
                    console.log('['+creep.name+'] move to '+ sourceFlags[index]+' for harvesting, flag index:'+index);
                }
            //}
        }
    },
    doUpgrade : function(creep){
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

        if(creep.memory.moveBuildingIndex == undefined)
            creep.memory.moveBuildingIndex = 0;
        
        if(targets.length) {
            if(creep.build(targets[creep.memory.moveBuildingIndex]) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(targets[creep.memory.moveBuildingIndex]) == ERR_NO_PATH){
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

        var damagedStructures = saves.globalTargets.damagedStructures;
        
        var currentRepairTarget = Game.getObjectById(creep.memory.currentRepairTargetId);
        if( (currentRepairTarget && creep.memory.originalTargetHits) 
            && currentRepairTarget.hits < currentRepairTarget.hitsMax
            && currentRepairTarget.hits < creep.memory.originalTargetHits + creep.memory.maxRepairPoint ){
            if(creep.repair(currentRepairTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(currentRepairTarget);
            }    
        }
        else{
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
                
                if(creep.repair(damagedStructures[index]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(damagedStructures[index]);
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
        if(creep.ticksToLive < 200){
            //if(!creep.memory.renewing)
                //console.log('Creep ['+creep.name+'] needs renewing.');
            creep.memory.renewing = true;
            return true;
        }
        return false;
    },
    doRenew : function(creep){
        var spawn = Game.spawns['Talkroom'];
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
        creep.moveTo(Game.flags['SaveZone']);
    },
    doAttack : function(creep){
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            if(creep.attack(closestHostile)==ERR_NOT_IN_RANGE)
                creep.moveTo(closestHostile);
        }
    }
}

module.exports = actionCreep;