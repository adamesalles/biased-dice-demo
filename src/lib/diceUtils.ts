export function createDiceBiasFunction(diceType: 'biased' | 'unbiased'): () => number {
	if (diceType === 'unbiased') {
		return () => Math.floor(Math.random() * 6) + 1;
	}
	
	// Biased dice: heavily favors 6
	const weights = [0.14, 0.14, 0.14, 0.14, 0.14, 0.3]; // Probabilities for faces 1-6
	const cumulativeWeights = weights.reduce((acc, weight, index) => {
		acc[index] = weight + (acc[index - 1] || 0);
		return acc;
	}, [] as number[]);
	
	return () => {
		const random = Math.random();
		for (let i = 0; i < cumulativeWeights.length; i++) {
			if (random <= cumulativeWeights[i]) {
				return i + 1;
			}
		}
		return 6; // Fallback
	};
}

export function calculateProbabilities(counts: number[]): number[] {
	const total = counts.reduce((sum, count) => sum + count, 0);
	if (total === 0) return [0, 0, 0, 0, 0, 0];
	return counts.map(count => count / total);
}

export function calculateBayesianPosterior(
	prior: number[], 
	observations: number[]
): number[] {
	// Dirichlet-Multinomial conjugate prior
	const posterior = prior.map((p, i) => p + observations[i]);
	const sum = posterior.reduce((s, p) => s + p, 0);
	return posterior.map(p => p / sum);
}

export function calculateBayesEstimator(posterior: number[]): number[] {
	// For Dirichlet distribution, Bayes estimator is the mean
	return posterior;
}

export function calculateMAPEstimator(prior: number[], observations: number[]): number[] {
	// Maximum A Posteriori estimator for Dirichlet
	const alpha = prior.map((p, i) => p + observations[i]);
	const sum = alpha.reduce((s, a) => s + a, 0);
	return alpha.map(a => Math.max(0, a - 1) / Math.max(1, sum - alpha.length));
}