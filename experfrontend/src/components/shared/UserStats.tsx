'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import * as d3 from 'd3';

interface QuizResult {
    quizId: string;
    userId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    created_at: string;
}

export default function UserStats() {
    const { user } = useAuth();
    const [results, setResults] = useState<QuizResult[]>([]);
    const chartRef = useRef(null);

    const placeholderData: QuizResult[] = [
        {
          quizId: "quiz1",
          userId: "user1",
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          created_at: "2024-01-01T12:00:00.000Z"
        },
        {
          quizId: "quiz1",
          userId: "user1",
          score: 9,
          totalQuestions: 10,
          percentage: 90,
          created_at: "2024-01-02T12:00:00.000Z"
        },
        {
          quizId: "quiz2",
          userId: "user1",
          score: 7,
          totalQuestions: 10,
          percentage: 70,
          created_at: "2024-01-01T12:00:00.000Z"
        },
        {
          quizId: "quiz2",
          userId: "user1",
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          created_at: "2024-01-02T12:00:00.000Z"
        }
      ];

    
    useEffect(() => {
        setResults(placeholderData);
    }, []);

    /*
    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch(`http://localhost:8070/api/results/user/${user?.id}`);
                if (!response.ok) throw new Error('Failed to fetch results');
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error('Error fetching results:', error);
            }
        };

        if (user) {
            fetchResults();
        }
    }, [user]);*/

    useEffect(() => {
        if (results.length > 0 && chartRef.current) {
            // Debugging output
            console.log('Results:', results);
            // Clear previous chart
            d3.select(chartRef.current).selectAll('*').remove();

            // Chart dimensions
            const margin = { top: 40, right: 120, bottom: 50, left: 60 };
            const width = 800 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            // Create SVG container
            const svg = d3.select(chartRef.current)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .style('overflow', 'visible')
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Group results by quizId
            const quizGroups = d3.group(results, d => d.quizId);
            
            // Create color scale for different quizzes
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

            // Create scales
            const xScale = d3.scaleTime()
                .domain(d3.extent(results, d => new Date(d.created_at)) as [Date, Date])
                .range([0, width]);

            const yScale = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0])
                .nice();

            // Add X axis
            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale))
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-45)');

            // Add Y axis
            svg.append('g')
                .call(d3.axisLeft(yScale));

            // Create line generator
            const line = d3.line<QuizResult>()
                .defined(d => !isNaN(d.percentage))
                .x(d => xScale(new Date(d.created_at)))
                .y(d => yScale(d.percentage));

            // Add lines for each quiz
            quizGroups.forEach((quizResults, quizId) => {
                // Debugging line drawing
                console.log('Drawing line for quiz:', quizId, quizResults);

                const path = svg.append('path')
                    .datum(quizResults)
                    .attr('class', 'line')
                    .attr('d', line)
                    .style('fill', 'none')
                    .style('stroke', colorScale(quizId))
                    .style('stroke-width', 2);
                    
                // Add dots for data points
                svg.selectAll(`dot-${quizId}`)
                    .data(quizResults)
                    .enter()
                    .append('circle')
                    .attr('cx', d => xScale(new Date(d.created_at)))
                    .attr('cy', d => yScale(d.percentage))
                    .attr('r', 4)
                    .style('fill', colorScale(quizId));

                console.log('Path created:', path.node());
            });

            // Add chart title
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -margin.top / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '16px')
                .text('Quiz Performance Over Time');

            // Add axis labels
            svg.append('text')
                .attr('x', -(height / 2))
                .attr('y', -margin.left + 20)
                .attr('transform', 'rotate(-90)')
                .attr('text-anchor', 'middle')
                .text('Score Percentage (%)');

            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height + margin.bottom - 10)
                .attr('text-anchor', 'middle')
                .text('Date');

            // Add legend
            const legend = svg.append('g')
                .attr('class', 'legend')
                .attr('transform', `translate(${width + 10}, 0)`);

            Array.from(quizGroups.entries()).forEach(([quizId, _], i) => {
                const legendItem = legend.append('g')
                    .attr('transform', `translate(0, ${i * 20})`);

                legendItem.append('rect')
                    .attr('width', 10)
                    .attr('height', 10)
                    .style('fill', colorScale(quizId));

                legendItem.append('text')
                    .attr('x', 20)
                    .attr('y', 10)
                    .text(`Quiz ${quizId.slice(-4)}`);
            });
        }
    }, [results]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-purple-800">Your Performance</h2>
            <div ref={chartRef} className="bg-white p-4 rounded-xl shadow-md w-full h-[500px]" />
            
            {/* Additional stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="font-semibold text-purple-600">Average Score</h3>
                    <p className="text-2xl">
                        {results.length > 0 
                            ? `${Math.round(d3.mean(results, d => d.percentage) || 0)}%`
                            : 'N/A'}
                    </p>
                </div>
                {/* Add more stat cards */}
            </div>
        </div>
    );
}