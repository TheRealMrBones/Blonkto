const Cell = require('./cell.js');

const StoneBlock = require('./blocks/stoneBlock.js');

const blocks = [
    StoneBlock,
];

const GrassFloor = require('./floors/grassFloor.js');

const floors = [
    GrassFloor,
];

// fill later

const ceilings = [

];

exports.GetCellObject = (blockid, floorid, ceilingid) => {
    // Find block
    let block = null;
    const b = blocks.find(b => b.id == blockid);
    if(b){
        block = new b();
    }

    // Find floor
    let floor = null;
    const f = floors.find(f => f.id == floorid);
    if(f){
        floor = new f();
    }
    
    // Find block
    let ceiling = null;
    const c = ceilings.find(c => c.id == ceilingid);
    if(c){
        ceiling = new c();
    }

    // Make cell
    return new Cell(block, floor, ceiling);
}