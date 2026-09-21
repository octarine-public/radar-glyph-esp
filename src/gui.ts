import { canvas } from "../render"

/**
 * The game's own glyph and scan buttons, as `hud_reborn.vcss_c` and `dota_hud_radar_button.vcss_c`
 * lay them out: 44×44 icons inset 24 from the outer edge of a 74-wide strip beside the minimap,
 * the glyph 6 up from the bottom and the scan directly above it. Panorama units at 1080p, and the
 * SDK hands those boxes back already scaled — so everything measured off them goes through `unit`,
 * the scale one panorama unit stands at right now.
 */
const ICON = 44
/**
 * The box the enemy's countdown is centred in, hung off the button's outer edge. Nothing is drawn
 * in it — the reading stands on the strip's own dark backing and on the world past it, carrying
 * only its rim — so what the box sets is where the run's middle lands, and its height is the line
 * the run is centred on. The height is the game's `#ChargeCount` disc, so the two readings on the
 * scan button sit on one measure.
 */
const TIMER_W = 42
const TIMER_H = 20
/** What the box keeps from the button it belongs to, on the side away from the minimap. */
const TIMER_GAP = 2
const TIMER_INK = "#ffffff"
const TIMER_TEXT = 14
/**
 * The game's `#ChargeCount`: a 20-wide disc hung in a corner of the button, 2 off the edge. Its
 * own sits bottom-right, so the enemy's takes the opposite corner and the two never meet.
 *
 * The game fills it `gradient( linear, 0% 0%, 0% 100%, from( #444 ), to( black ) )`. The shader
 * that carves a smooth edge fills flat, so the disc is set at the middle of that run — at 20 wide
 * the shading is worth less than the stepped edge a rasterized corner leaves.
 */
const BADGE = 20
const BADGE_DROP = 2
const BADGE_TEXT = 13
const BADGE_INK = "#222222ff"
/**
 * What the game draws its charge count in, sampled off the disc itself: a cool grey, and flat —
 * the number carries neither rim nor shade there, because the disc behind it is doing that work.
 */
const BADGE_TEXT_INK = "#b1bdc3"
const NO_EFFECT = "none"
/**
 * `text-shadow: 0px 0px 3px 3.7 #000000` under the game's own readouts at this size: a 3-wide blur
 * drawn nearly four times over, which is as good as a solid rim. Here that is a 1-wide rim with a
 * 3-wide fade around it. The game never sets a reading on the world without one this heavy, and
 * with nothing behind the countdown this is the whole of what holds it off the grass.
 */
const TIMER_SHADOW = "glow(1px 3px 0px 0px #000000)"
/**
 * How far the quad is grown around a carved shape on every side, so the shader's antialiased edge
 * falls inside the geometry instead of on its boundary, where it would be clipped back to a hard
 * one. A `border-radius` rasterizes on the pixel grid and shows its steps at this size; the shader
 * carries per-pixel coverage instead. A reading with nothing carved behind it is laid out in the
 * same grown box, which leaves its middle — and so the run centred on it — exactly where it was.
 */
const INSET = 1
/** How long a reading takes to fade once what it was counting is gone, in seconds. */
const FADE = 0.25
/**
 * The chip the glyph's reading wears in the world, in dp at the slider's own setting: the game's
 * glyph icon, the time left beside it, and under both a plate barely washed in the glyph's colour
 * and rimmed by a hairline of it. The same dress `ward-tracker` puts a ward's reading in, and for
 * the same reason — what the chip has to say is said by the icon, so the number beside it can be
 * small, and a plate this faint groups the two without standing between the wave and the eye.
 */
const CHIP_HEIGHT = 20
const CHIP_RADIUS = 6
const CHIP_PAD = 5
const CHIP_GAP = 4
const CHIP_ICON = 15
const CHIP_FONT = 12
const CHIP_BORDER = 1
/** How deep the plate and its rim are washed in the colour, out of 255. */
const CHIP_TINT = 36
const CHIP_EDGE = 107
/**
 * How dark the outline under the reading is cut, 0 to 1. The plate is too faint to hold a number
 * off a lit creep by itself, and the run carries the rest — enough to stand on anything it lands
 * on, short of the black rim that would make the chip a label rather than a wash.
 */
