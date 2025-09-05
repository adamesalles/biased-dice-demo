<script lang="ts">
	import { diceData } from './stores.js';
	import Histogram from './Histogram.svelte';
	import { createDiceBiasFunction } from './diceUtils.js';
	
	export let diceType: 'biased' | 'unbiased';
	export let title: string;
	export let color: string;
	export let onAnalyze: () => void;
	
	let customSimulationCount = 50;
	let isSimulating = false;
	
	const diceFunction = createDiceBiasFunction(diceType);
	
	function registerThrow(value: number) {
		diceData.update(data => {
			data[diceType].throws.push(value);
			data[diceType].counts[value - 1]++;
			return data;
		});
	}
	
	async function simulate(count: number) {
		if (isSimulating) return;
		
		isSimulating = true;
		
		for (let i = 0; i < count; i++) {
			const roll = diceFunction();
			registerThrow(roll);
			await new Promise(resolve => setTimeout(resolve, 50)); // Animation delay
		}
		
		isSimulating = false;
	}
	
	function clearData() {
		diceData.update(data => {
			data[diceType].throws = [];
			data[diceType].counts = [0, 0, 0, 0, 0, 0];
			return data;
		});
	}
</script>

<div class="dice-section">
	<div class="section-header">
		<h2 style="color: {color}">{title}</h2>
		<button class="analyze-btn" on:click={onAnalyze}>
			Análise Bayesiana
		</button>
	</div>
	
	<div class="section-content">
		<div class="histogram-container">
			<Histogram {diceType} {color} />
		</div>
		
		<div class="controls">
			<div class="controls-row">
				<div class="simulation-section">
					<h3>Simulação</h3>
					<div class="simulation-controls">
						<button 
							class="sim-btn" 
							style="border-color: {color}; color: {color}; --hover-bg: {color}"
							on:click={() => simulate(10)}
							disabled={isSimulating}
						>
							+10
						</button>
						<button 
							class="sim-btn" 
							style="border-color: {color}; color: {color}; --hover-bg: {color}"
							on:click={() => simulate(25)}
							disabled={isSimulating}
						>
							+25
						</button>
						<div class="custom-sim">
							<input 
								type="number" 
								bind:value={customSimulationCount}
								min="1" 
								max="1000"
								disabled={isSimulating}
							>
							<button 
								class="sim-btn" 
								style="border-color: {color}; color: {color}; --hover-bg: {color}"
								on:click={() => simulate(customSimulationCount)}
								disabled={isSimulating}
							>
								+{customSimulationCount}
							</button>
						</div>
					</div>
					<button class="clear-btn" on:click={clearData} disabled={isSimulating}>
						Limpar
					</button>
				</div>
				
				<div class="dpad-container">
					<h3>Registrar Jogada</h3>
					<div class="dpad">
						{#each [1, 2, 3, 4, 5, 6] as value}
							<button 
								class="dpad-btn" 
								style="border-color: {color}" 
								on:click={() => registerThrow(value)}
								disabled={isSimulating}
							>
								{value}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.dice-section {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 12px;
		border-bottom: 2px solid #f0f0f0;
	}
	
	h2 {
		margin: 0;
		font-size: 1.6rem;
		font-weight: 500;
	}
	
	.analyze-btn {
		background: #34495e;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background-color 0.2s;
	}
	
	.analyze-btn:hover {
		background: #2c3e50;
	}
	
	.section-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
		flex: 1;
	}
	
	.controls {
		display: flex;
		justify-content: center;
	}
	
	.controls-row {
		display: flex;
		gap: 40px;
		align-items: flex-start;
	}
	
	.simulation-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}
	
	.simulation-section h3 {
		margin: 0;
		color: #555;
		font-size: 1.1rem;
	}
	
	.dpad-container h3 {
		margin: 0 0 15px 0;
		color: #555;
		font-size: 1.1rem;
	}
	
	.dpad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-bottom: 20px;
	}
	
	.dpad-btn {
		width: 60px;
		height: 60px;
		border: 2px solid;
		background: white;
		color: #333;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1.4rem;
		font-weight: bold;
		transition: all 0.2s;
	}
	
	.dpad-btn:hover:not(:disabled) {
		background: rgba(52, 152, 219, 0.1);
		transform: translateY(-2px);
	}
	
	.dpad-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.simulation-controls {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 20px;
	}
	
	.custom-sim {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	
	.custom-sim input {
		width: 80px;
		padding: 6px 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		text-align: center;
	}
	
	.sim-btn {
		padding: 8px 16px;
		border: 1px solid;
		background: white;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
	}
	
	.sim-btn:hover:not(:disabled) {
		background: var(--hover-bg, #3498db);
		color: white;
	}
	
	.sim-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.clear-btn {
		width: 100%;
		padding: 10px;
		background: #e74c3c;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s;
	}
	
	.clear-btn:hover:not(:disabled) {
		background: #c0392b;
	}
	
	.clear-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.histogram-container {
		flex: 1;
		min-height: 300px;
	}
	
	.dpad-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	@media (max-width: 768px) {
		.controls-row {
			flex-direction: column;
			gap: 20px;
			align-items: center;
		}
	}
</style>