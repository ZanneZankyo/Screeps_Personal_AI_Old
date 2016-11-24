var saves = require('saves');
var utilsCreep = require('utils.creep');
var utilsRoom = {
    getMotherRoom : function (){
        return Game.spawns['Talkroom'].room;
    },
    spawnCreep : function (){
        var maxEnergy = utilsRoom.getMotherRoom().energyCapacityAvailable;
        var currentEnergy = utilsRoom.getMotherRoom().energyAvailable;
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        if(currentEnergy >= maxEnergy || harvesters.length < 1){
            var roleName = utilsRoom.getNextSpawnCreepRole();
            if(roleName == undefined)
                return;
            var body = utilsRoom.getBodyPart(currentEnergy,roleName);
            console.log('Spawn ['+roleName+'] with body: ['+ body + ']');
            var roomName = Game.spawns['Talkroom'].room.name;
            Game.spawns['Talkroom'].createCreep(body,undefined,{role:roleName,roomName:roomName,spawnName:'Talkroom'});
        }
    },
    getNextSpawnCreepRole : function (){
        
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
        var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
        
        if(harvesters.length < 2)
            return 'harvester';
        if(upgraders.length < 1)
            return 'upgrader';
        if(repairers.length < 2)
            return 'repairer';
        //if(claimers.length < 1 && utilsRoom.getMotherRoom().energyAvailable > 650)
        //    return 'claimer';
        
        if(builders.length + upgraders.length + harvesters.length >= 30)
            return undefined;
        
        var creepsOfRoles = [
            {name:'harvester',length:harvesters.length},
            {name:'builder',length:builders.length},
            {name:'upgrader',length:upgraders.length},
            {name:'repairer',length:repairers.length}
        ];
        var minIndex = 0;
        var min = creepsOfRoles[0].length;
        for(var index in creepsOfRoles){
            var creepsOfRole = creepsOfRoles[index];
            if(creepsOfRole.length < min){
                min = creepsOfRole.length;
                minIndex = index;
            }
        }
        return creepsOfRoles[minIndex].name;
    },
    getBodyPart : function(currentEnergy,roleName){
        if(roleName == 'claimer')
            return utilsRoom.getClaimerBodyPart();
        return utilsRoom.getWorkerBodyPart(currentEnergy);
    },
    getWorkerBodyPart : function(totalEnergy){
        var parts = [
            {energy:50,type:MOVE},
            {energy:100,type:WORK},
            {energy:50,type:CARRY}
        ];
        var isPartsAddable = [true,true,true];
        var index = 0;
        var currentEnergy = 0;
        var body = [];
        while(isPartsAddable[0]||isPartsAddable[1]||isPartsAddable[2]){
            if(index >= parts.length)
                index = 0;
            if(parts[index].energy <= totalEnergy - currentEnergy){
                body.push(parts[index].type);
                currentEnergy += parts[index].energy;
            }
            else
                isPartsAddable[index] = false;
            index++;
        }
        return body;
    },
    getClaimerBodyPart : function(){
        return [CLAIM,MOVE];
    },
    isMotherRoomEnergyFull : function(){
        var maxEnergy = utilsRoom.getMotherRoom().energyCapacityAvailable;
        var currentEnergy = utilsRoom.getMotherRoom().energyAvailable;
        return currentEnergy >= maxEnergy;
    },
    findAndSaveTargets : function(){
        
        var rooms = Game.rooms;

        var allRoles = {};
        

        //targets at each room
        for(var roomName in rooms)
        {
            saves[roomName] = {};

            var creeps = Game.creeps;
            var creepRoles = {};
            for(var i in creeps){
                if(creeps[i].room.name != roomName)
                    continue;
                creepRoles[creeps[i].memory.role] = true;
                allRoles[creeps[i].memory.role] = true;
            }

            var room = rooms[roomName];
            var targets = {};

            var energyDrops = room.find(FIND_DROPPED_ENERGY);
            targets.energyDrops = energyDrops;
            if(!energyDrops.length){
                var sources = room.find(FIND_SOURCES);

                var sourcesHaveEnergy = false;
                for(var i in sources){
                    if(sources[i].energy > 0){
                        sourcesHaveEnergy = true;
                        break;
                    }
                }
                targets.sourcesHaveEnergy = sourcesHaveEnergy;
                targets.sources = sources;
                if(!sourcesHaveEnergy || !sources.length){
                    var storages = utilsRoom.getMotherRoom().find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return  (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) 
                                        && structure.store[RESOURCE_ENERGY] > 0;
                        }
                    });
                    targets.storages = storages;
                }
            }
            saves[roomName].targets = targets;
        }
        //console.log('allRoles:'+Object.keys(allRoles));

        //globalTargets
        var globalTargets = {};

        var transfers = [];
        var tower = Game.getObjectById('583475f06925cd5373e8c228');
        if(tower && tower.energy < 1000 && utilsCreep.getCreepsLength()>20){
            transfers = [tower];
        }
        else if(!utilsRoom.isMotherRoomEnergyFull()){
            transfers = utilsRoom.getMotherRoom().find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return  (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN)
                            && structure.energy < structure.energyCapacity;
                }
            });
        }
        else if(tower && tower.energy < 1000){
            transfers = [tower];
        }
        else{
            transfers = utilsRoom.getMotherRoom().find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return  (
                                (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER)
                                && structure.energy < structure.energyCapacity
                            )
                            ||
                            (
                                (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) 
                                && structure.store[RESOURCE_ENERGY] < structure.storeCapacity
                            );
                }
            });
        }
        globalTargets.transfers = transfers;

        globalTargets.sourceFlags = _.filter(Game.flags, (flag) => flag.color == COLOR_YELLOW);

        if(allRoles['builder']){
            var constructionSites = Game.constructionSites;
            //utilsRoom.getMotherRoom().find(FIND_CONSTRUCTION_SITES);
            //console.log('globalTargets.constructionSites:'+ constructionSites);
            globalTargets.constructionSites = constructionSites;
        }
        /*if(allRoles['upgrader']){
            globalTargets.controller = utilsRoom.getMotherRoom().controller;
        }*/
        if(allRoles['repairer']){
            var damagedStructures;
            var isRepairUrgent = true;
            damagedStructures = _.filter(Game.structures, 
                (structure) => (structure.structureType == STRUCTURE_RAMPART && structure.hits < 100000)
                            || (structure.structureType == STRUCTURE_WALL && structure.hits < 100000));
            /*utilsRoom.getMotherRoom().find(FIND_STRUCTURES, {
                filter: (structure) => (structure.structureType == STRUCTURE_RAMPART && structure.hits < 100000)
                                    || (structure.structureType == STRUCTURE_WALL && structure.hits < 100000)
            });*/
            if(!damagedStructures.length){
                isRepairUrgent = false;
                damagedStructures = _.filter(Game.structures, 
                (structure) => structure.hits <= structure.hitsMax - 100);

                var index = undefined;
                var min = 90000000;

                for(var i in damagedStructures){
                    var hits = damagedStructures[i].hits;
                    if(hits < min){
                        index = i;
                        min = damagedStructures[i].hits;
                    }
                }
                globalTargets.mostUrgentRepair = damagedStructures[index];
                /*utilsRoom.getMotherRoom().find(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits <= structure.hitsMax - 100 && structure.hits < 100000
                });*/
            }
            globalTargets.damagedStructures = damagedStructures;
            globalTargets.isRepairUrgent = isRepairUrgent;
        }
        saves.globalTargets = globalTargets;
    }
}

module.exports = utilsRoom;