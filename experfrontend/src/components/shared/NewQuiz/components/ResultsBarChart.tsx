import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ResultsBarChartProps } from '../types';

export const ResultsBarChart = ({ correct, incorrect }: ResultsBarChartProps) => {

    const chartRef = useRef<SVGSVGElement>(null);
    
        useEffect(() => {
            if (!chartRef.current) return;
    
            // Clear previous chart
            d3.select(chartRef.current).selectAll('*').remove();
    
            // Set dimensions
            const margin = { top: 30, right: 60, bottom: 40, left: 40 };
            const width = 300 - margin.left - margin.right;
            const height = 200 - margin.top - margin.bottom;
    
            // Create SVG container
            const svg = d3.select(chartRef.current)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);
    
            // Prepare data for stacking 
            const data = [{
                category: 'Results',
                correct,
                incorrect,
                total: correct + incorrect
            }];
    
            const stack = d3.stack<any>()
                .keys(['correct', 'incorrect'])
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);
    
            const series = stack(data);
    
            // Scales
            const xScale = d3.scaleBand()
                .range([0, width])
                .domain(data.map(d => d.category))
                .padding(0.3);
    
            const yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([0, d3.max(data, d => d.total) || 0])
                .nice();
    
            // Color scale
            const colorScale = d3.scaleOrdinal<string>()
                .domain(['correct', 'incorrect'])
                .range(['rgb(34, 197, 94)', 'rgb(239, 68, 68)']);
    
            // Stacked bars
            svg.selectAll('g.stack')
                .data(series)
                .enter()
                .append('g')
                .attr('class', 'stack')
                .attr('fill', d => colorScale(d.key))
                .selectAll('rect')
                .data(d => d)
                .enter()
                .append('rect')
                .attr('x', d => xScale('Results') || 0)
                .attr('y', d => yScale(d[1]))
                .attr('height', d => yScale(d[0]) - yScale(d[1]))
                .attr('width', xScale.bandwidth())
                .attr('rx', 4)
                .attr('stroke', 'white')
                .attr('stroke-width', 1);
    
            // Value labels
            svg.selectAll('.value-label')
                .data(series)
                .enter()
                .append('text')
                .attr('class', 'value-label')
                .attr('x', d => (xScale('Results') || 0) + xScale.bandwidth() / 2)
                .attr('y', d => yScale(d[0][1] - (d[0][1] - d[0][0]) / 2))
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .attr('fill', 'white')
                .attr('font-weight', 'bold')
                .text(d => d[0][1] - d[0][0]);
    
            // Y-axis
            svg.append('g')
                .call(d3.axisLeft(yScale))
                .call(g => g.select('.domain').remove());
    
            // Legend
            const legend = svg.append('g')
                .attr('transform', `translate(${width + 10}, 0)`);
    
            const legendItems = [
                { label: 'Correct', color: 'rgb(34, 197, 94)' },
                { label: 'Incorrect', color: 'rgb(239, 68, 68)' }
            ];
    
            legend.selectAll('rect')
                .data(legendItems)
                .enter()
                .append('rect')
                .attr('y', (_, i) => i * 20)
                .attr('width', 12)
                .attr('height', 12)
                .attr('fill', d => d.color)
                .attr('rx', 2);
    
            legend.selectAll('text')
                .data(legendItems)
                .enter()
                .append('text')
                .attr('x', 20)
                .attr('y', (_, i) => i * 20 + 10)
                .attr('font-size', '12px')
                .attr('fill', 'currentColor')
                .text(d => d.label);
    
            // Grid lines
            svg.append('g')
                .attr('class', 'grid')
                .call(d3.axisLeft(yScale)
                    .tickSize(-width)
                    .tickFormat(() => '')
                )
                .style('stroke-dasharray', '3,3')
                .style('stroke-opacity', 0.2)
                .call(g => g.select('.domain').remove());
    
            
        }, [correct, incorrect]);
    
        return (
        <div className="flex justify-center">
            <svg ref={chartRef} className="w-[400px] h-[200px] bg-white rounded-lg shadow-md" />
        </div>
        );
    };