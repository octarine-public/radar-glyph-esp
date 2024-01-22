import {
	Color,
	GameRules,
	GUIInfo,
	ImageData,
	LocalPlayer,
	MathSDK,
	Menu,
	Rectangle,
	RendererSDK,
	Team,
	TextFlags,
	Vector3
} from "github.com/octarine-public/wrapper/index"

export class GUI {
	public DrawRadarOnScreen() {
		const localHero = LocalPlayer?.Hero
		if (GameRules === undefined || localHero === undefined) {
			return
		}
		const maxCooldown = 210,
			direCooldown = GameRules.ScanCooldownDire,
			radiantCooldown = GameRules.ScanCooldownRadiant,
			direCharges = GameRules.ScanChargesDire,
			radiantCharges = GameRules.ScanChargesDire

		this.DrawCooldownOnScreen(
			GUIInfo.Minimap.Scan,
			localHero.Team,
			direCooldown,
			radiantCooldown,
			maxCooldown,
			direCharges,
			radiantCharges
		)
	}

	public DrawGlyphOnScreen() {
		const localHero = LocalPlayer?.Hero
		if (GameRules === undefined || localHero === undefined) {
			return
		}
		const maxCooldown = 300,
			direCooldown = GameRules.GlyphCooldownDire,
			radiantCooldown = GameRules.GlyphCooldownRadiant

		this.DrawCooldownOnScreen(
			GUIInfo.Minimap.Glyph,
			localHero.Team,
			direCooldown,
			radiantCooldown,
			maxCooldown
		)
	}

	public DrawGlyphWorld(origin: Vector3, time: number, menuSize: number) {
		const position = this.GetW2SPosition(origin, menuSize)
		if (position !== undefined) {
			this.Text(time, position)
		}
	}

	public DrawRadarWorld(
		casterName: string,
		origin: Vector3,
		time: number,
		menuSize: number
	) {
		const position = this.GetW2SPosition(origin, menuSize + 10)
		if (position === undefined) {
			return
		}

		RendererSDK.Image(
			ImageData.Paths.Icons.icon_scan_on,
			position.pos1,
			-1,
			position.Size
		)

		const iconPosition = position.Clone(),
			iconName = ImageData.GetHeroTexture(casterName, true)
		iconPosition.Width /= 2
		iconPosition.Height /= 2
		iconPosition.AddX(iconPosition.Width / 2)
		iconPosition.SubtractY(iconPosition.Height / 2)
		RendererSDK.Image(iconName, iconPosition.pos1, -1, iconPosition.Size)

		// remening time
		this.Text(time, position, 3)

		const infoPosition = position.Clone()
		infoPosition.AddY(position.Height)
		this.Text(Menu.Localization.Localize("Scanning territory..."), infoPosition, 3.75)
	}

	protected GetW2SPosition(origin: Vector3, menuSize: number) {
		const w2s = RendererSDK.WorldToScreen(origin)
		if (w2s === undefined || GUIInfo.Contains(w2s)) {
			return undefined
		}
		const mSize = Math.max(menuSize + 10, 10)
		const scaleSize = GUIInfo.ScaleVector(mSize, mSize)
		const position = new Rectangle(w2s.Subtract(scaleSize), w2s.Add(scaleSize))
		return position
	}

	protected Text(
		text: number | string,
		position: Rectangle,
		division: number = 2,
		width = 400,
		flags = TextFlags.Center
	) {
		if (typeof text === "number") {
			text = text.toFixed(text < 10 ? 1 : 0)
		}
		RendererSDK.TextByFlags(text, position, Color.White, division, flags, width)
	}

	protected DrawCooldownOnScreen(
		pos: Rectangle,
		team: Team,
		direTime: number,
		radiantTime: number,
		maxCooldown: number,
		direCharges: number = 0,
		radiantCharges: number = 0
	) {
		const position = pos.Clone()

		position.pos1.AddScalarForThis(5 / 2)
		position.pos2.SubtractScalarForThis(3)

		const time = team !== Team.Radiant ? radiantTime : direTime,
			charge = team !== Team.Radiant ? radiantCharges : direCharges

		const remaining = this.GetRatio(time, maxCooldown),
			color = remaining > 0 ? Color.Red.SetA(200) : Color.Green.SetA(200)

		RendererSDK.Arc(
			-90,
			remaining > 0 ? remaining : 100,
			position.pos1,
			position.Size,
			false,
			GUIInfo.ScaleWidth(6),
			color
		)

		if (remaining !== 0) {
			this.Text(MathSDK.FormatTime(time), position, 3, 500)
		}

		if (!charge) {
			return
		}

		this.Text(charge.toFixed(), position, 3, 500, TextFlags.Top | TextFlags.Left)
	}

	protected GetRatio(time: number, maxTime: number) {
		return Math.max(100 * (time / maxTime), 0)
	}
}
