import { Menu } from "github.com/octarine-public/wrapper/index"

import { BaseWorldMenu } from "./base"

export class GlyphWorldMenu extends BaseWorldMenu {
	public readonly Size: Menu.Slider
	public readonly Fort: Menu.Toggle
	public readonly Tower: Menu.Toggle
	public readonly Creep: Menu.Toggle
	public readonly Barrack: Menu.Toggle

	constructor(node: Menu.Node) {
		super(node, "Glyph", "Show glyph timer in world")
		this.Fort = this.Tree.AddToggle("Forts", false, "Show glyph on forts")
		this.Tower = this.Tree.AddToggle("Towers", true, "Show glyph on towers")
		this.Creep = this.Tree.AddToggle("Creeps", true, "Show glyph on creeps")
		this.Barrack = this.Tree.AddToggle("Barracks", true, "Show glyph on barracks")
		this.Size = this.Tree.AddSlider("Additional size", 2, 0, 20)
	}

	public MenuChanged(callback: () => void) {
		super.MenuChanged(callback)
		this.Fort.OnValue(() => callback())
		this.Tower.OnValue(() => callback())
		this.Creep.OnValue(() => callback())
		this.Barrack.OnValue(() => callback())
	}

	public ResetSettings(): void {
		super.ResetSettings()
		this.Size.value = this.Size.defaultValue
		this.Fort.value = this.Fort.defaultValue
		this.Tower.value = this.Tower.defaultValue
		this.Creep.value = this.Creep.defaultValue
		this.Barrack.value = this.Barrack.defaultValue
	}
}
