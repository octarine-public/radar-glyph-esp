import {
	ImageData,
	Menu,
	NotificationsSDK,
	ResetSettingsUpdated,
	Sleeper
} from "github.com/octarine-public/wrapper/index"

import { GlyphWorldMenu } from "./glyph"
import { RadarWorldMenu } from "./radar"

export class MenuManager {
	public readonly State: Menu.Toggle

	public readonly Radar: RadarWorldMenu
	public readonly Glyph: GlyphWorldMenu

	public readonly RCooldown: Menu.Toggle
	public readonly GCooldown: Menu.Toggle

	private readonly tree: Menu.Node
	private readonly reset: Menu.Button
	private readonly baseNode = Menu.AddEntry("Visual")

	constructor(private readonly sleeper: Sleeper) {
		const iconGlyph = ImageData.Paths.Icons.icon_glyph_on
		this.tree = this.baseNode.AddNode("Radar and glyph", iconGlyph)
		this.State = this.tree.AddToggle("State", true)

		this.RCooldown = this.tree.AddToggle(
			"Radar cooldown",
			true,
			"Show enemy radar cooldown",
			-1,
			ImageData.Paths.Icons.icon_scan_on
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
		this.reset = this.tree.AddButton("Reset settings", "Reset settings to default")
		this.reset.OnValue(() => this.ResetSettings())
	}

	public MenuChanged(callback: () => void) {
		this.Radar.MenuChanged(callback)
		this.Glyph.MenuChanged(callback)
		this.State.OnValue(() => callback())
		this.reset.OnValue(() => callback())
	}

	public ResetSettings() {
		if (!this.sleeper.Sleeping("ResetSettings")) {
			this.Glyph.ResetSettings()
			this.Radar.ResetSettings()
			this.State.value = this.State.defaultValue
			NotificationsSDK.Push(new ResetSettingsUpdated())
			this.sleeper.Sleep(2 * 1000, "ResetSettings")
		}
	}
}
