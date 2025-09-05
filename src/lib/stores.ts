import { writable } from 'svelte/store';

export const diceColors = writable({
	biased: '#3498db',     // Blue
	unbiased: '#e67e22'    // Orange
});

export interface DiceData {
	throws: number[];
	counts: number[];
}

export const diceData = writable<{
	biased: DiceData;
	unbiased: DiceData;
}>({
	biased: {
		throws: [],
		counts: [0, 0, 0, 0, 0, 0]
	},
	unbiased: {
		throws: [],
		counts: [0, 0, 0, 0, 0, 0]
	}
});

export const priors = writable<{
	biased: number[];
	unbiased: number[];
}>({
	biased: [1/6, 1/6, 1/6, 1/6, 1/6, 1/6],
	unbiased: [1/6, 1/6, 1/6, 1/6, 1/6, 1/6]
});