
export class GUI {
	private scanCooldown: Nullable<HTMLElement>
	private scanCharges: Nullable<HTMLElement>
	private glyphCooldown: Nullable<HTMLElement>

	private readonly attachScanCooldown = (element: Nullable<HTMLElement | null>) => {
		this.scanCooldown = element ?? undefined
	}

	private readonly attachScanCharges = (element: Nullable<HTMLElement | null>) => {
		this.scanCharges = element ?? undefined
	}

	private readonly attachGlyphCooldown = (element: Nullable<HTMLElement | null>) => {
		this.glyphCooldown = element ?? undefined
	}

	constructor() {
		MenuSDK.RegisterPanel(
			"scan-glyph-cooldowns",
			() => this.RenderCooldowns(),
			MenuSDK.EPanelLayer.Screen
		)
	}

	public DrawRadarOnScreen() {
		const rules = Dota2SDK.GameRules,
			team = Dota2SDK.LocalPlayer?.Hero?.Team
		if (rules === undefined || team === undefined || !GameState.CanDrawOverlays) {
			this.HideRadarOnScreen()
			return
		}
		const isRadiant = team === Team.Radiant
		this.WriteCooldown(
			this.scanCooldown,
			GUIInfo.Minimap.Scan,
			isRadiant ? rules.ScanCooldownDire : rules.ScanCooldownRadiant
		)
		this.WriteCharges(
			this.scanCharges,
			GUIInfo.Minimap.Scan,
			isRadiant ? rules.ScanChargesDire : rules.ScanChargesRadiant
		)
	}

	public DrawGlyphOnScreen() {
		const rules = Dota2SDK.GameRules,
			team = Dota2SDK.LocalPlayer?.Hero?.Team
		if (rules === undefined || team === undefined || !GameState.CanDrawOverlays) {
			this.HideGlyphOnScreen()
			return
		}
		this.WriteCooldown(
			this.glyphCooldown,
			GUIInfo.Minimap.Glyph,
			team === Team.Radiant ? rules.GlyphCooldownDire : rules.GlyphCooldownRadiant
		)
	}

	public HideOnScreen() {
		this.HideRadarOnScreen()
		this.HideGlyphOnScreen()
	}

	public HideRadarOnScreen() {
		this.HideLabel(this.scanCooldown)
		this.HideLabel(this.scanCharges)
	}

	public HideGlyphOnScreen() {
		this.HideLabel(this.glyphCooldown)
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

		RendererSDK.Image(ImageData.Icons.icon_scan_on, position.pos1, -1, position.Size)

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

	protected WriteCooldown(
		element: Nullable<HTMLElement>,
		rect: Rectangle,
		time: number
	) {
		if (element === undefined) {
			return
		}
		if (time <= 0) {
			MenuSDK.WriteShown(element, false)
			return
		}
		const width = rect.Width - 5.5,
			height = rect.Height - 5.5,
			left = rect.x + 2.5 + (GUIInfo.HUDFlipped ? -width : width)
		MenuSDK.WritePx(element, "left", Math.round(left))
		MenuSDK.WritePx(element, "top", Math.round(rect.y + 2.5))
		MenuSDK.WritePx(element, "width", Math.round(width))
		MenuSDK.WritePx(element, "line-height", Math.round(height))
		MenuSDK.WritePx(element, "font-size", Math.round(height / 3 + 4))
		if (MenuSDK.MarkValue(element, "m:time", Math.ceil(time))) {
			MenuSDK.WriteText(element, Math.formatTime(time))
		}
		MenuSDK.WriteShown(element, true, "block")
	}

	protected WriteCharges(
		element: Nullable<HTMLElement>,
		rect: Rectangle,
		charges: number
	) {
		if (element === undefined) {
			return
		}
		if (!charges) {
			MenuSDK.WriteShown(element, false)
			return
		}
		MenuSDK.WritePx(element, "left", Math.round(rect.x + 2.5))
		MenuSDK.WritePx(element, "top", Math.round(rect.y + 2.5))
		MenuSDK.WritePx(element, "font-size", Math.round((rect.Height - 5.5) / 3 + 4))
		if (MenuSDK.MarkValue(element, "m:charges", charges)) {
			MenuSDK.WriteText(element, charges.toFixed())
		}
		MenuSDK.WriteShown(element, true, "block")
	}

	protected HideLabel(element: Nullable<HTMLElement>) {
		if (element !== undefined) {
			MenuSDK.WriteShown(element, false)
		}
	}

	private RenderCooldowns(): React.ReactNode {
		return React.createElement(
			React.Fragment,
			null,
			this.HudLabel(this.attachScanCooldown, "center"),
			this.HudLabel(this.attachScanCharges, "left"),
			this.HudLabel(this.attachGlyphCooldown, "center")
		)
	}

	private HudLabel(
		ref: React.RefCallback<HTMLElement>,
		textAlign: "center" | "left"
	): React.ReactElement {
		return React.createElement("div", {
			ref,
			style: {
				position: "absolute",
				display: "block",
				visibility: "hidden",
				color: MenuSDK.Tokens.TextBright,
				fontWeight: 500,
				fontEffect: "outline(1px #000000)",
				textAlign,
				whiteSpace: "nowrap",
				pointerEvents: "none"
			}
		})
	}
}
