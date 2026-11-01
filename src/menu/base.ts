import { RadarGlyphIcons } from "./icons"

export abstract class BaseWorldMenu {
	public readonly Tree: Menu.Node
	public readonly State: Menu.Toggle

	constructor(
		node: Menu.Node,
		nameNode: string,
		tooltip?: string,
		icon?: string,
		iconRound?: number
	) {
		this.Tree = node.AddNode(
			nameNode,
			icon ?? ImageData.Icons.icon_svg_hamburger,
			tooltip,
			iconRound
		)
		this.Tree.SortNodes = false
		// the section's own switch rides the card's header instead of standing in a row
		// of its own: what the whole card does is not one more setting inside it
		this.State = this.Tree.AddToggle("State", true)
		this.State.IconPath = RadarGlyphIcons.State
		this.Tree.HeaderControl = this.State
	}

	public MenuChanged(callback: () => void): void {
		this.State.OnValue(() => callback())
		this.Tree.Update()
	}

	public ResetSettings(): void {
		this.State.value = this.State.defaultValue
		this.Tree.Update()
	}
}
