import "./translations"

import {
	Building,
	DOTAGameState,
	DOTAGameUIState,
	Entity,
	EventsSDK,
	Fort,
	Fountain,
	GameRules,
	GameState,
	Modifier,
	Thinker,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { GUI } from "./gui"
import { MenuManager } from "./menu/index"
import { GlyphManager } from "./modules/glyph"
import { RadarManager } from "./modules/radar"

new (class CScanGlyph {
	private readonly gui = new GUI()
	private readonly menu = new MenuManager()

	private readonly radarManager = new RadarManager(this.menu)
	private readonly glyphManager = new GlyphManager(this.menu)

	constructor() {
		EventsSDK.on("Draw", this.Draw.bind(this))
		EventsSDK.on("EntityCreated", this.EntityCreated.bind(this))
		EventsSDK.on("EntityDestroyed", this.EntityDestroyed.bind(this))
		EventsSDK.on("ModifierCreated", this.ModifierCreated.bind(this))
		EventsSDK.on("ModifierRemoved", this.ModifierRemoved.bind(this))
	}

	protected get State() {
		return this.menu.State.value
	}

	protected get IsUIGame() {
		return GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
	}

	protected get IsPostGame() {
		return (
			GameRules === undefined ||
			GameRules.GameState === DOTAGameState.DOTA_GAMERULES_STATE_POST_GAME
		)
	}

	public Draw() {
		if (this.State && this.IsUIGame && !this.IsPostGame) {
			this.radarManager.Draw(this.gui)
			this.glyphManager.Draw(this.gui)
		}
	}

	public ModifierCreated(modifier: Modifier) {
		if (this.ShouldUnit(modifier.Parent)) {
			this.radarManager.ModifierCreated(modifier)
			this.glyphManager.ModifierCreated(modifier)
		}
	}

	public ModifierRemoved(modifier: Modifier) {
		if (this.ShouldUnit(modifier.Parent)) {
			this.radarManager.ModifierRemoved(modifier)
			this.glyphManager.ModifierRemoved(modifier)
		}
	}

	public EntityCreated(entity: Entity) {
		if (entity instanceof Fountain) {
			this.radarManager.EntityCreated(entity)
		}
	}

	public EntityDestroyed(entity: Entity) {
		if (entity instanceof Fountain) {
			this.radarManager.EntityDestroyed(entity)
		}
	}

	protected ShouldUnit(unit: Nullable<Unit>) {
		if (unit === undefined) {
			return false
		}
		if (unit instanceof Thinker) {
			return true
		}
		if (unit instanceof Building) {
			return unit.IsTower || unit.IsBarrack || unit instanceof Fort
		}
		return unit.IsCreep
	}
})()
