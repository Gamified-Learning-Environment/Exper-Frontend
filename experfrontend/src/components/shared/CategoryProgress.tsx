'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card } from '../ui/card';
import { useAuth } from '@/contexts/auth.context';

interface QuizResult {
    _Id: string;
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    created_at: string;
    category?: string; // Add category field
}

interface CategoryProgressProps {
    category: string;
}

const CategoryProgress = ({ category }: CategoryProgressProps) => {
    const ChartRef = useRef<SVGSVGElement>(null);
    const { user } = useAuth();
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!user?._id) return;

            try {
                const response = await fetch(`http://localhost:8070/api/results/user/${user._id}`);
                if (!response.ok) throw new Error('Failed to fetch results');
                
                const data = await response.json();
                // Filter results by category and sort by date
                const categoryResults = data
                    .filter((result: QuizResult) => result.category === category)
                    .sort((a: QuizResult, b: QuizResult) => 
                        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    );

                setResults(categoryResults);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user?._id, category]);

    useEffect(() => {
        if (!ChartRef.current || !results.length) return;

        // Clear existing chart
        d3.select(ChartRef.current).selectAll('*').remove();

        // Chart dimensions
        const margin = { top: 20, right: 50, bottom: 40, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select(ChartRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Create scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(results, d => new Date(d.created_at)) as [Date, Date])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0])
            .nice();

        // Line generator
        const line = d3.line<QuizResult>()
            .x(d => xScale(new Date(d.created_at)))
            .y(d => yScale(d.percentage))
            .curve(d3.curveMonotoneX);

        // Add gradient
        const gradient = svg.append('linearGradient')
            .attr('id', 'line-gradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('y1', yScale(0))
            .attr('x2', 0)
            .attr('y2', yScale(100));

        // Add gradient stops
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgb(147, 51, 234)');

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgb(79, 70, 229)');

        // Add the line path
        svg.append('path')
            .datum(results)
            .attr('fill', 'none')
            .attr('stroke', 'url(#line-gradient)')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add points
        svg.append('circle')
            .data(results)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(new Date(d.created_at)))
            .attr('cy', d => yScale(d.percentage))
            .attr('r', 6)
            .attr('fill', d => d.percentage >= 70 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // Axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeDay.every(1))
            .tickFormat(d3.timeFormat('%b %d'));

        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        svg.append('g')
            .call(d3.axisLeft(yScale));
                .tickFormat(d => `${d}%`);

        // Labels
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + margin.top - 5)
            .attr('x', -height / 2)
            .attr('y', -margin.left + 15)
            .attr('text-anchor', 'middle')
            .attr('fill', 'currentColor')
            .text('Score Percentage');

        // Tooltips
        svg.selectAll('circle')
            .append('title')
            .text(d => `Score: ${d.percentage}%\nDate: ${new Date(d.created_at).toLocaleDateString()}`);

    }, [results]);

    return (
        <Card className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-purple-800">
                Progress in {category}
            </h3>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            {!loading && !error && results.length === 0 && (
                <div className="text-gray-500">No quiz results found for this category</div>
            )}
            <div className="w-full overflow-x-auto">
                <svg 
                    ref={chartRef} 
                    className="w-full min-w-[800px] h-[400px] bg-white rounded-lg shadow-md"
                />
            </div>
            {results.length > 0 && (
                <div className="text-sm text-gray-600 text-center">
                    Average Score: {Math.round(d3.mean(results, d => d.percentage) || 0)}%
                </div>
            )}
        </Card>
    );

};