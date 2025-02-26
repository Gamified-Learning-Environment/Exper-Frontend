'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WinLossRatioChartProps {
  score: number;
  totalQuestions: number;
  winThreshold?: number; // Percentage threshold for considering it a "win"
  lossThreshold?: number; // Percentage threshold below which it's a "loss"
}

export const WinLossRatioChart = ({ 
  score, 
  totalQuestions,
  winThreshold = 70, // Default: 70%+ is a win
  lossThreshold = 40 // Default: Below 40% is a loss
}: WinLossRatioChartProps) => {
  const chartRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    // Calculate percentage
    const percentage = (score / totalQuestions) * 100;
    
    // Determine result category
    let result = 'Neutral';
    let resultColor = 'rgb(234, 179, 8)'; // Yellow for neutral
    
    if (percentage >= winThreshold) {
      result = 'Win';
      resultColor = 'rgb(34, 197, 94)'; // Green for win
    } else if (percentage < lossThreshold) {
      result = 'Loss';
      resultColor = 'rgb(239, 68, 68)'; // Red for loss
    }
    
    // Chart dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 300 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);
    
    // Data for pie chart
    const data = [
      { category: 'Score', value: score, color: resultColor },
      { category: 'Remaining', value: totalQuestions - score, color: '#e2e8f0' } // Light gray
    ];
    
    // Pie generator
    const pie = d3.pie<any>()
      .value(d => d.value)
      .sort(null);
    
    // Arc generator
    const arc = d3.arc()
      .innerRadius(radius * 0.6) // Donut chart style
      .outerRadius(radius);
    
    // Pie slices
    const slices = svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');
    
    // Coloured arc paths with animation
    slices.append('path')
      .attr('d', arc as any)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);
    
    // Percentage in the center
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.1em')
      .style('font-size', '2.5rem')
      .style('font-weight', 'bold')
      .style('fill', resultColor)
      .text(`${Math.round(percentage)}%`);
    
    // Result label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '2em')
      .style('font-size', '1.2rem')
      .style('font-weight', 'medium')
      .style('fill', 'rgb(107, 114, 128)')
      .text(result);
    
    // Icon based on result
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-1.8em')
      .style('font-size', '2rem')
      .text(result === 'Win' ? '🏆' : result === 'Loss' ? '😢' : '🏅');
      
  }, [score, totalQuestions, winThreshold, lossThreshold]);
  
  return (
    <div className="flex justify-center">
      <svg 
        ref={chartRef}
        className="w-full max-w-[300px] h-[300px]"
      />
    </div>
  );
};