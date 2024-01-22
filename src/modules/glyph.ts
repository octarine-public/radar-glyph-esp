import { Barrack, Fort, Modifier, Unit } from "github.com/octarine-public/wrapper/index"

import { GUI } from "../gui"
import { MenuManager } from "../menu/index"

export class GlyphManager {
	private readonly modifiers: Modifier[] = []
	private readonly modifierName = "modifier_fountain_glyph"

	constructor(private readonly menu: MenuManager) {}

	public Draw(gui: GUI) {
		const menu = this.menu
		if (menu.GCooldown.value) {
			gui.DrawGlyphOnScreen()
		}
		if (!menu.Glyph.State.value) {
			return
		}
		for (let index = this.modifiers.length - 1; index > -1; index--) {
			const modifier = this.modifiers[index],
				owner = modifier.Parent
			if (owner === undefined || !this.stateByMenu(owner)) {
				continue
			}
			gui.DrawGlyphWorld(
				owner.Position,
				modifier.RemainingTime,
				menu.Glyph.Size.value
			)
		}
	}

	public ModifierCreated(modifier: Modifier) {
		if (modifier.Name === this.modifierName) {
			this.modifiers.push(modifier)
		}
	}

	public ModifierRemoved(modifier: Modifier) {
		if (modifier.Name === this.modifierName) {
			this.modifiers.remove(modifier)
		}
	}

	private stateByMenu(owner: Unit) {
		switch (true) {
			case owner.IsCreep:
				return this.menu.Glyph.Creep.value
			case owner.IsTower:
				return this.menu.Glyph.Tower.value
			case owner instanceof Fort:
				return this.menu.Glyph.Fort.value
			case owner instanceof Barrack:
				return this.menu.Glyph.Barrack.value
			default:
				return false
		}
	}
}
