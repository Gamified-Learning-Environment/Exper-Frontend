import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { QuestionAttempt } from '../types';

export const TimeAccuracyChart = ({ attempts }: { attempts: QuestionAttempt[] }) => {
    const chartRef = useRef<SVGSVGElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!chartRef.current || !attempts.length) return;
        
        // Get container width for responsive sizing
        const container = chartRef.current.parentElement;
        if (container) {
            setContainerWidth(container.clientWidth);
        }
        
        // Setup resize observer for responsiveness
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        
        if (container) {
            resizeObserver.observe(container);
        }
        
        return () => {
            if (container) {
                resizeObserver.unobserve(container);
            }
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current || !attempts.length || containerWidth === 0) return;

        // Clear previous chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Chart dimensions
        const margin = { top: 30, right: 30, bottom: 60, left: 60 };
        const width = containerWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select(chartRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Calculate average time
        const avgTime = d3.mean(attempts, d => d.timeSpent) || 0;

        // Create scales
        // Time scale for X axis
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(attempts, d => d.timeSpent) || 0])
            .range([0, width])
            .nice();

        // Question index for Y axis
        const yScale = d3.scaleLinear()
            .domain([0, attempts.length - 1])
            .range([0, height]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}s`));

        // X axis label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .style('font-size', '12px')
            .text('Time Spent (seconds)');

        // Add Y axis (question numbers)
        svg.append('g')
            .call(d3.axisLeft(yScale).ticks(attempts.length)
                .tickFormat(d => `Q${(+d) + 1}`));

        // Y axis label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -height / 2)
            .style('font-size', '12px')
            .text('Question Number');

        // Add vertical line for average time
        svg.append('line')
            .style('stroke', 'rgba(107, 114, 128, 0.5)')
            .style('stroke-dasharray', '5,5')
            .attr('x1', xScale(avgTime))
            .attr('y1', 0)
            .attr('x2', xScale(avgTime))
            .attr('y2', height);

        // Add label for average time
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', xScale(avgTime))
            .attr('y', -10)
            .style('font-size', '10px')
            .style('fill', 'rgb(107, 114, 128)')
            .text(`Average Time: ${avgTime.toFixed(1)}s`);

        // Add scatter plot points with animation
        const circles = svg.selectAll('circle')
            .data(attempts)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.timeSpent))
            .attr('cy', d => yScale(d.questionIndex))
            .attr('r', 0) // Start at 0 for animation
            .style('fill', d => d.isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
            .style('stroke', 'white')
            .style('stroke-width', 2)
            .style('opacity', 0.8);

        // Animate points
        circles.transition()
            .duration(800)
            .delay((_, i) => i * 80)
            .attr('r', 8);

        // Add tooltips
        circles.append('title')
            .text(d => `Question ${d.questionIndex + 1}
Time: ${d.timeSpent.toFixed(1)}s
${d.isCorrect ? '✓ Correct' : '✗ Incorrect'}
${d.timeSpent > avgTime ? 'Above avg time' : 'Below avg time'}`);

        // Add quadrant labels for insights
        const quadrantLabels = [
            { 
                x: width * 0.25, 
                y: height * 0.15, 
                text: "Fast & Correct ✓", 
                color: "rgb(34, 197, 94, 0.2)",
                visible: attempts.some(d => d.isCorrect && d.timeSpent <= avgTime)
            },
            { 
                x: width * 0.75, 
                y: height * 0.15, 
                text: "Slow & Correct ⏱️✓", 
                color: "rgb(34, 197, 94, 0.2)",
                visible: attempts.some(d => d.isCorrect && d.timeSpent > avgTime)
            },
            { 
                x: width * 0.25, 
                y: height * 0.85, 
                text: "Fast & Incorrect ⚠️", 
                color: "rgb(239, 68, 68, 0.2)",
                visible: attempts.some(d => !d.isCorrect && d.timeSpent <= avgTime)
            },
            { 
                x: width * 0.75, 
                y: height * 0.85, 
                text: "Slow & Incorrect ⏱️✗", 
                color: "rgb(239, 68, 68, 0.2)",
                visible: attempts.some(d => !d.isCorrect && d.timeSpent > avgTime)
            }
        ];

        // Add quadrant labels where there are data points
        quadrantLabels.forEach(label => {
            if (label.visible) {
                svg.append('rect')
                    .attr('x', label.x - 60)
                    .attr('y', label.y - 15)
                    .attr('width', 120)
                    .attr('height', 20)
                    .attr('rx', 4)
                    .attr('fill', label.color)
                    .style('opacity', 0)
                    .transition()
                    .duration(1000)
                    .style('opacity', 0.8);
                
                svg.append('text')
                    .attr('x', label.x)
                    .attr('y', label.y)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '10px')
                    .style('font-weight', 'bold')
                    .style('opacity', 0)
                    .text(label.text)
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
            }
        });
    }, [attempts, containerWidth]);

    return (
        <div className="flex justify-center w-full overflow-x-auto">
            <svg 
                ref={chartRef}
                className="w-full h-[300px] min-w-[300px]"
            />
        </div>
    );
};