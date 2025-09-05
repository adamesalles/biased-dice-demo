<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { diceData } from './stores.js';
	import { calculateProbabilities } from './diceUtils.js';
	
	export let diceType: 'biased' | 'unbiased';
	export let color: string;
	
	let svgElement: SVGSVGElement;
	
	const margin = { top: 20, right: 20, bottom: 40, left: 70 };
	const width = 600 - margin.left - margin.right;
	const height = 280 - margin.top - margin.bottom;
	
	$: if (svgElement && $diceData) {
		updateHistogram($diceData[diceType]);
	}
	
	onMount(() => {
		initializeHistogram();
	});
	
	function initializeHistogram() {
		const svg = d3.select(svgElement);
		svg.selectAll("*").remove();
		
		const g = svg.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);
		
		// Scales
		const xScale = d3.scaleBand()
			.domain(['1', '2', '3', '4', '5', '6'])
			.range([0, width])
			.padding(0.1);
		
		const yScale = d3.scaleLinear()
			.domain([0, 0.5])
			.range([height, 0]);
		
		// Axes
		g.append("g")
			.attr("transform", `translate(0,${height})`)
			.call(d3.axisBottom(xScale))
			.append("text")
			.attr("x", width / 2)
			.attr("y", 35)
			.attr("fill", "black")
			.style("text-anchor", "middle")
			.text("Face do Dado");
		
		g.append("g")
			.call(d3.axisLeft(yScale).tickFormat(d3.format(".1%")))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -50)
			.attr("x", -height / 2)
			.attr("fill", "black")
			.style("text-anchor", "middle")
			.text("Probabilidade");
		
		// Bars container
		g.append("g").attr("class", "bars");
		
		// Baseline line at 1/6 (after bars so it appears on top)
		g.append("line")
			.attr("class", "baseline-line")
			.attr("x1", 0)
			.attr("x2", width)
			.attr("y1", yScale(1/6))
			.attr("y2", yScale(1/6))
			.attr("stroke", "#666")
			.attr("stroke-dasharray", "5,5")
			.attr("stroke-width", 2);
		
		g.append("text")
			.attr("class", "baseline-text")
			.attr("x", width - 5)
			.attr("y", yScale(1/6) - 5)
			.attr("fill", "#666")
			.style("text-anchor", "end")
			.style("font-size", "12px")
			.text("1/6 (não viciado)");
	}
	
	function updateHistogram(data: { throws: number[], counts: number[] }) {
		const probabilities = calculateProbabilities(data.counts);
		const svg = d3.select(svgElement);
		const g = svg.select("g");
		
		const xScale = d3.scaleBand()
			.domain(['1', '2', '3', '4', '5', '6'])
			.range([0, width])
			.padding(0.1);
		
		const yScale = d3.scaleLinear()
			.domain([0, Math.max(0.5, d3.max(probabilities) || 0)])
			.range([height, 0]);
		
		// Update y-axis
		g.select(".y-axis").remove();
		g.append("g")
			.attr("class", "y-axis")
			.call(d3.axisLeft(yScale).tickFormat(d3.format(".1%")))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -50)
			.attr("x", -height / 2)
			.attr("fill", "black")
			.style("text-anchor", "middle")
			.text("Probabilidade");
		
		// Update bars
		const bars = g.select(".bars")
			.selectAll(".bar")
			.data(probabilities.map((p, i) => ({ face: i + 1, probability: p, count: data.counts[i] })));
		
		bars.enter()
			.append("rect")
			.attr("class", "bar")
			.merge(bars)
			.attr("x", d => xScale(d.face.toString()) || 0)
			.attr("width", xScale.bandwidth())
			.attr("fill", color)
			.attr("stroke", "white")
			.attr("stroke-width", 1)
			.transition()
			.duration(300)
			.attr("y", d => yScale(d.probability))
			.attr("height", d => height - yScale(d.probability));
		
		bars.exit().remove();
		
		// Update text labels
		const labels = g.select(".bars")
			.selectAll(".label")
			.data(probabilities.map((p, i) => ({ face: i + 1, probability: p, count: data.counts[i] })));
		
		labels.enter()
			.append("text")
			.attr("class", "label")
			.merge(labels)
			.attr("x", d => (xScale(d.face.toString()) || 0) + xScale.bandwidth() / 2)
			.attr("text-anchor", "middle")
			.attr("fill", "black")
			.attr("font-size", "11px")
			.transition()
			.duration(300)
			.attr("y", d => yScale(d.probability) - 5)
			.text(d => d.count > 0 ? `${d.count} (${(d.probability * 100).toFixed(1)}%)` : "");
		
		labels.exit().remove();
		
		// Update baseline line position
		g.select(".baseline-line")
			.attr("y1", yScale(1/6))
			.attr("y2", yScale(1/6));
		
		g.select(".baseline-text")
			.attr("y", yScale(1/6) - 5);
	}
</script>

<div class="histogram-container">
	<h3>Distribuição Empírica</h3>
	<svg 
		bind:this={svgElement}
		width="600" 
		height="280"
		viewBox="0 0 600 280"
		style="max-width: 100%; height: auto;"
	></svg>
</div>

<style>
	.histogram-container {
		width: 100%;
		padding: 20px 10px;
		background: #fafafa;
		border-radius: 8px;
		border: 1px solid #eee;
		box-sizing: border-box;
	}
	
	h3 {
		margin: 0 0 15px 0;
		color: #555;
		font-size: 1.1rem;
		text-align: center;
	}
	
	:global(.histogram-container svg) {
		display: block;
		margin: 0 auto;
	}
</style>