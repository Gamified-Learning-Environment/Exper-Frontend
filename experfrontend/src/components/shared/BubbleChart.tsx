'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BubbleData {
    category: string;
    count: number;
}

interface HierarchyData {
    children: BubbleData[];
}

interface BubbleChartProps {
    data: BubbleData[];
    onBubbleClick?: (category: string) => void;
}

const BubbleChart = ({ data, onBubbleClick }: BubbleChartProps) => {
    const chartRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!chartRef.current || !data.length) return;

        const svgElement = chartRef.current;
        const width = svgElement.clientWidth;
        const height = svgElement.clientHeight || 450; // Use the container's height

        // Clear existing chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Create SVG container
        const svg = d3.select(chartRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width/2},${height/2})`);

        // Process data for bubble layout
        const root = d3.hierarchy<HierarchyData>({ children: data })
            .sum((d) => (d as unknown as BubbleData).count);

        const pack = d3.pack<HierarchyData>()
            .size([width * 0.95, height])
            .padding(3);

        const nodes = pack(root).leaves();

        // Color scale
        const color = d3.scaleOrdinal(d3.schemeSet3);

        // Create bubble groups
        const bubbles = svg.selectAll('.bubble')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'bubble')
            .attr('transform', d => `translate(${d.x - width/2},${d.y - height/2})`);

        // Add bubbles
        bubbles.append('circle')
            .attr('r', d => d.r)
            .style('fill', (_, i) => color(i.toString()))
            .style('opacity', 0.7)
            .style('stroke', 'white')
            .style('stroke-width', 2)
            .style('cursor', 'pointer') // Add pointer cursor
            .on('click', (event, d) => {
                const node = d.data as unknown as BubbleData;
                onBubbleClick?.(node.category);
            })
            .on('mouseover', function() {
                d3.select(this)
                    .style('opacity', 1)
                    .style('stroke', '#666');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .style('opacity', 0.7)
                    .style('stroke', 'white');
            });

        // Add labels
        bubbles.append('text')
            .attr('dy', '.3em')
            .style('text-anchor', 'middle')
            .style('font-size', d => `${d.r/4}px`)
            .style('fill', '#333')
            .text(d => {
                const node = d.data as unknown as BubbleData;
                return d.r > 15 ? node.category : '';
            });

        // Add count labels
        bubbles.append('text')
            .attr('dy', '1.3em')
            .style('text-anchor', 'middle')
            .style('font-size', d => `${d.r/5}px`)
            .style('fill', '#666')
            .text(d => {
                const node = d.data as unknown as BubbleData;
                return d.r > 15 ? `${node.count} quizzes` : '';
            });

        // Add tooltips
        bubbles.append('title')
            .text(d => {
                const node = d.data as unknown as BubbleData;
                return `${node.category}: ${node.count} quizzes completed`;
            });

    }, [data, chartRef.current?.clientWidth, chartRef.current?.clientHeight]);

    return (
        <svg 
            ref={chartRef}
            className="w-full h-full bg-white rounded-lg shadow-sm"
        />
    );
};

export default BubbleChart;
