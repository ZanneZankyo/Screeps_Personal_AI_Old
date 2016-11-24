var roleClaimer = {
    
    run : function(creep){
        var targetFlag = Game.flags['E1S41.controller'];
        creep.memory.isReach = creep.room == targetFlag.room;
        console.log(creep.memory.isReach);
        if(targetFlag){
            if(creep.memory.isReach){
                if(creep.claimController(targetFlag.room.controller) == ERR_NOT_IN_RANGE){
                    creep.moveTo(targetFlag.room.controller);
                }
            }
            else
                creep.moveTo(targetFlag);
        }
    }
    
};

module.exports = roleClaimer;