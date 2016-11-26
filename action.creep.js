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
            
            if(creep.memory.targetIndex == undefined)
                creep.memory.targetIndex = 0;
    
            if(creep.memory.targetIndex >= sources.length){
                creep.memory.targetIndex = 0;
            }
    
            creep.memory.action = 'harvesting source: '+sources[creep.memory.targetIndex];
            if(sources[creep.memory.targetIndex].energy <= 0)
                creep.memory.targetIndex++;
            else if(creep.harvest(sources[creep.memory.targetIndex]) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(sources[creep.memory.targetIndex]) == ERR_NO_PATH){
                    creep.memory.targetIndex++;
                }
            }
        }
        else{

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
        
        if(creep.memory.targetIndex == undefined)
            creep.memory.targetIndex = 0;
        
        creep.memory.action = 'transfering energy to: '+targets[creep.memory.targetIndex];
        if(creep.transfer(targets[creep.memory.targetIndex], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            if(creep.moveTo(targets[creep.memory.targetIndex]) == ERR_NO_PATH){
                creep.memory.moveSourcesIndex++;
            }
        }
        if(creep.memory.targetIndex >= targets.length)
            creep.memory.targetIndex = 0;
    },
    doBuild : function(creep){

        var room = creep.room;
        var roomName = room.name;
        var targets = saves.globalTargets.constructionSites;
        var targetKeys = Object.keys(targets);

        if(creep.memory.targetIndex == undefined)
            creep.memory.targetIndex = 0;

        if(creep.memory.targetIndex >= targetKeys.length)
                creep.memory.targetIndex = 0;

        var site = targets[targetKeys[creep.memory.targetIndex]];
        
        if(site) {
            creep.memory.action = 'building: '+site;
            if(creep.build(site) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(site) == ERR_NO_PATH){
                creep.memory.targetIndex++;
                }
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
            console.log('['+creep.name+'] found hostiles! at room: ['+creep.room.name+']');
            return true;
        }
        return false;
    },
    doAvoid : function(creep){
        console.log('['+creep.name+'] retreats to savezone');
        creep.moveTo(Game.flags['SaveZone']);
        creep.memory.action = 'avoiding enemy';
        creep.memory.destinationFlagName = undefined;
        creep.memory.targetIndex = undefined;
        creep.memory.currentRepairTarget = undefined;
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