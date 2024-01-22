import { ImageData, Menu } from "github.com/octarine-public/wrapper/index"

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
			icon ?? ImageData.Paths.Icons.icon_svg_hamburger,
			tooltip,
			iconRound
		)
		this.Tree.SortNodes = false
		this.State = this.Tree.AddToggle("State", true)
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