const CHIP_OUTLINE = 0.5
/** The slider notch the chip is drawn 1:1 at, and how many notches away from it double its size. */
const CHIP_BASE = 2
const CHIP_STEP = 12
/**
 * The light blue the game lights its glyph button and its shield in, which is the one colour the
 * reading is already known by. `HudColors.readable` relights it for whichever theme the menu
 * wears, so a chip over a bright river reads the same as one over the trees.
 */
const CHIP_COLOR = new Color(91, 199, 255)
/**
 * The chip is measured off a stand-in of the same shape rather than off the reading itself: the
 * face's digits are not one width, so a chip measured off `1.4` steps in and out again as the tick
 * turns it into `1.3`, under a group that has not moved. A zero is the widest of the ten.
 */
const CHIP_DIGIT = /\d/g
/**
 * What the count over a scan is set in, taken from the portal timer `teleport-esp` hangs over a
 * teleport rather than invented again here: the canvas's circular timer writes its reading at 0.35
 * of the icon it stands on and cuts it at 700, and a scan standing in the same world at the same
 * distance reads as the same kind of thing. White and outlined the canvas already gives a run by
 * default, which is what the timer takes as well — so only the measure and the cut are named here.
 */
const SCAN_TEXT_SCALE = 0.35
const SCAN_TEXT_WEIGHT = 700
/**
 * How long a scan takes to come in once it is cast, and how long it takes to fade out once it is
 * over. Going is the longer of the two: a scan that has run out is worth a beat, where one
 * arriving should simply be there.
 */
const SCAN_ENTER_MS = MenuSDK.Duration.Fade
const SCAN_EXIT_MS = MenuSDK.Duration.Reveal
/**
 * How far the scan's icon reaches from the point it stands on before the slider adds to it, in dp,
 * and the least it may reach however far the slider is pulled back.
 */
const SCAN_REACH = 20
const SCAN_REACH_MIN = 10
/**
 * The face the game sets its numeric readouts in, taken from its own install rather than shipped
 * again: `font-family: monospaceNumbersFont` is RadianceM, whose ten digits are all one width.
 * Radiance's own are not — its 0 runs a tenth of an em wider than its 1 — and a centred `m:ss`
 * shuffled sideways on every tick that changed a digit's width. Here every reading measures the
 * same however it reads: 27px at this size against Radiance's 25 to 28.
 *
 * The face carries those ten digits and nothing else, so the colon comes from the menu's own
 * fallback — two dots of a width that never moves either, which is all the run needs of it.
 */
const FONT_FAMILY = "RadianceM"
const FONT_FILE = "panorama/fonts/radiancem-bold.otf"
const FONT_WEIGHT = 700

/**
 * One reading on the strip: the element it was handed and how much of it is still here. A reading
 * arrives the moment it has something to say and leaves by fading — a number that blinks out pulls
 * the eye to the corner it left, which is the one place nothing is happening any more.
 */
class Readout {
	public element: Nullable<HTMLElement>

	private alpha = 0
	private last = 0

	public readonly Attach = (element: Nullable<HTMLElement | null>) => {
		this.element = element ?? undefined
	}

	/** How strongly to draw right now: whole while `live`, easing to nothing once it is not. */
	public Step(live: boolean) {
		const now = hrtime() / 1000
		// a first frame, or one after a stall, would jump the run: it is worth a whole step at most
		const delta = this.last === 0 ? 0 : Math.min(Math.max(now - this.last, 0), FADE)
		this.last = now
		this.alpha = live ? 1 : Math.max(this.alpha - delta / FADE, 0)
		return this.alpha
	}

