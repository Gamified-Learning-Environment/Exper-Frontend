import { QuestionTypeBreakdownProps } from '../types';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const QuestionTypeBreakdown = ({ questions, selectedAnswers }: QuestionTypeBreakdownProps) => {

    const chartRef = useRef<SVGSVGElement>(null);
    
        useEffect(() => {
            if (!chartRef.current || !questions.length) return;
    
            // Clear previous chart
            d3.select(chartRef.current).selectAll('*').remove();
    
            // Calculate stats by question type
            const stats = {
                multipleChoice: { correct: 0, total: 0 },
                singleChoice: { correct: 0, total: 0 }
            };
    
            questions.forEach((question, index) => {
                const type = question.isMultiAnswer ? 'multipleChoice' : 'singleChoice';
                stats[type].total++;
    
                const isCorrect = question.isMultiAnswer
                    ? (Array.isArray(selectedAnswers[index]) &&
                       Array.isArray(question.correctAnswer) &&
                       question.correctAnswer.length === selectedAnswers[index].length &&
                       question.correctAnswer.every(ans => selectedAnswers[index].includes(ans)))
                    : selectedAnswers[index] === question.correctAnswer;
    
                if (isCorrect) stats[type].correct++;
            });
    
            // Prepare data for donut chart
            const data = [
                { type: 'Multiple Choice', correct: stats.multipleChoice.correct, total: stats.multipleChoice.total },
                { type: 'Single Choice', correct: stats.singleChoice.correct, total: stats.singleChoice.total }
            ].filter(d => d.total > 0);
    
            // Chart dimensions
            const margin = { top: 20, right: 80, bottom: 20, left: 20 };
            const width = 300 - margin.left - margin.right;
            const height = 200 - margin.top - margin.bottom;
            const radius = Math.min(width, height) / 2;
    
            // Create SVG
            const svg = d3.select(chartRef.current)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${width/2 + margin.left},${height/2 + margin.top})`);
    
            // Color scale
            const colorScale = d3.scaleOrdinal<string>()
                .domain(['correct', 'incorrect'])
                .range(['rgb(147, 51, 234)', 'rgb(233, 213, 255)']);
    
            // Arc generator
            const arc = d3.arc()
                .innerRadius(radius * 0.6)
                .outerRadius(radius);
    
            // Pie generator
            const pie = d3.pie<any>()
                .value(d => d.total)
                .sort(null);
    
            // Slices
            const slices = svg.selectAll('path')
                .data(pie(data))
                .enter()
                .append('g')
                .attr('class', 'slice');
    
            slices.append('path')
                .attr('d', arc as any)
                .attr('fill', (d, i) => d3.rgb(colorScale('correct')).brighter(i * 0.5).toString())
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .style('transition', 'all 0.3s ease')
                .on('mouseover', function() {
                    d3.select(this)
                        .attr('transform', 'scale(1.05)')
                        .style('filter', 'drop-shadow(0 0 5px rgba(0,0,0,0.2))');
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .attr('transform', 'scale(1)')
                        .style('filter', 'none');
                });
    
            // Percentage labels
            slices.append('text')
                .attr('transform', d => `translate(${arc.centroid(d as any)})`)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .text(d => {
                    const percentage = (d.data.correct / d.data.total * 100).toFixed(0);
                    return `${percentage}%`;
                });
    
            // Legend
            const legend = svg.append('g')
                .attr('transform', `translate(${radius + 20},-${radius/2})`);
    
            data.forEach((d, i) => {
                const legendRow = legend.append('g')
                    .attr('transform', `translate(0,${i * 25})`);
    
                legendRow.append('rect')
                    .attr('width', 12)
                    .attr('height', 12)
                    .attr('fill', d3.rgb(colorScale('correct')).brighter(i * 0.5).toString())
                    .attr('rx', 2);
    
                legendRow.append('text')
                    .attr('x', 20)
                    .attr('y', 10)
                    .attr('font-size', '12px')
                    .text(`${d.type} (${d.correct}/${d.total})`);
            });
    
        }, [questions, selectedAnswers]);
    
        return (
            <div className="flex justify-center">
                <svg 
                    ref={chartRef} 
                    className="w-[350px] h-full"
                />
            </div>
        );

    };