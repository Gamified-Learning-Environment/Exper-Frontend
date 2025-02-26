'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RadarDataPoint {
  metric: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  maxValue?: number;
}

const RadarChart = ({ data, maxValue = 100 }: RadarChartProps) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Clear existing chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Chart dimensions
    const margin = { top: 10, right: 30, bottom: 10, left: 30 };
    const containerWidth = chartRef.current?.clientWidth || 300;
    const width = containerWidth - margin.left - margin.right;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 20;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${(width + margin.left + margin.right) / 2},${(height + margin.top + margin.bottom) / 2})`);

    // Scale for radius
    const rScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, radius]);

    // Angle for each metric
    const angleSlice = (Math.PI * 2) / data.length;

    // Create axes
    const axes = data.map((_, i) => ({
      angle: angleSlice * i - Math.PI / 2
    }));

    // Draw circular grid
    const levels = 5;
    const gridCircles = svg.selectAll('.grid-circle')
      .data(d3.range(1, levels + 1))
      .enter()
      .append('circle')
      .attr('class', 'grid-circle')
      .attr('r', d => radius * d / levels)
      .style('fill', 'none')
      .style('stroke', 'rgb(203, 213, 225)')
      .style('stroke-dasharray', '4,4');

    // Draw axes
    const axisLines = svg.selectAll('.axis-line')
      .data(axes)
      .enter()
      .append('line')
      .attr('class', 'axis-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d) => radius * Math.cos(d.angle))
      .attr('y2', (d) => radius * Math.sin(d.angle))
      .style('stroke', 'rgb(203, 213, 225)')
      .style('stroke-width', '1px');

    // Draw labels
    const labels = svg.selectAll('.axis-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', (_, i) => (radius + 20) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (_, i) => (radius + 20) * Math.sin(angleSlice * i - Math.PI / 2))
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'rgb(107, 114, 128)')
      .text(d => d.metric);

    // Create the points for the radar
    const radarPoints = data.map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const value = rScale(d.value);
      return {
        x: value * Math.cos(angle),
        y: value * Math.sin(angle)
      };
    });

    // Draw the radar shape
    const radarLine = d3.lineRadial<{ value: number }>()
      .radius(d => rScale(d.value))
      .angle((_, i) => i * angleSlice);

    const radarPath = svg.append('path')
      .datum(data)
      .attr('class', 'radar-path')
      .attr('d', radarLine as any)
      .style('fill', 'rgb(147, 51, 234)')
      .style('fill-opacity', 0.3)
      .style('stroke', 'rgb(147, 51, 234)')
      .style('stroke-width', '2px');

    // Add data points
    const points = svg.selectAll('.radar-point')
      .data(radarPoints)
      .enter()
      .append('circle')
      .attr('class', 'radar-point')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 5)
      .style('fill', 'rgb(147, 51, 234)')
      .style('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5);
      });

    // Add tooltips
    points.append('title')
      .text((_, i) => `${data[i].metric}: ${data[i].value}%`);

  }, [data, maxValue, chartRef.current?.clientWidth]);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={chartRef}
        className="w-full bg-white rounded-lg shadow-md p-4"
      />
    </div>
  );
};

export default RadarChart;