	/** Off the screen at once, for a reading taken away rather than one that ran out. */
	public Hide() {
		this.alpha = 0
		this.last = 0
		if (this.element !== undefined) {
			MenuSDK.WriteShown(this.element, false)
		}
	}
}

/**
 * How much of a scan stands this frame, 0 to 1: it eases to 1 as the scan arrives and back to 0
 * once it is over, and everything the group is drawn in is inked at that much of full strength.
 * Turning around midway carries on from where the value stood, so a scan cast again on a spot one
 * just left picks up where that one had got to rather than blinking.
 */
class Presence {
	private value = 0
	private from = 0
	private target = 0
	private since = -1

	public To(target: number, now: number) {
		if (target === this.target) {
			return
		}
		this.from = this.value
		this.target = target
		this.since = now
	}

	public Tick(now: number) {
		if (this.value === this.target) {
			return this.value
		}
		const rising = this.target > this.from,
			span = (rising ? SCAN_ENTER_MS : SCAN_EXIT_MS) / MenuSDK.AnimationSpeed(),
			at = Math.min((now - this.since) / span, 1)
		this.value =
			at >= 1
				? this.target
				: this.from +
					(this.target - this.from) *
						MenuSDK.EaseValue(
							rising ? MenuSDK.Ease.Out : MenuSDK.Ease.Standard,
							at
						)
		return this.value
	}
}

/**
 * One scan standing in the world. It outlives the modifier it was drawn from — that is what it
 * takes to fade out after the scan is over — so it holds everything the last frame it was live
 * reported: where it stood, how long it had left, who cast it, and how big the slider wanted it.
 */
class ScanView {
	public readonly life = new Presence()
	public readonly position = new Vector3()

	public casterName = ""
	public time = 0
	public size = 0
	/** Whether the scan this was drawn from was still running this frame. */
	public seen = false

	constructor(public readonly Key: string) {}
}

export class GUI {
	private readonly scanCooldown = new Readout()
	private readonly scanCharges = new Readout()
	private readonly glyphCooldown = new Readout()

	/** The game's face, or nothing where the host cannot load it and the theme's own serves. */
	private readonly family = loadFont()

	/** Every scan in the world: the ones a modifier still reports, and the ones on their way out. */
	private readonly scans: ScanView[] = []
	/**
	 * What a scan is drawn out of, struck once and refilled per scan the way the chip's own is.
	 * One ink serves the icon, the portrait and both runs, so the whole group thins together
	 * instead of each piece of it keeping its own account of how far along the dissolve is.
	 */
	private readonly scanInk = new Color(255, 255, 255)
	private readonly scanPos = new Vector2()
	private readonly scanSize = new Vector2()
	private readonly scanBox = new Rectangle()
	private readonly scanTint: { color: Color } = { color: this.scanInk }
	private readonly scanText: { color: Color; size: number; weight: number } = {
		color: this.scanInk,
		size: 0,
		weight: SCAN_TEXT_WEIGHT
	}

	/**
	 * What a chip is drawn out of, struck once and refilled every time one is: a chip over every
	 * group of every frame would otherwise mint a colour and a vector apiece for nothing.
	 */
	private readonly chipFill = new Color()
	private readonly chipEdge = new Color()
	private readonly chipInk = new Color()
	private readonly chipPos = new Vector2()
	private readonly chipSize = new Vector2()
	private readonly chipBox = new Rectangle()
	private readonly chipPlate: {
		color: Color
		borderColor: Color
		borderWidth: number
		radius: number
	} = {
		color: this.chipFill,
		borderColor: this.chipEdge,
		borderWidth: CHIP_BORDER,
		radius: CHIP_RADIUS
	}
	private readonly chipText: {
		color: Color
		size: number
		weight: number
		effect: MenuSDK.EHudTextEffect
		effectOpacity: number
	} = {
		color: this.chipInk,
		size: CHIP_FONT,
		weight: MenuSDK.HudBold,
		effect: MenuSDK.EHudTextEffect.Outline,
		effectOpacity: CHIP_OUTLINE
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
		this.scanCooldown.Hide()
		this.scanCharges.Hide()
	}

