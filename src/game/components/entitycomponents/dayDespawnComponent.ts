import Component from "../component.js";
import Game from "../../game.js";
import EntityDefinition from "../../definitions/entityDefinition.js";
import NonplayerEntity from "../../objects/nonplayerEntity.js";

import SharedConfig from "../../../configs/shared.js";
const { CELLS_ASPECT_RATIO, CELLS_VERTICAL } = SharedConfig.WORLD;

const CELLS_HORIZONTAL = Math.ceil(CELLS_VERTICAL * CELLS_ASPECT_RATIO);

/** An Entity Component that makes this entity type despawn during the day time if not in any visual ranges */
class DayDespawnComponent extends Component<EntityDefinition> {
    constructor() {
        super();
    }

    /** Implements this component into its parents functionality */
    override setParent(parent: EntityDefinition): void {
        super.setParent(parent);
        this.getParent().registerTickListener((self: NonplayerEntity, game: Game, dt: number) => this.tick(self, game, dt));
    }

    /** Defines the tick action of an entity with this component */
    tick(self: NonplayerEntity, game: Game, dt: number): void {
        if(game.world.isNight()) return;

        for(const p of self.layer.entityManager.getPlayerEntities()){
            if(Math.abs(p.x - self.x) < CELLS_HORIZONTAL / 2 && Math.abs(p.y - self.y) < CELLS_VERTICAL / 2) return;
        }

        game.entityManager.removeEntity(self.id);
    }
}

export default DayDespawnComponent;
