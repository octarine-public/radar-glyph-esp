import { ETeamState, TeamNames } from "../enum"

/** The node the page stood under before it came out on its own. */
const OLD_PARENT = "Maphack"

/** The options the team row listed while it was a dropdown, under the index each one saved. */
const storedOptions: readonly string[] = ["Allies and enemy", "Only enemy", "Only allies"]

/** The sides each of those options stood for, which is what the ticks now hold. */
const storedTeams: readonly ETeamState[][] = [
	[ETeamState.Enemies, ETeamState.Allies],
	[ETeamState.Enemies],
	[ETeamState.Allies]
]

/** The rows a stored config keeps under a node, or nothing when the value is not a node. */
export function StoredNode(value: unknown): Nullable<MenuSDK.ConfigObject> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
		? (value as MenuSDK.ConfigObject)
		: undefined
}

/**
 * Carries the page's rows out of the node they used to stand under and over to its parent, where
 * the page stands now. Idempotent, as a config migration must be: a config already holding the
 * page at its new place keeps what it has there, and the old key goes either way.
 * @returns the rows at their new place, for a menu built after the config landed.
 */
export function CarryOverPage(
	parent: Nullable<MenuSDK.ConfigObject>,
	name: string
): Nullable<MenuSDK.ConfigObject> {
	if (parent === undefined) {
		return undefined
	}
	const existing = parent[name]
	if (existing !== undefined && StoredNode(existing) === undefined) {
		return undefined
	}
	const oldParent = StoredNode(parent[OLD_PARENT])
	const saved = StoredNode(oldParent?.[name])
	if (oldParent !== undefined && saved !== undefined) {
		parent[name] ??= saved
		delete oldParent[name]
	}
	return StoredNode(parent[name])
}

/**
 * Turns the team row of a node saved as a dropdown index into the ticks the multiselect now in
 * its place stores, its hotkeys and logic rules along with it — each of those held the name of
 * one option and now holds the names of the sides it stood for. A row already saved as ticks is
 * left as it is, and so is one saved on an index the dropdown never had: it falls back to the
 * row's own default, which is both sides.
 */
export function MigrateTeamRow(node: Nullable<MenuSDK.ConfigObject>): void {
	if (node === undefined) {
		return
	}
	const holder = StoredNode(node.Team)
	const value = holder === undefined ? node.Team : holder.v
	if (typeof value !== "number" || storedTeams[value] === undefined) {
		return
	}
	if (holder === undefined) {
		node.Team = teamTicks(value)
		return
	}
	holder.v = teamTicks(value)
	for (const key of ["hotkeys", "logic"]) {
		const drivers = holder[key]
		if (!Array.isArray(drivers)) {
			continue
		}
		for (const driver of drivers) {
			const record = StoredNode(driver)
			const option = record?.value
			if (record === undefined || typeof option !== "string") {
				continue
			}
			const sides = storedTeams[storedOptions.indexOf(option)] ?? []
			record.value = sides.map(team => TeamNames[team])
		}
	}
}

/** The ticks a multiselect stores for the option the dropdown was left on. */
function teamTicks(index: number): [string, boolean][] {
	const selected = storedTeams[index]
	return TeamNames.map((name, team): [string, boolean] => [
		name,
		selected.includes(team)
	])
}