	public HideGlyphOnScreen() {
		this.glyphCooldown.Hide()
	}

	/**
	 * The glyph's reading on the world, over one unit or over the middle of a run of them: the
	 * game's own glyph icon and the time left, laid out side by side on the chip they share.
	 */
	public DrawGlyphWorld(origin: Vector3, time: number, menuSize: number) {
		const w2s = RendererSDK.WorldToScreen(origin)
		if (w2s === undefined || GUIInfo.Contains(w2s)) {
			return
		}
		// every notch of the slider is a twelfth of the chip either way, about its own setting
		const scale = 1 + (menuSize - CHIP_BASE) / CHIP_STEP,
			height = Math.round(GUIInfo.ScaleHeight(CHIP_HEIGHT * scale)),
			icon = Math.round(GUIInfo.ScaleHeight(CHIP_ICON * scale)),
			pad = GUIInfo.ScaleHeight(CHIP_PAD * scale),
			gap = GUIInfo.ScaleHeight(CHIP_GAP * scale)
		this.chipText.size = GUIInfo.ScaleHeight(CHIP_FONT * scale)
		this.chipPlate.radius = GUIInfo.ScaleHeight(CHIP_RADIUS * scale)
		this.chipPlate.borderWidth = GUIInfo.ScaleHeight(CHIP_BORDER)

		const text = time.toFixed(time < 10 ? 1 : 0),
			run = Math.round(
				MenuSDK.TextSize(text.replace(CHIP_DIGIT, "0"), this.chipText).x
			),
			width = Math.round(pad + icon + gap + run + pad),
			left = Math.round(w2s.x - width / 2),
			top = Math.round(w2s.y - height / 2)

		const tint = MenuSDK.HudColors.readable(CHIP_COLOR)
		this.chipFill.CopyFrom(tint).SetA(CHIP_TINT)
		this.chipEdge.CopyFrom(tint).SetA(CHIP_EDGE)
		this.chipInk.CopyFrom(tint)

		this.chipPos.SetVector(left, top)
		this.chipSize.SetVector(width, height)
		canvas.Rect(this.chipPos, this.chipSize, this.chipPlate)

		const cursor = Math.round(left + pad)
		this.chipPos.SetVector(cursor, Math.round(top + (height - icon) / 2))
		this.chipSize.SetVector(icon, icon)
		canvas.Image(ImageData.Icons.icon_glyph_on, this.chipPos, this.chipSize)

		const runLeft = Math.round(cursor + icon + gap)
		this.chipBox.pos1.SetVector(runLeft, top)
		this.chipBox.pos2.SetVector(runLeft + run, top + height)
		canvas.TextIn(text, this.chipBox, this.chipText)
	}

	/**
	 * A scan reporting itself for this frame: where it stands, how long it has left and who cast it.
	 * Nothing is painted here — what stands in the world is settled once every scan has reported, in
	 * {@link GUI.EndRadarWorld}, so a scan that has just stopped reporting can still be drawn on its
	 * way out.
	 */
	public DrawRadarWorld(
		key: string,
		casterName: string,
		origin: Vector3,
		time: number,
		menuSize: number
	) {
		const view = this.ScanOf(key)
		view.position.CopyFrom(origin)
		view.casterName = casterName
		view.time = time
		view.size = menuSize
		view.seen = true
	}

	/**
	 * Draws every scan the frame knows of: the ones that reported at their full strength, the rest
	 * on their way out. One that has faded to nothing is forgotten.
	 */
	public EndRadarWorld() {
		const now = hrtime()
		for (let index = 0; index < this.scans.length; index++) {
			const view = this.scans[index]
			view.life.To(view.seen ? 1 : 0, now)
			const presence = view.life.Tick(now)
			if (!view.seen && presence <= 0) {
				this.scans.splice(index--, 1)
				continue
			}
			view.seen = false
			this.DrawScan(view, presence)
		}
	}

