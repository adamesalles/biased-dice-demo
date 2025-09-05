<script lang="ts">
	import { onMount } from 'svelte';
	import DiceSection from '$lib/DiceSection.svelte';
	import { diceColors } from '$lib/stores.js';

	let showBayesian = false;
	let selectedDice: 'biased' | 'unbiased' = 'biased';

	function navigateToBayesian(diceType: 'biased' | 'unbiased') {
		selectedDice = diceType;
		showBayesian = true;
	}

	function backToMain() {
		showBayesian = false;
	}
</script>

<svelte:head>
	<title>Demonstração de Dados Viciados</title>
	<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
	<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
	<script>
		window.MathJax = {
			tex: {
				inlineMath: [['$', '$'], ['\\(', '\\)']],
				displayMath: [['$$', '$$'], ['\\[', '\\]']]
			}
		};
	</script>
</svelte:head>

<main>
	{#if !showBayesian}
		<div class="main-screen">
			<h1>Demonstração de Inferência Estatística com Dados</h1>
			<div class="dice-container">
				<DiceSection 
					diceType="unbiased" 
					title="Dado Não Viciado" 
					color={$diceColors.unbiased}
					onAnalyze={() => navigateToBayesian('unbiased')}
				/>
				<DiceSection 
					diceType="biased" 
					title="Dado Viciado" 
					color={$diceColors.biased}
					onAnalyze={() => navigateToBayesian('biased')}
				/>
			</div>
		</div>
	{:else}
		{#await import('$lib/BayesianAnalysis.svelte')}
			<div class="loading">Carregando análise bayesiana...</div>
		{:then module}
			<svelte:component this={module.default} {selectedDice} onBack={backToMain} />
		{/await}
	{/if}
	
	<footer>
		<p>Feito por Eduardo Adame</p>
	</footer>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: #fafafa;
		color: #333;
	}

	main {
		min-height: 100vh;
		padding: 20px;
		padding-bottom: 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.main-screen {
		max-width: 1400px;
		margin: 0 auto;
		flex: 1;
		display: flex;
		flex-direction: column;
		margin-bottom: 30px;
	}

	h1 {
		text-align: center;
		color: #2c3e50;
		margin-bottom: 40px;
		font-size: 2.2rem;
		font-weight: 300;
	}

	.dice-container {
		display: flex;
		flex-direction: row;
		gap: 20px;
		flex: 1;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 50vh;
		font-size: 1.2rem;
		color: #666;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 1.8rem;
		}
		
		.dice-container {
			flex-direction: column;
			height: auto;
			min-height: calc(100vh - 200px);
		}
	}
	
	footer {
		background: #2c3e50;
		color: white;
		text-align: center;
		padding: 15px 20px;
		margin-top: auto;
		margin-left: -20px;
		margin-right: -20px;
	}
	
	footer p {
		margin: 0;
		font-size: 0.9rem;
	}
</style>