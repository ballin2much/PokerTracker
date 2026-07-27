import type PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';
import type { Scenario } from '$lib/trainer/types';
import { parseActionMap, type ActionMap, type RangeOverride } from '$lib/trainer/strategy';

export type StrategyPackRecord = RecordModel & {
	name: string;
	version: number;
	description: string;
	published: boolean;
	owner: string;
	configuration: Record<string, unknown>;
};

type PreflopRangeRecord = RecordModel & {
	pack: string;
	spot_key: string;
	label: string;
	spot_type: string;
	hero: string;
	villain: string;
	pot: string;
	raise_label: string;
	actions: unknown;
	enabled: boolean;
};

async function findUserPack(pb: PocketBase, userId: string) {
	try {
		return await pb
			.collection<StrategyPackRecord>('strategy_packs')
			.getFirstListItem(pb.filter('owner = {:owner}', { owner: userId }));
	} catch {
		return null;
	}
}

export async function loadUserStrategy(
	pb: PocketBase,
	userId: string
): Promise<{
	pack: StrategyPackRecord | null;
	overrides: RangeOverride[];
}> {
	const pack = await findUserPack(pb, userId);
	if (!pack) return { pack: null, overrides: [] };

	try {
		const records = await pb.collection<PreflopRangeRecord>('preflop_ranges').getFullList({
			filter: pb.filter('pack = {:pack} && enabled = true', { pack: pack.id }),
			sort: 'spot_key'
		});
		const overrides = records.flatMap((record) => {
			const actions = parseActionMap(record.actions);
			return actions ? [{ spotKey: record.spot_key, actions }] : [];
		});
		return { pack, overrides };
	} catch {
		return { pack, overrides: [] };
	}
}

export async function saveScenarioRange(
	pb: PocketBase,
	userId: string,
	scenario: Scenario,
	actions: ActionMap
) {
	const existingPack = await findUserPack(pb, userId);
	const pack: StrategyPackRecord | null =
		existingPack ??
		(await pb.collection<StrategyPackRecord>('strategy_packs').create({
			name: 'My 100bb Cash Baseline',
			version: 1,
			description: 'Personal editable 6-max, 100bb, no-ante strategy pack.',
			published: true,
			owner: userId,
			configuration: {
				players: 6,
				stackDepthBb: 100,
				ante: 0,
				openSizeBb: 2.5
			}
		}));
	if (!pack) throw new Error('PocketBase did not return the created strategy pack.');

	const payload = {
		pack: pack.id,
		spot_key: scenario.id,
		label: scenario.label,
		spot_type: scenario.type,
		hero: scenario.hero,
		villain: scenario.villain ?? '',
		pot: scenario.pot,
		raise_label: scenario.raiseLabel,
		actions,
		enabled: true
	};

	try {
		const existing = await pb.collection<PreflopRangeRecord>('preflop_ranges').getFirstListItem(
			pb.filter('pack = {:pack} && spot_key = {:spot}', {
				pack: pack.id,
				spot: scenario.id
			})
		);
		await pb.collection('preflop_ranges').update(existing.id, payload);
	} catch {
		await pb.collection('preflop_ranges').create(payload);
	}

	return pack;
}

export async function resetScenarioRange(pb: PocketBase, userId: string, spotKey: string) {
	const pack = await findUserPack(pb, userId);
	if (!pack) return;

	try {
		const record = await pb.collection<PreflopRangeRecord>('preflop_ranges').getFirstListItem(
			pb.filter('pack = {:pack} && spot_key = {:spot}', {
				pack: pack.id,
				spot: spotKey
			})
		);
		await pb.collection('preflop_ranges').delete(record.id);
	} catch {
		// The spot is already using the bundled default.
	}
}

export async function resetAllScenarioRanges(pb: PocketBase, userId: string) {
	const pack = await findUserPack(pb, userId);
	if (!pack) return;

	const records = await pb.collection<PreflopRangeRecord>('preflop_ranges').getFullList({
		filter: pb.filter('pack = {:pack}', { pack: pack.id })
	});
	for (const record of records) {
		await pb.collection('preflop_ranges').delete(record.id);
	}
}
