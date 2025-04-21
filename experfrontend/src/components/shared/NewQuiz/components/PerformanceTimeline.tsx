// PerformanceTimeline component showing score momentum throughout the quiz
import { QuestionTypeBreakdownProps, QuestionAttempt } from '../types';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export const PerformanceTimeline = ({ attempts }: { attempts: QuestionAttempt[] }) => {
    const chartRef = useRef<SVGSVGElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!chartRef.current) return;
        
        // Get container width for responsive sizing
        const container = chartRef.current.parentElement;
        if (container) {
            setContainerWidth(container.clientWidth);
        }
        
        // Setup resize observer
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
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = containerWidth - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select(chartRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Calculate cumulative scores
        const cumulativeScoreData = attempts.map((attempt, index) => {
            // Count correct answers up to this point
            const correctAnswersSoFar = attempts
                .slice(0, index + 1)
                .filter(a => a.isCorrect)
                .length;
                
            return {
                question: index + 1,
                cumulativeScore: correctAnswersSoFar,
                isCorrect: attempt.isCorrect,
                percentage: (correctAnswersSoFar / (index + 1)) * 100
            };
        });

        // Calculate perfect score line data
        const perfectScoreData = cumulativeScoreData.map((_, i) => ({
            question: i + 1,
            cumulativeScore: i + 1
        }));

        // Scales
        const xScale = d3.scaleLinear()
            .domain([1, attempts.length])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, attempts.length])
            .range([height, 0])
            .nice();

        // Percentage scale for color gradient
        const percentageColorScale = d3.scaleLinear<string>()
            .domain([0, 50, 100])
            .range(['#ef4444', '#eab308', '#22c55e']);

        // X axis with question numbers
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .ticks(Math.min(attempts.length, width > 500 ? 10 : 5))
                .tickFormat(d => `Q${d}`));
            
        // X-axis label
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 35)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('Question Number');

        // Y axis
        svg.append('g')
            .call(d3.axisLeft(yScale)
                .ticks(Math.min(attempts.length, 10)));
                
        // Y-axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -30)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('Cumulative Correct Answers');

        // Grid lines
        svg.append('g')
            .attr('class', 'grid')
            .attr('opacity', 0.1)
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat(() => ''));

        // Create line generators
        const userScoreLine = d3.line<any>()
            .x(d => xScale(d.question))
            .y(d => yScale(d.cumulativeScore))
            .curve(d3.curveMonotoneX);
            
        const perfectScoreLine = d3.line<any>()
            .x(d => xScale(d.question))
            .y(d => yScale(d.cumulativeScore))
            .curve(d3.curveMonotoneX);

        // Add perfect score line (dashed)
        svg.append('path')
            .datum(perfectScoreData)
            .attr('fill', 'none')
            .attr('stroke', '#d1d5db')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('d', perfectScoreLine);
            
        // Add "Perfect Score" label
        svg.append('text')
            .attr('x', width - 5)
            .attr('y', 15)
            .attr('text-anchor', 'end')
            .attr('font-size', '10px')
            .attr('fill', '#9ca3af')
            .text('Perfect Score');

        // Create gradient for user score line
        const gradient = svg.append('linearGradient')
            .attr('id', 'score-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('x2', width);

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#8b5cf6');

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#6366f1');

        // Add user score line with animation
        const path = svg.append('path')
            .datum(cumulativeScoreData)
            .attr('fill', 'none')
            .attr('stroke', 'url(#score-gradient)')
            .attr('stroke-width', 3)
            .attr('d', userScoreLine);

        // Animate path
        const totalLength = path.node()?.getTotalLength() || 0;
        path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(1500)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);

        // Add points with animation
        const points = svg.selectAll('.point')
            .data(cumulativeScoreData)
            .enter()
            .append('g')
            .attr('class', 'point')
            .attr('transform', d => `translate(${xScale(d.question)},${yScale(d.cumulativeScore)})`);

        points.append('circle')
            .attr('r', 0)
            .attr('fill', d => d.isCorrect ? '#22c55e' : '#ef4444')
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .transition()
            .delay((_, i) => i * 200 + 1000)
            .duration(300)
            .attr('r', 6);

        // Add tooltips to points
        points.append('title')
            .text(d => `Question ${d.question}
Score: ${d.cumulativeScore}/${d.question}
Accuracy: ${d.percentage.toFixed(1)}%
${d.isCorrect ? '✓ Correct' : '✗ Incorrect'}`);

        // Add final score indicator
        if (cumulativeScoreData.length > 0) {
            const finalScore = cumulativeScoreData[cumulativeScoreData.length - 1];
            const finalPercentage = (finalScore.cumulativeScore / attempts.length) * 100;
            
            svg.append('text')
                .attr('x', width - 5)
                .attr('y', 35)
                .attr('text-anchor', 'end')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', percentageColorScale(finalPercentage))
                .text(`Final Score: ${finalScore.cumulativeScore}/${attempts.length} (${finalPercentage.toFixed(0)}%)`)
                .style('opacity', 0)
                .transition()
                .delay(1800)
                .duration(500)
                .style('opacity', 1);
        }

    }, [attempts, containerWidth]);

    return (
        <div className="flex w-full justify-center overflow-x-auto">
            <svg 
                ref={chartRef}
                className="w-full h-[250px] min-w-[300px]"
            />
        </div>
    );
};