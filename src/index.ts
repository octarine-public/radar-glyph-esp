import "./translations"

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
		EventsSDK.on("Draw2D", this.Draw2D.bind(this))
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
			Dota2SDK.GameRules === undefined ||
			Dota2SDK.GameRules.GameState === DOTAGameState.DOTA_GAMERULES_STATE_POST_GAME
		)
	}

	protected get ShouldDraw() {
		return this.State && this.IsUIGame && !this.IsPostGame
	}

	/** The scans and the glyph chips, pinned to the world and so drawn every frame. */
	public Draw() {
		if (this.ShouldDraw) {
			this.radarManager.Draw(this.gui)
			this.glyphManager.Draw(this.gui)
		} else {
			// no world to stand a scan or a chip in: what is on its way out goes now rather
			// than dissolving onto a loading screen the next time a match opens
			this.gui.ResetRadarWorld()
			this.gui.ResetGlyphWorld()
		}
	}

	/** The cooldowns by the minimap's buttons, which stand on the screen. */
	public Draw2D() {
		if (this.ShouldDraw) {
			this.radarManager.DrawOnScreen(this.gui)
			this.glyphManager.DrawOnScreen(this.gui)
		} else {
			this.gui.HideOnScreen()
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
