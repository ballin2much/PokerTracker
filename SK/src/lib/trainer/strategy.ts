import {
	ACTIONS,
	type ActionMap,
	type ActionMix,
	type Scenario,
	type TrainerAction
} from './types';
import { ALL_HANDS } from './ranges';

export type { ActionMap, ActionMix } from './types';

export type RangeOverride = {
	spotKey: string;
	actions: ActionMap;
};

const ACTION_SET = new Set<TrainerAction>(ACTIONS);

export function pureActionMix(action: TrainerAction): ActionMix {
	return {
		Fold: action === 'Fold' ? 1 : 0,
		Call: action === 'Call' ? 1 : 0,
		Raise: action === 'Raise' ? 1 : 0
	};
}

export function scenarioToActionMap(scenario: Scenario): ActionMap {
	return scenario.actions;
}

export function dominantAction(mix: ActionMix): TrainerAction {
	return ACTIONS.reduce((best, action) => (mix[action] > mix[best] ? action : best), 'Fold');
}

export function parseActionMap(value: unknown): ActionMap | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

	const input = value as Record<string, unknown>;
	const result: ActionMap = {};
	for (const hand of ALL_HANDS) {
		const rawMix = input[hand];
		if (!rawMix || typeof rawMix !== 'object' || Array.isArray(rawMix)) return null;

		const values = rawMix as Record<string, unknown>;
		const mix: ActionMix = {
			Fold: Number(values.Fold),
			Call: Number(values.Call),
			Raise: Number(values.Raise)
		};
		if (
			Object.entries(mix).some(
				([action, frequency]) =>
					!ACTION_SET.has(action as TrainerAction) ||
					!Number.isFinite(frequency) ||
					frequency < 0 ||
					frequency > 1
			)
		) {
			return null;
		}

		const total = mix.Fold + mix.Call + mix.Raise;
		if (Math.abs(total - 1) > 0.001) return null;
		result[hand] = mix;
	}
	return result;
}

export function applyRangeOverrides(scenarios: Scenario[], overrides: RangeOverride[]): Scenario[] {
	const bySpot = new Map(overrides.map((override) => [override.spotKey, override.actions]));
	return scenarios.map((scenario) => {
		const actions = bySpot.get(scenario.id);
		if (!actions) return scenario;
		return { ...scenario, actions };
	});
}
