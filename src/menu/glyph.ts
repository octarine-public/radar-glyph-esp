import { BaseWorldMenu } from "./base"
import { RadarGlyphIcons } from "./icons"

export class GlyphWorldMenu extends BaseWorldMenu {
	public readonly Size: Menu.Slider
	public readonly Fort: Menu.Toggle
	public readonly Tower: Menu.Toggle
	public readonly Creep: Menu.Toggle
	public readonly Barrack: Menu.Toggle
	/** Whether a run of units is read by one plate over it or by a number on every one of them. */
	public readonly Group: Menu.Toggle
	/** How far apart two units may stand and still be the same run, in world units. */
	public readonly Radius: Menu.Slider

	constructor(node: Menu.Node) {
		super(node, "Glyph", "Show glyph timer in world", RadarGlyphIcons.Glyph)

		this.Fort = this.Tree.AddToggle("Forts", false, "Show glyph on forts")
		this.Fort.IconPath = RadarGlyphIcons.Fort

		this.Tower = this.Tree.AddToggle("Towers", true, "Show glyph on towers")
		this.Tower.IconPath = RadarGlyphIcons.Tower

		this.Creep = this.Tree.AddToggle("Creeps", true, "Show glyph on creeps")
		this.Creep.IconPath = RadarGlyphIcons.Creep

		this.Barrack = this.Tree.AddToggle("Barracks", true, "Show glyph on barracks")
		this.Barrack.IconPath = RadarGlyphIcons.Barrack

		this.Group = this.Tree.AddToggle(
			"Group nearby",
			true,
			"One reading over a run of units instead of a number on every one of them"
		)
		this.Group.IconPath = RadarGlyphIcons.Group

		this.Radius = this.Tree.AddSlider(
			"Group radius",
			800,
			200,
			2000,
			0,
			"How far apart two units may stand and still read as one run"
		)
		this.Radius.IconPath = RadarGlyphIcons.Radius
		this.Radius.IsHidden = !this.Group.value
		this.Group.OnValue(call => {
			this.Radius.IsHidden = !call.value
			this.Tree.Update()
		})

		this.Size = this.Tree.AddSlider("Additional size", 2, 0, 20)
		this.Size.IconPath = RadarGlyphIcons.Size
	}

	public MenuChanged(callback: () => void) {
		super.MenuChanged(callback)
		this.Fort.OnValue(() => callback())
		this.Tower.OnValue(() => callback())
		this.Creep.OnValue(() => callback())
		this.Barrack.OnValue(() => callback())
		this.Group.OnValue(() => callback())
	}

	public ResetSettings(): void {
		super.ResetSettings()
		this.Size.value = this.Size.defaultValue
		this.Fort.value = this.Fort.defaultValue
		this.Tower.value = this.Tower.defaultValue
		this.Creep.value = this.Creep.defaultValue
		this.Barrack.value = this.Barrack.defaultValue
		this.Group.value = this.Group.defaultValue
		this.Radius.value = this.Radius.defaultValue
	}
}
