<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import * as d3 from 'd3';
	import { diceData, priors, diceColors } from './stores.js';
	import { 
		calculateBayesianPosterior, 
		calculateProbabilities
	} from './diceUtils.js';
	
	export let selectedDice: 'biased' | 'unbiased';
	export let onBack: () => void;
	
	let svgElement: SVGSVGElement;
	let priorInputs: number[] = [1/6, 1/6, 1/6, 1/6, 1/6, 1/6];
	let mathJaxReady = false;
	
	$: currentData = $diceData[selectedDice];
	$: currentColor = $diceColors[selectedDice];
	$: posterior = calculateBayesianPosterior(priorInputs, currentData.counts);
	$: empiricalProbs = calculateProbabilities(currentData.counts);
	
	onMount(() => {
		initializePlot();
		checkMathJax();
	});
	
	afterUpdate(() => {
		if (mathJaxReady && typeof window !== 'undefined' && window.MathJax) {
			window.MathJax.typesetPromise();
		}
	});
	
	function checkMathJax() {
		if (typeof window !== 'undefined' && window.MathJax) {
			mathJaxReady = true;
		} else {
			setTimeout(checkMathJax, 100);
		}
	}
	
	$: if (svgElement && posterior) {
		updatePlot();
	}
	
	function updatePrior(index: number, value: number) {
		priorInputs[index] = Math.max(0.001, value);
		// Normalize to ensure they sum to 1
		const sum = priorInputs.reduce((s, p) => s + p, 0);
		priorInputs = priorInputs.map(p => p / sum);
	}
	
	function initializePlot() {
		if (!svgElement) return;
		
		const svg = d3.select(svgElement);
		svg.selectAll("*").remove();
		
		const margin = { top: 20, right: 30, bottom: 60, left: 60 };
		const width = 800 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;
		
		const g = svg.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);
		
		// Scales
		const xScale = d3.scaleBand()
			.domain(['1', '2', '3', '4', '5', '6'])
			.range([0, width])
			.padding(0.1);
		
		const yScale = d3.scaleLinear()
			.domain([0, 1.0])
			.range([height, 0]);
		
		// Axes
		g.append("g")
			.attr("class", "x-axis")
			.attr("transform", `translate(0,${height})`)
			.call(d3.axisBottom(xScale))
			.append("text")
			.attr("x", width / 2)
			.attr("y", 40)
			.attr("fill", "black")
			.style("text-anchor", "middle")
			.style("font-size", "14px")
			.text("Face do Dado");
		
		g.append("g")
			.attr("class", "y-axis")
			.call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -40)
			.attr("x", -height / 2)
			.attr("fill", "black")
			.style("text-anchor", "middle")
			.style("font-size", "14px")
			.text("Probabilidade");
		
		// Legend
		const legend = g.append("g")
			.attr("class", "legend")
			.attr("transform", `translate(${width - 200}, 20)`);
		
		const legendData = [
			{ label: 'Prior', color: '#bdc3c7', type: 'line' },
			{ label: 'Posteriori', color: '#27ae60', type: 'bar' },
			{ label: 'Frequência', color: currentColor, type: 'bar' }
		];
		
		legendData.forEach((d, i) => {
			const legendRow = legend.append("g")
				.attr("transform", `translate(0, ${i * 20})`);
			
			if (d.type === 'bar') {
				legendRow.append("rect")
					.attr("width", 15)
					.attr("height", 10)
					.attr("fill", d.color);
			} else {
				legendRow.append("line")
					.attr("x1", 0)
					.attr("x2", 15)
					.attr("y1", 5)
					.attr("y2", 5)
					.attr("stroke", d.color)
					.attr("stroke-width", 2);
			}
			
			legendRow.append("text")
				.attr("x", 20)
				.attr("y", 5)
				.attr("dy", "0.35em")
				.style("font-size", "12px")
				.text(d.label);
		});
	}
	
	function updatePlot() {
		if (!svgElement) return;
		
		const svg = d3.select(svgElement);
		const g = svg.select("g");
		
		const margin = { top: 20, right: 30, bottom: 60, left: 60 };
		const width = 800 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;
		
		const xScale = d3.scaleBand()
			.domain(['1', '2', '3', '4', '5', '6'])
			.range([0, width])
			.padding(0.1);
		
		
		const yScale = d3.scaleLinear()
			.domain([0, 1.0])
			.range([height, 0]);
		
		// Update y-axis
		g.select(".y-axis")
			.transition()
			.duration(500)
			.call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));
		
		// Update posterior bars (left half of each band)
		const posteriorBars = g.selectAll(".posterior-bar")
			.data(posterior);
		
		posteriorBars.enter()
			.append("rect")
			.attr("class", "posterior-bar")
			.merge(posteriorBars)
			.attr("x", (d, i) => (xScale((i + 1).toString()) || 0))
			.attr("width", xScale.bandwidth() * 0.45)
			.attr("fill", "#27ae60")
			.attr("opacity", 0.8)
			.attr("stroke", "white")
			.attr("stroke-width", 1)
			.transition()
			.duration(500)
			.attr("y", d => yScale(d))
			.attr("height", d => height - yScale(d));
		
		// Update frequency bars (right half of each band)
		const frequencyBars = g.selectAll(".frequency-bar")
			.data(empiricalProbs);
		
		frequencyBars.enter()
			.append("rect")
			.attr("class", "frequency-bar")
			.merge(frequencyBars)
			.attr("x", (d, i) => (xScale((i + 1).toString()) || 0) + xScale.bandwidth() * 0.5)
			.attr("width", xScale.bandwidth() * 0.45)
			.attr("fill", currentColor)
			.attr("opacity", 0.8)
			.attr("stroke", "white")
			.attr("stroke-width", 1)
			.transition()
			.duration(500)
			.attr("y", d => yScale(d))
			.attr("height", d => height - yScale(d));
		
		// Add distribution lines
		const line = d3.line<number>()
			.x((d, i) => (xScale((i + 1).toString()) || 0) + xScale.bandwidth() / 2)
			.y(d => yScale(d))
			.curve(d3.curveMonotoneX);
		
		// Prior line
		g.selectAll(".prior-line").remove();
		g.append("path")
			.datum(priorInputs)
			.attr("class", "prior-line")
			.attr("fill", "none")
			.attr("stroke", "#bdc3c7")
			.attr("stroke-width", 3)
			.attr("stroke-dasharray", "5,5")
			.attr("d", line);
		
		// Add 1/6 baseline line
		g.selectAll(".baseline-line").remove();
		g.append("line")
			.attr("class", "baseline-line")
			.attr("x1", 0)
			.attr("x2", width)
			.attr("y1", yScale(1/6))
			.attr("y2", yScale(1/6))
			.attr("stroke", "#666")
			.attr("stroke-dasharray", "5,5")
			.attr("stroke-width", 2);
		
		g.selectAll(".baseline-text").remove();
		g.append("text")
			.attr("class", "baseline-text")
			.attr("x", width - 5)
			.attr("y", yScale(1/6) - 5)
			.attr("fill", "#666")
			.style("text-anchor", "end")
			.style("font-size", "12px")
			.text("1/6 (laranja)");
		
		
	}
