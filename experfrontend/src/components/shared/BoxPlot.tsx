'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface QuizResult {
    _id: string;
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    created_at: string;
    category: string;
}

interface BoxPlotProps {
    results: QuizResult[];
}

const BoxPlot = ({ results }: BoxPlotProps) => {
    const chartRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!chartRef.current || !results.length) return;

        // Clear existing chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Chart dimensions
        const margin = { top: 40, right: 40, bottom: 40, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(chartRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Get scores and calculate statistics
        const scores = results.map(d => d.percentage).sort(d3.ascending);
        const stats = {
            min: d3.min(scores) || 0,
            q1: d3.quantile(scores, 0.25) || 0,
            median: d3.median(scores) || 0,
            q3: d3.quantile(scores, 0.75) || 0,
            max: d3.max(scores) || 0,
            mean: d3.mean(scores) || 0
        };

        // Create scales
        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0])
            .nice();

        const xScale = d3.scaleBand()
            .domain(['Score Distribution'])
            .range([0, width])
            .padding(0.4);

        // Add vertical box
        const boxWidth = xScale.bandwidth();

        // Add box
        svg.append('rect')
            .attr('x', xScale('Score Distribution'))
            .attr('y', yScale(stats.q3))
            .attr('height', yScale(stats.q1) - yScale(stats.q3))
            .attr('width', boxWidth)
            .attr('fill', 'rgb(233, 213, 255)')
            .attr('stroke', 'rgb(147, 51, 234)')
            .attr('stroke-width', 2);

        // Add median line
        svg.append('line')
            .attr('x1', xScale('Score Distribution'))
            .attr('x2', xScale('Score Distribution')! + boxWidth)
            .attr('y1', yScale(stats.median))
            .attr('y2', yScale(stats.median))
            .attr('stroke', 'rgb(147, 51, 234)')
            .attr('stroke-width', 2);

        // Add mean point
        svg.append('circle')
            .attr('cx', xScale('Score Distribution')! + boxWidth / 2)
            .attr('cy', yScale(stats.mean))
            .attr('r', 4)
            .attr('fill', 'rgb(79, 70, 229)')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // Add whiskers
        const whiskerWidth = boxWidth / 4;

        // Lower whisker
        svg.append('line')
            .attr('x1', xScale('Score Distribution')! + boxWidth / 2)
            .attr('x2', xScale('Score Distribution')! + boxWidth / 2)
            .attr('y1', yScale(stats.q1))
            .attr('y2', yScale(stats.min))
            .attr('stroke', 'rgb(147, 51, 234)')
            .attr('stroke-width', 1)
            .style('stroke-dasharray', '3,3');

        svg.append('line')
            .attr('x1', xScale('Score Distribution')! + boxWidth / 2 - whiskerWidth / 2)
            .attr('x2', xScale('Score Distribution')! + boxWidth / 2 + whiskerWidth / 2)
            .attr('y1', yScale(stats.min))
            .attr('y2', yScale(stats.min))
            .attr('stroke', 'rgb(147, 51, 234)')
            .attr('stroke-width', 1);

        // Upper whisker
        svg.append('line')
            .attr('x1', xScale('Score Distribution')! + boxWidth / 2)
            .attr('x2', xScale('Score Distribution')! + boxWidth / 2)
            .attr('y1', yScale(stats.q3))
            .attr('y2', yScale(stats.max))
            .attr('stroke', 'rgb(147, 51, 234)')
            .attr('stroke-width', 1)
            .style('stroke-dasharray', '3,3');

        svg.append('line')
            .attr('x1', xScale('Score Distribution')! + boxWidth / 2 - whiskerWidth / 2)
            .attr('x2', xScale('Score Distribution')! + boxWidth / 2 + whiskerWidth / 2)
            .attr('y1', yScale(stats.max))
            .attr('y2', yScale(stats.max))
            .attr('stroke', 'rgb(147, 51, 234)')
            .attr('stroke-width', 1);

        // Add individual points for outliers
        const outlierThreshold = 1.5;
        const iqr = stats.q3 - stats.q1;
        const outliers = scores.filter(d => 
            d < stats.q1 - outlierThreshold * iqr || 
            d > stats.q3 + outlierThreshold * iqr
        );

        svg.selectAll('circle.outlier')
            .data(outliers)
            .enter()
            .append('circle')
            .attr('class', 'outlier')
            .attr('cx', xScale('Score Distribution')! + boxWidth / 2)
            .attr('cy', d => yScale(d))
            .attr('r', 3)
            .attr('fill', 'rgb(239, 68, 68)')
            .attr('stroke', 'white')
            .attr('stroke-width', 1);

        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));

        // Add labels
        svg.append('text')
            .attr('x', -height / 2)
            .attr('y', -margin.left + 20)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('Score Percentage');

        // Add legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 100}, 0)`);

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 4)
            .attr('fill', 'rgb(79, 70, 229)');

        legend.append('text')
            .attr('x', 10)
            .attr('y', 4)
            .style('font-size', '12px')
            .text('Mean Score');

    }, [results]);

    return (
        <div className="w-full overflow-x-auto">
            <svg
                ref={chartRef}
                className="w-full min-w-[800px] bg-white rounded-lg shadow-md p-4"
            />
        </div>
    );
};

export default BoxPlot;