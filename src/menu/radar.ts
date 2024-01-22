import { Menu } from "github.com/octarine-public/wrapper/index"

import { BaseWorldMenu } from "./base"

export class RadarWorldMenu extends BaseWorldMenu {
	public readonly Size: Menu.Slider
	public readonly Team: Menu.Dropdown

	constructor(node: Menu.Node) {
		super(node, "Radar", "Show radar timer in world")
		this.Team = this.Tree.AddDropdown("Team", ["Allies and enemy", "Only enemy"])
		this.Size = this.Tree.AddSlider("Additional size", 2, 0, 20)
	}

	public MenuChanged(callback: () => void) {
		super.MenuChanged(callback)
		this.Size.OnValue(() => callback())
		this.Team.OnValue(() => callback())
	}

	public ResetSettings(): void {
		super.ResetSettings()
		this.Size.value = this.Size.defaultValue
		this.Team.SelectedID = this.Team.defaultValue
	}
}
