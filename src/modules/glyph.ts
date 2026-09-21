import { GUI } from "../gui"
import { MenuManager } from "../menu/index"

/**
 * A run of units close enough together to read as one thing — a wave walking a lane, the knot a
 * push makes around a tower — held as a running mean of where its members stand rather than as a
 * list of them: what one reading needs of a group is a point and a number, and both fold in as a
 * unit joins.
 */
class GlyphGroup {
	/** The longest reading folded in: a group keeps its glyph until its last member loses it. */
	public time = 0
	public readonly center = new Vector3()

	private count = 0

	/** Starts the group over at one unit, so the same object serves every frame there is one. */
	public Open(position: Vector3, time: number) {
		this.count = 1
		this.time = time
		this.center.CopyFrom(position)
	}

	public Add(position: Vector3, time: number) {
		this.count++
		// a running mean: the centre is where the group stands now, not where its first member did
		this.center.x += (position.x - this.center.x) / this.count
		this.center.y += (position.y - this.center.y) / this.count
		this.center.z += (position.z - this.center.z) / this.count
		if (time > this.time) {
			this.time = time
		}
	}
}

export class GlyphManager {
	private readonly modifiers: Modifier[] = []
	private readonly modifierName = "modifier_fountain_glyph"
	/** Kept between frames and opened again in place; only the first `live` are this frame's. */
	private readonly groups: GlyphGroup[] = []

	private live = 0

	constructor(private readonly menu: MenuManager) {}

	public Draw(gui: GUI) {
		const menu = this.menu
		if (menu.GCooldown.value) {
			gui.DrawGlyphOnScreen()
		} else {
			gui.HideGlyphOnScreen()
		}
		if (!menu.Glyph.State.value) {
			return
		}
		if (menu.Glyph.Group.value) {
			this.DrawGroups(gui)
		} else {
			this.DrawEach(gui)
		}
	}
	public ModifierCreated(modifier: Modifier) {
		if (this.isValidModifier(modifier)) {
			this.modifiers.push(modifier)
		}
	}
	public ModifierRemoved(modifier: Modifier) {
		if (this.isValidModifier(modifier)) {
			this.modifiers.remove(modifier)
		}
	}
	/** A reading over every unit that has one, which is as many of them as the wave is wide. */
	protected DrawEach(gui: GUI) {
		const size = this.menu.Glyph.Size.value
		for (let i = this.modifiers.length - 1; i > -1; i--) {
			const modifier = this.modifiers[i],
				owner = modifier.Parent
			if (owner === undefined || !this.stateByMenu(owner)) {
				continue
			}
			gui.DrawGlyphWorld(owner.Position, modifier.RemainingTime, size)
		}
	}
	/** One reading over each run of units, where that run stands. */
	protected DrawGroups(gui: GUI) {
		const menu = this.menu.Glyph,
			size = menu.Size.value
		this.Collect(menu.Radius.value)
		for (let i = 0; i < this.live; i++) {
			const group = this.groups[i]
			gui.DrawGlyphWorld(group.center, group.time, size)
		}
	}
	/**
	 * Sorts what is still under the glyph into groups in one pass: a unit joins the first group
	 * whose centre it stands within `radius` of, and opens one of its own where none does. Which
	 * group a unit between two of them lands in follows the order of the walk, and that order only
	 * changes as units gain and lose the glyph — so a wave sorts the same way for as long as it is
	 * one, and the plate over it does not jump from frame to frame.
	 */
	protected Collect(radius: number) {
		const radiusSqr = radius * radius
		this.live = 0
		for (let i = this.modifiers.length - 1; i > -1; i--) {
			const modifier = this.modifiers[i],
				owner = modifier.Parent
			if (owner === undefined || !this.stateByMenu(owner)) {
				continue
			}
			const position = owner.Position,
				time = modifier.RemainingTime
			if (!this.Join(position, time, radiusSqr)) {
				this.Open(position, time)
			}
		}
	}
	/** Folds a unit into the first group it stands close enough to, or says there was none. */
	protected Join(position: Vector3, time: number, radiusSqr: number) {
		for (let i = 0; i < this.live; i++) {
			const group = this.groups[i]
			// flat distance: what stands on the cliff over a wave still reads as part of it
			if (group.center.DistanceSqr2D(position) > radiusSqr) {
				continue
			}
			group.Add(position, time)
			return true
		}
		return false
	}
	/** Opens a group at one unit, taking last frame's object back where there is one to take. */
	protected Open(position: Vector3, time: number) {
		let group = this.groups[this.live]
		if (group === undefined) {
			group = new GlyphGroup()
			this.groups.push(group)
		}
		this.live++
		group.Open(position, time)
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
	private isValidModifier(modifier: Modifier) {
		if (modifier.Name !== this.modifierName) {
			return false
		}
		if (modifier.AuraOwner instanceof npc_dota_unit_roshans_banner) {
			return false
		}
		return true
	}
}
