// PerformanceTimeline component for showing animated quiz performance
import { QuestionTypeBreakdownProps, QuestionAttempt } from '../types';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const PerformanceTimeline = ({ attempts }: { attempts: QuestionAttempt[] }) => {
    const chartRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!chartRef.current || !attempts.length) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Chart dimensions
        const margin = { top: 20, right: 40, bottom: 40, left: 50 };
        const width = 600 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select(chartRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, attempts.length - 1])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(attempts, d => d.timeSpent) || 0])
            .range([height, 0]);

        // X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .ticks(attempts.length)
                .tickFormat(d => `Q${(+d) + 1}`));

        // Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale)
                .tickFormat(d => `${d}s`));

        // Grid lines
        svg.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.1)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat(() => ''));

        // Gradient
        const gradient = svg.append('linearGradient')
            .attr('id', 'performance-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('x2', width);

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgb(147, 51, 234)');

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgb(79, 70, 229)');

        // Create line generator
        const line = d3.line<QuestionAttempt>()
            .x(d => xScale(d.questionIndex))
            .y(d => yScale(d.timeSpent))
            .curve(d3.curveMonotoneX);

        // Path with animation
        const path = svg.append('path')
            .datum(attempts)
            .attr('fill', 'none')
            .attr('stroke', 'url(#performance-gradient)')
            .attr('stroke-width', 3)
            .attr('d', line);

        // Get total length for animation
        const totalLength = path.node()?.getTotalLength() || 0;

        // Set up animation
        path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(1500)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);

        // Points with animation
        const points = svg.selectAll('.point')
            .data(attempts)
            .enter()
            .append('g')
            .attr('class', 'point')
            .attr('transform', d => `translate(${xScale(d.questionIndex)},${yScale(d.timeSpent)})`);

        points.append('circle')
            .attr('r', 0)
            .attr('fill', d => d.isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .transition()
            .delay((_, i) => i * 200 + 1500)
            .duration(300)
            .attr('r', 6);

        // Tooltips
        points.append('title')
            .text(d => `Question ${d.questionIndex + 1} Time: ${d.timeSpent.toFixed(1)}s ${d.isCorrect ? '✓ Correct' : '✗ Incorrect'}`);

        // Annotations for significant points
        const significantPoints = attempts.filter((d, i) => {
            if (i === 0) return true; // First question
            if (i === attempts.length - 1) return true; // Last question
            const prevTime = attempts[i - 1].timeSpent;
            const timeChange = Math.abs(d.timeSpent - prevTime);
            const meanTime = d3.mean(attempts, d => d.timeSpent) ?? 0;
            return timeChange > meanTime * 0.5; // Significant time changes
        });

        // Add floating labels for significant points
        svg.selectAll('.annotation')
            .data(significantPoints)
            .enter()
            .append('g')
            .attr('class', 'annotation')
            .attr('transform', d => `translate(${xScale(d.questionIndex)},${yScale(d.timeSpent) - 15})`)
            .style('opacity', 0)
            .transition()
            .delay((_, i) => i * 200 + 2000)
            .duration(300)
            .style('opacity', 1)
            .selection()
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', 'rgb(107, 114, 128)')
            .text((d: QuestionAttempt) => `${d.timeSpent.toFixed(1)}s`);

    }, [attempts]);

    return (
        <div className="flex justify-center">
            <svg 
                ref={chartRef}
                className="w-[600px] h-[300px] bg-white rounded-lg shadow-md"
            />
        </div>
    );
};