	/** Takes every scan down at once, for a state that has no world to stand one in. */
	public ResetRadarWorld() {
		this.scans.length = 0
	}

	/**
	 * One scan in the world at `presence` of its full strength: the game's scan icon over the spot,
	 * the portrait of whoever cast it on the icon's top edge, and the time left over the middle.
	 * Nothing about it moves as it comes and goes — every piece of it is simply inked at `presence`,
	 * so the group thins onto the map and back off it while standing exactly where the scan is.
	 */
	private DrawScan(view: ScanView, presence: number) {
		const w2s = RendererSDK.WorldToScreen(view.position)
		if (w2s === undefined || GUIInfo.Contains(w2s)) {
			return
		}
		const reach = Math.max(view.size + SCAN_REACH, SCAN_REACH_MIN),
			halfWidth = GUIInfo.ScaleWidth(reach),
			halfHeight = GUIInfo.ScaleHeight(reach),
			left = Math.round(w2s.x - halfWidth),
			top = Math.round(w2s.y - halfHeight),
			width = Math.round(halfWidth * 2),
			height = Math.round(halfHeight * 2)

		this.scanInk.SetA(Math.round(255 * presence))

		this.scanPos.SetVector(left, top)
		this.scanSize.SetVector(width, height)
		canvas.Image(
			ImageData.Icons.icon_scan_on,
			this.scanPos,
			this.scanSize,
			this.scanTint
		)

		// the portrait takes a quarter of the icon's box, centred on its top edge
		this.scanPos.SetVector(Math.round(left + width / 4), Math.round(top - height / 4))
		this.scanSize.SetVector(Math.round(width / 2), Math.round(height / 2))
		canvas.Image(
			ImageData.GetHeroTexture(view.casterName, true),
			this.scanPos,
			this.scanSize,
			this.scanTint
		)

		// the count, laid out the way the portal timer lays out its own: a fraction of the icon
		// it stands on, cut heavy, and carrying the outline the canvas puts under any run it is
		// not told to leave bare. Its ink is the group's, so it thins with everything around it
		this.scanBox.pos1.SetVector(left, top)
		this.scanBox.pos2.SetVector(left + width, top + height)
		this.scanText.size = Math.round(height * SCAN_TEXT_SCALE)
		canvas.TextIn(
			view.time.toFixed(view.time < 10 ? 1 : 0),
			this.scanBox,
			this.scanText
		)
	}

	/** The scan `key` stands on, opened the first frame it reports. */
	private ScanOf(key: string) {
		for (const known of this.scans) {
			if (known.Key === key) {
				return known
			}
		}
		const view = new ScanView(key)
		this.scans.push(view)
		return view
	}

	/**
	 * The enemy's countdown, set off the button's outer edge — the side the minimap is not on, where
	 * the strip's own dark backing runs on for another 24 and carries most of the run. The game's
	 * cover takes the middle of the button, so the two readings never stand on each other.
	 */
	protected WriteCooldown(readout: Readout, rect: Rectangle, time: number) {
		const element = readout.element,
			alpha = readout.Step(time > 0)
		if (element === undefined || alpha <= 0) {
			if (element !== undefined) {
				MenuSDK.WriteShown(element, false)
			}
			return
		}
		const unit = rect.Height / ICON,
			width = Math.round(TIMER_W * unit),
			height = Math.round(TIMER_H * unit),
			gap = Math.round(TIMER_GAP * unit)
		this.WriteBox(
			element,
			GUIInfo.HUDFlipped
				? Math.round(rect.x) - gap - width
				: Math.round(rect.pos2.x) + gap,
			Math.round(rect.y + (rect.Height - height) / 2),
			width,
			height,
			Math.round(TIMER_TEXT * unit),
			alpha
		)
		// the run holds what it last said while it fades: nothing counts down to nothing
		if (time > 0 && MenuSDK.MarkValue(element, "m:time", Math.ceil(time))) {
			MenuSDK.WriteText(element, Math.formatTime(time))
		}
	}

