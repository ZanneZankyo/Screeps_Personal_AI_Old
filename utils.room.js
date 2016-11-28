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
            var creepName = Game.spawns['Talkroom'].createCreep(body,undefined,{role:roleName,roomName:roomName,spawnName:'Talkroom'});
            var newCreep = Game.creeps[creepName];
            if(roleName == 'outsideHarvester'){
                utilsCreep.assignHarvestRoom(newCreep);
            }
            if(roleName == 'outsideCarrier'){
                utilsCreep.assignCarryRoom(newCreep);
            }
        }
    },
    getNextSpawnCreepRole : function (){

        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
        var harvesterWeight = 10;
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
        var upgraderWeight = 9;
        var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
        var repairerWeight = 7;
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
        var builderWeight = 5;
        var carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier');
        var carrierWeight = 6;
        var outsideHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'outsideHarvester');
        var outsideCarriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'outsideCarrier');
        var linkCarriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'linkCarrier');

        var totalWeight = harvesterWeight + upgraderWeight + repairerWeight + builderWeight + carrierWeight;

        var numOfCreeps = utilsCreep.getCreepsLength();

        if(harvesters.length < 2){
            return 'harvester';
        }
        if(carriers.length < 1){
            return 'carrier';
        }
        if(saves.linkSenders[0] && linkCarriers.length < 1){
            return 'linkCarrier';
        }
        if(upgraders.length < 2){
            return 'upgrader';
        }
        if(repairers.length < 1){
            return 'repairer';
        }
        if(builders.length < 1){
            return 'builder';
        }
        if(outsideHarvesters.length < Object.keys(saves.globalTargets.sourceFlags).length && outsideHarvesters.length <= outsideCarriers.length){
            return 'outsideHarvester';
        }
        if(outsideCarriers.length < outsideHarvesters.length){
            return 'outsideCarrier';
        }
        if(repairers.length < 2){
            return 'repairer';
        }
        if(builders.length < 2){
            return 'builder';
        }
        return undefined;
        
        /*if(harvesters.length >= 2 && outsideHarvesters.length < Object.keys(saves.globalTargets.sourceFlags).length && outsideHarvesters.length <= outsideCarriers.length){
            return 'outsideHarvester';
        }
        if(harvesters.length >= 2 && outsideCarriers.length < outsideHarvesters.length){
            return 'outsideCarrier';
        }
        if(harvesters.length >= 2 && saves.linkSenders[0] && linkCarriers.length < 1){
            return 'linkCarrier';
        }

        if(harvesters.length < parseInt(numOfCreeps * harvesterWeight / totalWeight))
            return 'harvester';
        else if(upgraders.length < parseInt(numOfCreeps * upgraderWeight / totalWeight))
            return 'upgrader';
        else if(repairers.length < parseInt(numOfCreeps * repairerWeight / totalWeight))
            return 'repairer';
        else if(builders.length < parseInt(numOfCreeps * builderWeight / totalWeight))
            return 'builder';
        else if(carriers.length < parseInt(numOfCreeps * carrierWeight / totalWeight))
            return 'carrier';
        else if(numOfCreeps < 15)
            return 'harvester';*/
    },
    getBodyPart : function(currentEnergy,roleName){
        if(roleName == 'claimer')
            return utilsRoom.getClaimerBodyPart();
        if(roleName == 'carrier' || roleName == 'outsideCarrier')
            return utilsRoom.getCarrierBodyPart(currentEnergy);
        if(roleName == 'upgrader')
            return utilsRoom.getUpgraderBodyPart(currentEnergy);
        if(roleName == 'harvester')
            return utilsRoom.getHarvesterBodyPart(currentEnergy);
        if(roleName == 'outsideHarvester')
            return utilsRoom.getOutsideHarvesterBodyPart(currentEnergy);
        if(roleName == 'linkCarrier')
            return utilsRoom.getLinkCarrierBodyPart(currentEnergy);
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
            if(isPartsAddable[index] && parts[index].energy <= totalEnergy - currentEnergy){
                body.push(parts[index].type);
                currentEnergy += parts[index].energy;
            }
            else
                isPartsAddable[index] = false;
            index++;
        }
        return body;
    },
    getUpgraderBodyPart : function(totalEnergy){
        var parts = {energy:100,type:WORK};
        var isPartsAddable = true;
        var currentEnergy = 200;
        var body = [CARRY,MOVE,MOVE,MOVE];
        while(isPartsAddable){
            if(parts.energy <= totalEnergy - currentEnergy){
                body.push(parts.type);
                currentEnergy += parts.energy;
            }
            else
                isPartsAddable = false;
        }

        return body;
    },
    getHarvesterBodyPart : function(totalEnergy){
        var parts = {energy:100,type:WORK};
        var isPartsAddable = true;
        var currentEnergy = 200;
        var body = [CARRY,MOVE,MOVE,MOVE];
        var workCount = 0;
        while(isPartsAddable){
            if(parts.energy <= totalEnergy - currentEnergy){
                body.push(parts.type);
                workCount++;
                currentEnergy += parts.energy;
            }
            else
                isPartsAddable = false;
            if(workCount >= 10)
                break;
        }
        return body;
    },
    getClaimerBodyPart : function(){
        return [CLAIM,MOVE];
    },
    getOutsideHarvesterBodyPart : function(totalEnergy){
        var parts = [{energy:100,type:WORK},{energy:50,type:MOVE}];
        var isPartsAddable = [true,true];
        var currentEnergy = 50;
        var body = [CARRY];
        var workCount = 0;
        while(isPartsAddable[0]||isPartsAddable[1]){
            if(index >= parts.length)
                index = 0;
            if(isPartsAddable[index] && parts[index].energy <= totalEnergy - currentEnergy){
                body.push(parts[index].type);
                currentEnergy += parts[index].energy;
                if(parts[index].type == WORK)
                    workCount++;
            }
            else
                isPartsAddable[index] = false;
            if(workCount >= 10)
                break;
            index++;
        }
        return body;
    },
    getCarrierBodyPart : function(totalEnergy){
        var parts = [
            {energy:50,type:MOVE},
            {energy:50,type:CARRY},
            {energy:50,type:CARRY}
        ];
        var isPartsAddable = [true,true,true];
        var index = 0;
        var currentEnergy = 0;
        var body = [];
        while(isPartsAddable[0]||isPartsAddable[1]||isPartsAddable[2]){
            if(index >= parts.length)
                index = 0;
            if(isPartsAddable[index] && parts[index].energy <= totalEnergy - currentEnergy){
                body.push(parts[index].type);
                currentEnergy += parts[index].energy;
            }
            else
                isPartsAddable[index] = false;
            index++;
        }
        return body;
    },
    getLinkCarrierBodyPart : function(totalEnergy){
        var part = {energy:50,type:CARRY};
        var isPartsAddable = true;
        var carryCount = 0;
        var index = 0;
        var currentEnergy = 200;
        var body = [MOVE,MOVE,MOVE,MOVE];
        while(isPartsAddable){
            if(part.energy <= totalEnergy - currentEnergy){
                body.push(part.type);
                currentEnergy += part.energy;
                carryCount++;
            }
            else
                isPartsAddable = false;
            if(carryCount >= 16)
                break;
        }
        return body;
    },
    isMotherRoomEnergyFull : function(){
        var maxEnergy = utilsRoom.getMotherRoom().energyCapacityAvailable;
        var currentEnergy = utilsRoom.getMotherRoom().energyAvailable;
        return currentEnergy >= maxEnergy;
    },
    isMotherRoomEnergyEmpty : function(){
        var currentEnergy = utilsRoom.getMotherRoom().energyAvailable;
        return currentEnergy <= 0;
    },
    isMotherRoomEnergyLow : function(){
        var currentEnergy = utilsRoom.getMotherRoom().energyAvailable;
        return currentEnergy <= 200;
    },
    findAndSaveTargets : function(){
        
        var rooms = Game.rooms;

        var allRoles = {};
        
        var globalRepairTargets = {};
        globalRepairTargets.mostUrgentRepair = undefined;
        globalRepairTargets.damagedStructures = [];
        globalRepairTargets.isRepairUrgent = false;
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

            targets.energyDrops = utilsRoom.findEnergyDropsInRoom(room);
            targets = utilsRoom.findSourcesInRoom(room,targets);

            var repairTargets = utilsRoom.findRepairInRoom(room);
            targets.containers = _.filter(repairTargets,(target) => target.structureType == STRUCTURE_CONTAINER);
            if(repairTargets.mostUrgentRepair){
                if(globalRepairTargets.mostUrgentRepair){
                    if(repairTargets.mostUrgentRepair.hits < globalRepairTargets.mostUrgentRepair.hits)
                        globalRepairTargets.mostUrgentRepair = repairTargets.mostUrgentRepair;
                }
                else{
                    globalRepairTargets.mostUrgentRepair = repairTargets.mostUrgentRepair;
                }
            }
            if(!globalRepairTargets.isRepairUrgent)
                globalRepairTargets.isRepairUrgent = repairTargets.isRepairUrgent;
            globalRepairTargets.damagedStructures = globalRepairTargets.damagedStructures.concat(repairTargets.damagedStructures);

            saves[roomName].targets = targets;
            saves[roomName].storages = utilsRoom.findStoragesInRoom(room);

            //console.log('saves'+room+'.sources '+saves[roomName].targets.sources);
        }
        //console.log('allRoles:'+Object.keys(allRoles));

        //globalTargets
        var globalTargets = {};

        globalTargets.transfers = utilsRoom.findTransfer();

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
        
        globalTargets.damagedStructures = globalRepairTargets.damagedStructures;
        globalTargets.isRepairUrgent = globalRepairTargets.isRepairUrgent;
        globalTargets.mostUrgentRepair = globalRepairTargets.mostUrgentRepair;
        saves.globalTargets = globalTargets;
    },
    findEnergyDropsInRoom : function(room){
        var energyDrops = room.find(FIND_DROPPED_ENERGY);
        return energyDrops;
    },
    findSourcesInRoom : function(room,targets){
        var sources = room.find(FIND_SOURCES);

        var sourcesHaveEnergy = false;
        for(var i in sources){
            if(sources[i].energy > 0){
                sourcesHaveEnergy = true;
                break;
            }
        }
        //console.log('findSourcesInRoom '+room+':'+sources);
        targets.sourcesHaveEnergy = sourcesHaveEnergy;
        targets.sources = sources;
        return targets;
    },
    findRepairInRoom : function(room){
        var repairTargets = {};

        var damagedStructures;
        var isRepairUrgent = true;
        damagedStructures = /*_.filter(Game.structures, 
            (structure) => (structure.structureType == STRUCTURE_RAMPART && structure.hits < 100000)
                        || (structure.structureType == STRUCTURE_WALL && structure.hits < 100000) 
                        || structure.hits <= structure.hitsMax - 100 && structure.hits < 10000);*/
        room.find(FIND_STRUCTURES, {
            filter: (structure) => (structure.structureType == STRUCTURE_RAMPART && structure.hits < 250000)
                                || (structure.structureType == STRUCTURE_WALL && structure.hits < 250000)
                                || (structure.structureType == STRUCTURE_CONTAINER && structure.hits < 250000) 
                                || (structure.hits <= structure.hitsMax - 100 && structure.hits < 10000)
        });
        if(!damagedStructures.length){
            isRepairUrgent = false;
            damagedStructures = /*_.filter(Game.structures, 
            (structure) => structure.hits <= structure.hitsMax - 100);*/
            room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.hits <= structure.hitsMax - 100 && structure.hits < 1000000
            });
        }

        var index = undefined;
        var min = 90000000;

        for(var i in damagedStructures){
            var hits = damagedStructures[i].hits;
            if(hits < min){
                index = i;
                min = damagedStructures[i].hits;
            }
        }

        repairTargets.mostUrgentRepair = damagedStructures[index];
        //console.log('mostUrgentRepair:'+repairTargets.mostUrgentRepair);
        //console.log(damagedStructures);
        //console.log('isRepairUrgent:'+isRepairUrgent);
        repairTargets.damagedStructures = damagedStructures;
        repairTargets.isRepairUrgent = isRepairUrgent;

        return repairTargets;
    },
    findStoragesInRoom : function(room){
        return room.find(FIND_STRUCTURES, {
            filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)
        });
    },
    findTransfer : function(){
        var transfers = [];

        var isTowersEnergyFull = true;
        for(var towerIndex in saves.towers){
            var tower = saves.towers[towerIndex];
            if(tower && tower.energy < tower.energyCapacity){
                isTowersEnergyFull = false;
                break;
            }
        }
        
        if(!isTowersEnergyFull && utilsCreep.getCreepsLength() >= 10){
            transfers = saves.towers;
        }
        else if(!utilsRoom.isMotherRoomEnergyFull()){
            transfers = utilsRoom.getMotherRoom().find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return  (structure.structureType == STRUCTURE_EXTENSION)
                            && structure.energy < structure.energyCapacity;
                }
            });
            if(!transfers.length){
                transfers = utilsRoom.getMotherRoom().find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return  (structure.structureType == STRUCTURE_SPAWN)
                                && structure.energy < structure.energyCapacity;
                    }
                });
            }
        }
        else if(!isTowersEnergyFull){
            transfers = [saves.towers];
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
        return transfers;
    }
}

module.exports = utilsRoom;