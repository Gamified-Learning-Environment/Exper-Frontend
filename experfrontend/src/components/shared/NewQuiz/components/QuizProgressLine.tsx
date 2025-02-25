// src/components/shared/Quiz/components/QuizProgressLine.tsx
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { QuizProgressLineProps, QuestionAttempt } from '@/components/shared/NewQuiz/types';

export const QuizProgressLine = ({ attempts }: QuizProgressLineProps) => {
    const chartRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
            if (!chartRef.current || attempts.length === 0) return; // Skip if chartRef is not set or no attempts
    
            // clear previous chart
            d3.select(chartRef.current).selectAll('*').remove();
    
            // set dimensions
            const margin = { top: 20, right: 50, bottom: 40, left: 50 };
            const width = 600 - margin.left - margin.right;
            const height = 200 - margin.top - margin.bottom;
    
            // create SVG container
            const svg = d3.select(chartRef.current)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g') // Append group element
                .attr('transform', `translate(${margin.left},${margin.top})`); // Translate group to margin
    
            // Create scales
            const xScale = d3.scaleLinear()
                .domain([0, attempts.length - 1]) // Domain from 0 to number of attempts
                .range([0, width]); // Range from 0 to width
    
            const yScale = d3.scaleLinear()
                .domain([0, d3.max(attempts, d => d.timeSpent) || 0]) // Domain from 0 to max timeSpent
                .range([height, 0]); // Range from height to 0
    
            // Create line for time spent
            const line = d3.line<QuestionAttempt>()
                .x(d => xScale(d.questionIndex)) // set x position based on questionIndex scaled by xScale
                .y(d => yScale(d.timeSpent)) // set y position based on timeSpent scaled by yScale
                .curve(d3.curveMonotoneX); // smooth line curve for better visuals
    
            // Add axes
            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale).ticks(attempts.length))
                .append('text')
                .attr('x', width / 2)
                .attr('y', 35)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'middle')
                .text('Question Number');
    
            svg.append('g')
                .call(d3.axisLeft(yScale))
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', -40)
                .attr('x', -height / 2)
                .attr('fill', 'currentColor')
                .attr('text-anchor', 'middle')
                .text('Time Spent (seconds)');
    
            // add path with gradient
            const gradient = svg.append('linearGradient')
                .attr('id', 'line-gradient')
                .attr('gradientUnits', 'userSpaceOnUse')
                .attr('x1', 0)
                .attr('y1', yScale(d3.min(attempts, d => d.timeSpent) || 0))
                .attr('x2', 0)
                .attr('y2', yScale(d3.max(attempts, d => d.timeSpent) || 0));
    
            // Add gradient stops
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', 'rgb(147, 51, 234)');
    
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', 'rgb(79, 70, 229)');
    
            // Add path for line
            svg.append('path')
                .datum(attempts)
                .attr('fill', 'none')
                .attr('stroke', 'url(#line-gradient)')
                .attr('stroke-width', 2)
                .attr('d', line);
    
            // Add points and performance indicators
            const points = svg.selectAll('g.point')
                .data(attempts)
                .enter()
                .append('g')
                .attr('class', 'point')
                .attr('transform', d => `translate(${xScale(d.questionIndex)},${yScale(d.timeSpent)})`);
    
            // Add circles for each point
            points.append('circle')
                .attr('r', 6)
                .attr('fill', d => d.isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
                .attr('stroke', 'white')
                .attr('stroke-width', 2);
    
            // Add tooltip for points
            points.append('title')
                .text(d => `Question ${d.questionIndex + 1} Time: ${d.timeSpent.toFixed(1)}s ${d.isCorrect ? '✓ Correct' : '✗ Incorrect'}`);
        }, [attempts]);

    return <svg ref={chartRef} className="w-full h-[200px] bg-white rounded-lg shadow-md" />;
};