</script>

<div class="bayesian-analysis">
	<div class="header">
		<button class="back-btn" on:click={onBack}>← Voltar</button>
		<h1>Análise Bayesiana: {selectedDice === 'biased' ? 'Dado Azul' : 'Dado Laranja'}</h1>
	</div>
	
	<div class="content">
		<div class="controls-section">
			<div class="prior-controls">
				<h3>Configurar Priori</h3>
				<div class="prior-inputs">
					{#each priorInputs as prior, i}
						<div class="prior-input">
							<label>Face {i + 1}:</label>
							<input 
								type="number" 
								min="0.001" 
								max="1" 
								step="0.001"
								value={prior.toFixed(3)}
								on:input={(e) => updatePrior(i, parseFloat(e.target.value) || 0.001)}
							>
						</div>
					{/each}
				</div>
				<p class="sum-display">
					Soma: {priorInputs.reduce((s, p) => s + p, 0).toFixed(3)}
					{#if Math.abs(priorInputs.reduce((s, p) => s + p, 0) - 1) > 0.001}
						<span class="warning">(Normalizado automaticamente)</span>
					{/if}
				</p>
			</div>
			
			<div class="statistics">
				<h3>Estatísticas</h3>
				<div class="stat-row">
					<strong>Observações:</strong> {currentData.throws.length} jogadas
				</div>
				<div class="stat-row">
					<strong>Distribuição das faces:</strong><br> [{currentData.counts.join(', ')}]
				</div>
			</div>
		</div>
		
		<div class="plot-section">
			<h3>Distribuições de Probabilidade</h3>
			<svg 
				bind:this={svgElement}
				width="900" 
				height="350"
				viewBox="0 0 900 350"
				style="max-width: 100%; height: auto;"
			></svg>
		</div>
		
		<div class="mathematical-formulation">
			<h3>Formulação Matemática</h3>
			<div class="math-content">
				<div class="formula">
					<h4>Modelo Multinomial com Priori Dirichlet</h4>
					{#if mathJaxReady}
						<p>
							{'$$\\text{Verossimilhança: } P(\\mathbf{x} | \\boldsymbol{\\theta}) = \\text{Multinomial}(\\mathbf{x} | n, \\boldsymbol{\\theta})$$'}
						</p>
						<p>
							{'$$\\text{Priori: } P(\\boldsymbol{\\theta}) = \\text{Dir}(\\boldsymbol{\\theta} | \\boldsymbol{\\alpha})$$'}
						</p>
						<p>
							{'$$\\text{Posteriori: } P(\\boldsymbol{\\theta} | \\mathbf{x}) = \\text{Dir}(\\boldsymbol{\\theta} | \\boldsymbol{\\alpha} + \\mathbf{x})$$'}
						</p>
					{/if}
				</div>
				
				<div class="results">
					<h4>Resultados Numéricos</h4>
					<div class="result-table">
						<table>
							<thead>
								<tr>
									<th>Face</th>
									<th>Priori</th>
									<th>Observações</th>
									<th>Posteriori</th>
									<th>Empírica</th>
								</tr>
							</thead>
							<tbody>
								{#each [1,2,3,4,5,6] as face, i}
									<tr>
										<td>{face}</td>
										<td>{(priorInputs[i] * 100).toFixed(1)}%</td>
										<td>{currentData.counts[i]}</td>
										<td>{(posterior[i] * 100).toFixed(1)}%</td>
										<td>{(empiricalProbs[i] * 100).toFixed(1)}%</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.bayesian-analysis {
		max-width: 1400px;
		margin: 0 auto;
		padding: 20px;
		min-height: calc(100vh - 80px);
		display: flex;
		flex-direction: column;
	}
	
	.header {
		display: flex;
		align-items: center;
		margin-bottom: 30px;
		gap: 20px;
	}
	
	.back-btn {
		background: #34495e;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		transition: background-color 0.2s;
	}
	
	.back-btn:hover {
		background: #2c3e50;
	}
	
	h1 {
		color: #2c3e50;
		font-size: 2rem;
		font-weight: 300;
		margin: 0;
	}
	
	.content {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 30px;
		margin-bottom: 30px;
		flex: 1;
	}
	
	.controls-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	
	.prior-controls, .statistics {
		background: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.prior-controls h3, .statistics h3 {
		margin: 0 0 15px 0;
		color: #555;
	}
	
	.prior-inputs {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	
	.prior-input {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.prior-input label {
		font-weight: 500;
	}
	
	.prior-input input {
		width: 80px;
		padding: 4px 8px;
		border: 1px solid #ddd;
		border-radius: 4px;
		text-align: center;
	}
	
	.sum-display {
		margin-top: 10px;
		font-size: 0.9rem;
		color: #666;
	}
	
	.warning {
		color: #e74c3c;
		font-style: italic;
	}
	
	.stat-row {
		margin-bottom: 10px;
		font-size: 0.9rem;
	}
	
	.plot-section {
		background: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.plot-section h3 {
		margin: 0 0 20px 0;
		color: #555;
		text-align: center;
	}
	
	.mathematical-formulation {
		grid-column: 1 / -1;
		background: white;
		padding: 30px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.mathematical-formulation h3 {
		margin: 0 0 10px 0;
		color: #555;
		text-align: center;
	}
	
	.math-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30px;
	}
	
	.formula h4, .results h4 {
		color: #2c3e50;
		margin-bottom: 15px;
	}
	
	.result-table {
		overflow-x: auto;
	}
	
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}
	
	th, td {
		padding: 8px 12px;
		text-align: center;
		border-bottom: 1px solid #eee;
	}
	
	th {
		background: #f8f9fa;
		font-weight: 600;
		color: #555;
	}
	
	tr:hover {
		background: #f8f9fa;
	}
	
	@media (max-width: 1024px) {
		.content {
			grid-template-columns: 1fr;
		}
		
		.math-content {
			grid-template-columns: 1fr;
		}
	}
</style>