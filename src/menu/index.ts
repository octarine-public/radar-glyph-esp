import { GlyphWorldMenu } from "./glyph"
import { RadarGlyphIcons } from "./icons"
import { CarryOverPage, MigrateTeamRow, StoredNode } from "./migrate"
import { RadarWorldMenu } from "./radar"

/** What the page is filed under, in the tree and in every stored config. */
const NODE_NAME = "Radar and glyph"
/** The section holding the team row, which was a dropdown before it became ticks. */
const RADAR_NAME = "Radar"

export class MenuManager {
	public readonly State: Menu.Toggle

	public readonly Radar: RadarWorldMenu
	public readonly Glyph: GlyphWorldMenu

	public readonly RCooldown: Menu.Toggle
	public readonly GCooldown: Menu.Toggle

	private readonly tree: Menu.Node
	private readonly baseNode = Menu.AddEntry("Visual")

	constructor() {
		this.tree = this.baseNode.AddNode(
			NODE_NAME,
			RadarGlyphIcons.RadarGlyph,
			"Radar and glyph timers in the world,\nand the enemy's cooldowns on the minimap buttons"
		)
		this.tree.SortNodes = false

		// a config written while the page stood under "Maphack" keeps its values where the
		// page stands now, and the team row keeps them under the ticks that replaced it
		MenuSDK.AddConfigMigration(raw =>
			this.migrate(
				CarryOverPage(
					MenuSDK.ConfigSubtreeOf(raw, this.baseNode.entry),
					NODE_NAME
				)
			)
		)
		this.tree.entry.stored =
			CarryOverPage(this.baseNode.entry.stored, NODE_NAME) ?? this.tree.entry.stored
		this.migrate(this.tree.entry.stored)

		// the script's own switch rides the top bar beside the breadcrumb and gates the page
		this.State = this.tree.AddToggle("State", true)
		this.State.IconPath = RadarGlyphIcons.State
		this.tree.HeaderControl = this.State
		this.tree.Gate = this.State

		this.GCooldown = this.tree.AddToggle(
			"Glyph cooldown",
			true,
			"Show enemy glyph cooldown",
			-1,
			RadarGlyphIcons.GlyphCooldown
		)
		this.RCooldown = this.tree.AddToggle(
			"Radar cooldown",
			true,
			"Show enemy radar cooldown",
			-1,
			RadarGlyphIcons.RadarCooldown
		)

		this.Glyph = new GlyphWorldMenu(this.tree)
		this.Radar = new RadarWorldMenu(this.tree)
	}

	public MenuChanged(callback: () => void) {
		this.Radar.MenuChanged(callback)
		this.Glyph.MenuChanged(callback)
		this.State.OnValue(() => callback())
	}

	/** Reshapes the rows of the page the config holds, wherever the migration found them. */
	private migrate(stored: Nullable<MenuSDK.ConfigObject>) {
		MigrateTeamRow(StoredNode(stored?.[RADAR_NAME]))
	}
}
