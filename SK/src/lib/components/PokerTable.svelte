<script lang="ts">
	import PlayingCard from './PlayingCard.svelte';
	import { POSITIONS, type Card, type Position, type Scenario } from '$lib/trainer/types';

	let {
		scenario,
		cards
	}: {
		scenario: Scenario;
		cards: [Card, Card];
	} = $props();

	const seatClasses: Record<Position, string> = {
		UTG: 'seat-utg',
		HJ: 'seat-hj',
		CO: 'seat-co',
		BTN: 'seat-btn',
		SB: 'seat-sb',
		BB: 'seat-bb'
	};
	const actionOrder: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

	function playerStatus(position: Position) {
		if (position === scenario.hero) return 'Your turn';
		if (position === scenario.villain) {
			if (scenario.type === 'Facing open') {
				return scenario.villain === 'SB' ? 'Raised 3.5bb' : 'Raised 2.5bb';
			}
			if (scenario.type === 'Facing limp') return 'Limped';
			if (scenario.type === 'Facing 3-bet') return '3-bet';
			if (scenario.type === 'Facing 4-bet') return '4-bet';
		}
		if (scenario.type === 'Open') {
			return actionOrder.indexOf(position) < actionOrder.indexOf(scenario.hero)
				? 'Folded'
				: 'Waiting';
		}
		return 'Folded';
	}

	function stack(position: Position) {
		if (position === scenario.hero) {
			if (scenario.type === 'Open') return '100 BB';
			if (scenario.type === 'Facing limp') return '99 BB';
			return '97.5 BB';
		}
		if (position === scenario.villain) return 'In hand';
		if (position === 'SB') return '99.5 BB';
		if (position === 'BB') return '99 BB';
		return '100 BB';
	}
</script>

<div class="table-stage" aria-label={`Six-max poker table. Hero is in ${scenario.hero}.`}>
	<div class="felt">
		<div class="felt-line"></div>
		<div class="pot">
			<span class="pot-label">{scenario.type}</span>
			<strong>{scenario.pot}</strong>
		</div>
	</div>

	{#each POSITIONS as position (position)}
		<div
			class={[
				'seat',
				seatClasses[position],
				position === scenario.hero && 'hero',
				position === scenario.villain && 'villain',
				playerStatus(position) === 'Folded' && 'folded'
			]}
		>
			<div class="seat-heading">
				<strong>{position}</strong>
				{#if position === 'BTN'}<span class="dealer" aria-label="Dealer button">D</span>{/if}
			</div>
			<span class="stack">{stack(position)}</span>
			<span class="status">{playerStatus(position)}</span>
			{#if position === scenario.hero}
				<div class="hole-cards">
					{#each cards as card, index (`${card.rank}-${card.suit}-${index}`)}
						<PlayingCard {card} compact />
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.table-stage {
		position: relative;
		height: clamp(25rem, 68vw, 35rem);
		margin: 0 auto;
		max-width: 52rem;
	}

	.felt {
		position: absolute;
		inset: 16% 11% 18%;
		border: 0.75rem solid #3b4252;
		border-radius: 50%;
		background:
			radial-gradient(circle at 50% 40%, rgb(76 135 107 / 60%), transparent 55%),
			linear-gradient(145deg, #245a48, #173f34);
		box-shadow:
			inset 0 0 0 2px rgb(216 222 233 / 15%),
			inset 0 0 3rem rgb(0 0 0 / 35%),
			0 1rem 2rem rgb(0 0 0 / 30%);
	}

	.felt-line {
		position: absolute;
		inset: 7%;
		border: 1px solid rgb(236 239 244 / 18%);
		border-radius: 50%;
	}

	.pot {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		width: min(70%, 22rem);
		transform: translate(-50%, -50%);
		flex-direction: column;
		gap: 0.3rem;
		text-align: center;
		color: #eceff4;
		font-size: clamp(0.7rem, 2vw, 0.9rem);
	}

	.pot-label {
		color: #8fbcbb;
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.seat {
		position: absolute;
		z-index: 2;
		display: flex;
		width: clamp(5.8rem, 18vw, 8.5rem);
		min-height: 4.4rem;
		transform: translate(-50%, -50%);
		flex-direction: column;
		align-items: center;
		border: 1px solid #4c566a;
		border-radius: 0.65rem;
		background: #2e3440;
		padding: 0.4rem 0.55rem;
		color: #d8dee9;
		box-shadow: 0 0.4rem 1rem rgb(0 0 0 / 35%);
		text-align: center;
	}

	.seat.hero {
		border: 2px solid #88c0d0;
		background: #3b4252;
		box-shadow:
			0 0 0 3px rgb(136 192 208 / 16%),
			0 0.5rem 1.2rem rgb(0 0 0 / 40%);
	}

	.seat.villain {
		border-color: #ebcb8b;
	}

	.seat.folded {
		opacity: 0.58;
	}

	.seat-heading {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.78rem;
	}

	.stack,
	.status {
		font-size: 0.65rem;
	}

	.stack {
		color: #d8dee9;
	}

	.status {
		color: #8fbcbb;
		font-weight: 700;
	}

	.folded .status {
		color: #7b8495;
	}

	.dealer {
		display: inline-grid;
		width: 1.1rem;
		height: 1.1rem;
		place-items: center;
		border-radius: 999px;
		background: #eceff4;
		color: #2e3440;
		font-size: 0.6rem;
	}

	.hole-cards {
		position: absolute;
		top: calc(100% - 0.2rem);
		left: 50%;
		z-index: 3;
		display: flex;
		transform: translateX(-50%);
		gap: 0.25rem;
	}

	.seat-btn .hole-cards,
	.seat-sb .hole-cards {
		top: auto;
		bottom: calc(100% - 0.2rem);
	}

	.seat-utg {
		top: 15%;
		left: 25%;
	}
	.seat-hj {
		top: 15%;
		left: 75%;
	}
	.seat-co {
		top: 50%;
		left: 93%;
	}
	.seat-btn {
		top: 84%;
		left: 73%;
	}
	.seat-sb {
		top: 84%;
		left: 27%;
	}
	.seat-bb {
		top: 50%;
		left: 7%;
	}

	@media (max-width: 520px) {
		.table-stage {
			height: 28rem;
		}

		.felt {
			inset: 17% 12% 20%;
			border-width: 0.55rem;
		}

		.seat {
			width: 5.7rem;
			min-height: 4rem;
			padding-inline: 0.3rem;
		}

		.seat-co {
			left: 88%;
		}
		.seat-bb {
			left: 12%;
		}
	}
</style>
