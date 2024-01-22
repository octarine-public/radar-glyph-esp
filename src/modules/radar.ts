import {
	Color,
	Fort,
	Fountain,
	GameState,
	MinimapSDK,
	Modifier,
	ParticlesSDK,
	Team,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { ETeamState } from "../enum"
import { GUI } from "../gui"
import { MenuManager } from "../menu/index"

export class RadarManager {
	private readonly fountain: Fort[] = []
	private readonly pSDK = new ParticlesSDK()
	private readonly modifiers: Modifier[] = []
	private readonly modifierName = "modifier_radar_thinker"

	constructor(private readonly menu: MenuManager) {
		this.menu.MenuChanged(() => this.Restart())
	}

	protected get Attached() {
		return this.fountain.find(
			x => !x.IsEnemy() || (GameState.LocalTeam === Team.Observer && x.IsVisible)
		)
	}

	public Draw(gui: GUI) {
		const menu = this.menu
		if (menu.RCooldown.value) {
			gui.DrawRadarOnScreen()
		}
		if (!menu.Radar.State.value) {
			return
		}
		for (let index = this.modifiers.length - 1; index > -1; index--) {
			const modifier = this.modifiers[index],
				owner = modifier.Parent,
				caster = modifier.Caster
			if (
				owner === undefined ||
				caster === undefined ||
				!this.stateByTeam(caster)
			) {
				continue
			}
			gui.DrawRadarWorld(
				caster.Name,
				owner.Position,
				modifier.RemainingTime,
				menu.Radar.Size.value
			)
		}
	}

	public EntityCreated(entity: Fountain) {
		this.fountain.push(entity)
	}

	public EntityDestroyed(entity: Fountain) {
		this.fountain.remove(entity)
	}

	public ModifierCreated(modifier: Modifier) {
		if (modifier.Name === this.modifierName) {
			this.Create(modifier)
		}
	}

	public ModifierRemoved(modifier: Modifier) {
		if (modifier.Name === this.modifierName) {
			this.Destroy(modifier)
		}
	}

	protected Create(modifier: Modifier) {
		this.modifiers.push(modifier)
		this.UpdateRadius(
			this.GetKeyName(modifier),
			modifier.Parent,
			modifier.Caster,
			modifier.Duration
		)
	}

	protected Destroy(modifier: Modifier) {
		this.modifiers.remove(modifier)
		MinimapSDK.DeleteIcon(this.GetKeyName(modifier))
		this.pSDK.DestroyByKey(this.GetKeyName(modifier))
	}

	protected Restart() {
		for (let index = this.modifiers.length - 1; index > -1; index--) {
			const modifier = this.modifiers[index]
			const keyName = this.GetKeyName(modifier)
			this.UpdateRadius(
				keyName,
				modifier.Parent,
				modifier.Caster,
				modifier.Duration
			)
		}
	}

	protected GetKeyName(modifier: Modifier) {
		const caster = modifier.Caster
		if (caster === undefined) {
			console.error("caster is undefined", new Error().stack)
		}
		return modifier.Name + "_" + caster?.Index ?? modifier.Index
	}

	protected UpdateRadius(
		keyName: string,
		thinker: Nullable<Unit>,
		caster?: Unit,
		maxDuration = 10
	) {
		if (thinker === undefined) {
			console.error("because thinker is undefined", new Error().stack)
			return
		}
		const attach = this.Attached
		if (attach === undefined) {
			console.error("because attach is undefined", new Error().stack)
			return
		}
		if (!this.menu.State.value || !this.menu.Radar.State.value) {
			this.pSDK.DestroyByKey(keyName)
			MinimapSDK.DeleteIcon(keyName)
			return
		}
		this.pSDK.DrawCircle(keyName, attach, 900, {
			Color: thinker.IsEnemy() ? Color.Red : Color.Green,
			Position: thinker.Position
		})
		if (caster?.IsEnemy()) {
			MinimapSDK.DrawIcon(
				"ping_teleporting",
				thinker.Position,
				400,
				Color.White,
				maxDuration,
				keyName
			)
		}
	}

	protected stateByTeam(unit: Unit, eTeam = this.menu.Radar.Team.SelectedID) {
		const isEnemy = unit.IsEnemy(),
			stateAlly = eTeam === ETeamState.Ally,
			stateEnemy = eTeam === ETeamState.Enemy
		return (
			!(stateEnemy && !isEnemy) &&
			!(isEnemy && stateAlly && GameState.LocalTeam !== Team.Observer)
		)
	}
}
