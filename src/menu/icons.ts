import { Paths } from "../paths"

/** Icons of the radar and glyph menu: the page, its sections and the rows inside. */
export const RadarGlyphIcons = {
	/** The page itself: a sweep going round, which is what both readings count down. */
	RadarGlyph: `${Paths.Icons}/radar-glyph.svg`,
	State: Menu.Icons.Power,
	// sections
	Glyph: ImageData.Icons.icon_glyph_on,
	Radar: ImageData.Icons.icon_scan_on,
	// rows
	GlyphCooldown: ImageData.Icons.icon_glyph_on,
	RadarCooldown: ImageData.Icons.icon_scan_on,
	/** The keep behind the walls: the one building the glyph is cast from. */
	Fort: `${Paths.Icons}/fort.svg`,
	Tower: ImageData.Icons.icon_svg_tower,
	Creep: ImageData.Icons.icon_svg_creep,
	/** The shed the lane's creeps come out of. */
	Barrack: `${Paths.Icons}/barracks.svg`,
	Team: Menu.Icons.ListFilter,
	/** Several of a thing stacked into one, which is what the plate does to a wave's readings. */
	Group: Menu.Icons.SquareStack,
	Radius: Menu.Icons.Radius,
	Size: Menu.Icons.Expand
} as const
