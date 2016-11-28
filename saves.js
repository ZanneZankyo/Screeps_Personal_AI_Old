/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('saves');
 * mod.thing == 'a thing'; // true
 */
 
var saves = {
	towers : [Game.getObjectById('583475f06925cd5373e8c228'),Game.getObjectById('583b40d4c9fee0d10f2e12c7')],
	spawns : [Game.spawns['Talkroom']],
	linkSenders : [Game.getObjectById('583b747f8a6863104b90cc94')],
	linkReceivers : [Game.getObjectById('583b80c54de580c118117567')],
	storages : [Game.getObjectById('58357ad908bd538d44185b8d')],
	outsideHarvesters : {},
	outsideCarriers : {},
};

module.exports = saves;