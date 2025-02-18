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

interface HeatmapProps {
    results: QuizResult[];
}

const PerformanceHeatmap = ({ results }: HeatmapProps) => {
    const chartRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!chartRef.current || !results.length) return;

        d3.select(chartRef.current).selectAll('*').remove();

        // Improved dimensions
        const margin = { top: 40, right: 30, bottom: 40, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        const svg = d3.select(chartRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Improved data processing
        const dateData = d3.group(results, d => 
            d3.timeWeek.floor(new Date(d.created_at)).toISOString()
        );

        const dates = Array.from(dateData.keys()).map(d => new Date(d));
        const minDate = d3.min(dates) || new Date();
        const maxDate = d3.max(dates) || new Date();

        // Enhanced color scale with better gradients
        const colorScale = d3.scaleSequential()
            .domain([0, 100])
            .interpolator(d3.interpolateRgbBasis([
                '#fdf2ff', // Very light purple
                '#f0abfc', // Light purple
                '#d946ef', // Medium purple
                '#9333ea', // Strong purple
                '#6b21a8'  // Dark purple
            ]));

        // Improved scales
        const xScale = d3.scaleTime()
            .domain([d3.timeWeek.offset(minDate, -1), d3.timeWeek.offset(maxDate, 1)])
            .range([0, width]);

        // Calculate optimal cell dimensions
        const weeks = d3.timeWeek.count(minDate, maxDate) + 2;
        const cellWidth = Math.min(50, width / weeks);
        const cellHeight = cellWidth;

        // Create week groups
        const weekGroups = svg.selectAll('.week-group')
            .data(Array.from(dateData))
            .enter()
            .append('g')
            .attr('class', 'week-group')
            .attr('transform', d => `translate(${xScale(new Date(d[0]))}, 0)`);

        // Add cells with enhanced styling
        weekGroups.append('rect')
            .attr('width', cellWidth * 0.9)
            .attr('height', cellHeight)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', d => {
                const avgScore = d3.mean(d[1], r => r.percentage) || 0;
                return colorScale(avgScore);
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('transition', 'all 0.2s ease')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke', '#6b21a8')
                    .attr('stroke-width', 3)
                    .style('filter', 'drop-shadow(0 0 3px rgba(107, 33, 168, 0.3))');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2)
                    .style('filter', 'none');
            });

        // Enhanced tooltips
        weekGroups.append('title')
            .text(d => {
                const date = new Date(d[0]);
                const avgScore = d3.mean(d[1], r => r.percentage) || 0;
                const quizCount = d[1].length;
                return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Quizzes Taken: ${quizCount} Average Score: ${avgScore.toFixed(1)}%`;
            });

        // Improved x-axis
        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeWeek.every(1))
            .tickFormat(d => d3.timeFormat('%b %d')(d as Date));

        svg.append('g')
            .attr('transform', `translate(0,${cellHeight + 10})`)
            .call(xAxis)
            .selectAll('text')
            .style('font-size', '12px')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        // Enhanced legend
        const legendWidth = 200;
        const legendHeight = 10;
        const legendX = width - legendWidth - 10;

        const legend = svg.append('g')
            .attr('transform', `translate(${legendX},-30)`);

        // Gradient legend
        const defs = svg.append('defs');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('x2', '100%');

        linearGradient.selectAll('stop')
            .data([0, 25, 50, 75, 100])
            .enter()
            .append('stop')
            .attr('offset', d => `${d}%`)
            .attr('stop-color', d => colorScale(d));

        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .attr('fill', 'url(#legend-gradient)')
            .attr('rx', 2);

        // Legend labels
        const legendLabels = [0, 50, 100];
        legendLabels.forEach(value => {
            legend.append('text')
                .attr('x', (value * legendWidth) / 100)
                .attr('y', -5)
                .attr('text-anchor', value === 0 ? 'start' : value === 100 ? 'end' : 'middle')
                .style('font-size', '10px')
                .style('fill', '#666')
                .text(`${value}%`);
        });

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

export default PerformanceHeatmap;