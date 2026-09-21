import { TeamNames } from "../enum"
import { BaseWorldMenu } from "./base"
import { RadarGlyphIcons } from "./icons"

export class RadarWorldMenu extends BaseWorldMenu {
	public readonly Size: Menu.Slider
	/** Whose scans stand in the world: a tick per side, both of them to begin with. */
	public readonly Team: Menu.MultiSelect

	constructor(node: Menu.Node) {
		super(node, "Radar", "Show radar timer in world", RadarGlyphIcons.Radar)

		this.Team = this.Tree.AddMultiSelect("Team", TeamNames, TeamNames, "Show on team")
		this.Team.IconPath = RadarGlyphIcons.Team

		this.Size = this.Tree.AddSlider("Additional size", 2, 0, 20)
		this.Size.IconPath = RadarGlyphIcons.Size
	}

	public MenuChanged(callback: () => void) {
		super.MenuChanged(callback)
		this.Size.OnValue(() => callback())
		this.Team.OnValue(() => callback())
	}

	public ResetSettings(): void {
		super.ResetSettings()
		this.Size.value = this.Size.defaultValue
		this.Team.SelectedNames = this.Team.defaultValue
	}
}
