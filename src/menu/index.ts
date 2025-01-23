import { ImageData, Menu } from "github.com/octarine-public/wrapper/index"

import { GlyphWorldMenu } from "./glyph"
import { RadarWorldMenu } from "./radar"

export class MenuManager {
	public readonly State: Menu.Toggle

	public readonly Radar: RadarWorldMenu
	public readonly Glyph: GlyphWorldMenu

	public readonly RCooldown: Menu.Toggle
	public readonly GCooldown: Menu.Toggle

	private readonly tree: Menu.Node
	private readonly baseNode = Menu.AddEntry("Visual")

	constructor() {
		const iconGlyph = ImageData.Icons.icon_glyph_on
		this.tree = this.baseNode.AddNode("Radar and glyph", iconGlyph)
		this.State = this.tree.AddToggle("State", true)

		this.RCooldown = this.tree.AddToggle(
			"Radar cooldown",
			true,
			"Show enemy radar cooldown",
			-1,
			ImageData.Icons.icon_scan_on
		)
		this.GCooldown = this.tree.AddToggle(
			"Glyph cooldown",
			true,
			"Show enemy glyph cooldown",
			-1,
			iconGlyph
		)

		this.Glyph = new GlyphWorldMenu(this.tree)
		this.Radar = new RadarWorldMenu(this.tree)
	}

	public MenuChanged(callback: () => void) {
		this.Radar.MenuChanged(callback)
		this.Glyph.MenuChanged(callback)
		this.State.OnValue(() => callback())
	}
}