	/** The enemy's scan charges, in the corner of the button the game leaves its own badge out of. */
	protected WriteCharges(readout: Readout, rect: Rectangle, charges: number) {
		const element = readout.element,
			alpha = readout.Step(charges > 0)
		if (element === undefined || alpha <= 0) {
			if (element !== undefined) {
				MenuSDK.WriteShown(element, false)
			}
			return
		}
		const unit = rect.Height / ICON,
			size = Math.round(BADGE * unit)
		this.WriteBox(
			element,
			GUIInfo.HUDFlipped ? Math.round(rect.pos2.x) - size : Math.round(rect.x),
			Math.round(rect.y + BADGE_DROP * unit),
			size,
			size,
			Math.round(BADGE_TEXT * unit),
			alpha
		)
		if (charges > 0 && MenuSDK.MarkValue(element, "m:charges", charges)) {
			MenuSDK.WriteText(element, charges.toFixed())
		}
	}

	/**
	 * Lays a reading out. The box is what it was asked for grown by {@link INSET} on every side — the
	 * room a carved shape's edge needs — so it is placed that much further out and the shape lands
	 * exactly where it was meant to; the line box grows with it and holds the run in the middle
	 * either way, which is all a reading with nothing carved behind it asks of the box at all.
	 */
	protected WriteBox(
		element: HTMLElement,
		left: number,
		top: number,
		width: number,
		height: number,
		fontSize: number,
		alpha: number
	) {
		MenuSDK.WritePx(element, "left", left - INSET)
		MenuSDK.WritePx(element, "top", top - INSET)
		MenuSDK.WritePx(element, "width", width + INSET * 2)
		MenuSDK.WritePx(element, "height", height + INSET * 2)
		MenuSDK.WritePx(element, "line-height", height + INSET * 2)
		MenuSDK.WritePx(element, "font-size", fontSize)
		MenuSDK.WriteFmt(element, "opacity", Math.round(alpha * 100) / 100, "")
		MenuSDK.WriteShown(element, true, "block")
	}

	private RenderCooldowns(): React.ReactNode {
		return React.createElement(
			React.Fragment,
			null,
			this.HudReadout(this.scanCooldown.Attach, TIMER_INK, TIMER_SHADOW),
			this.HudReadout(
				this.scanCharges.Attach,
				BADGE_TEXT_INK,
				NO_EFFECT,
				BADGE_INK
			),
			this.HudReadout(this.glyphCooldown.Attach, TIMER_INK, TIMER_SHADOW)
		)
	}

	/**
	 * A reading on the strip, set in the game's face. Given a `fill` it stands on a disc the shader
	 * carves, whose corners collapse to half the box however wide it is drawn and whose edge the
	 * pixel grid never steps — the badge, as the game hangs its own. Given none it is set bare, and
	 * carries nothing behind it but its own rim.
	 */
	private HudReadout(
		ref: React.RefCallback<HTMLElement>,
		ink: string,
		effect: string,
		fill?: string
	): React.ReactElement {
		return React.createElement("div", {
			ref,
			style: {
				...(fill !== undefined ? MenuSDK.SdfCircle(fill, 0, "", INSET) : {}),
				position: "absolute",
				display: "block",
				visibility: "hidden",
				color: ink,
				fontFamily: this.family,
				fontWeight: FONT_WEIGHT,
				fontEffect: effect,
				textAlign: "center",
				whiteSpace: "nowrap",
				pointerEvents: "none"
			}
		})
	}
}

/** The game's own face, or nothing where the host cannot load it and the theme's serves. */
function loadFont(): Nullable<string> {
	return typeof LoadFont === "function" && LoadFont(FONT_FILE, false, FONT_WEIGHT)
		? FONT_FAMILY
		: undefined
}
