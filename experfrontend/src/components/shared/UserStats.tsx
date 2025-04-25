'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface QuizResult {
    _Id: string;
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    created_at: string;
}

interface UserStatsProps {
    userId: string;
}

export default function UserStats({userId}: UserStatsProps ) {
    const [results, setResults] = useState<QuizResult[]>([]);
    const chartRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const placeholderData: QuizResult[] = [
        {
          _Id: "1",
          quizId: "quiz1",
          userId: "user1",
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          created_at: "2024-01-01T12:00:00.000Z"
        },
        {
          _Id: "2",
          quizId: "quiz1",
          userId: "user1",
          score: 9,
          totalQuestions: 10,
          percentage: 90,
          created_at: "2024-01-02T12:00:00.000Z"
        },
        {
          _Id: "3",
          quizId: "quiz2",
          userId: "user1",
          score: 7,
          totalQuestions: 10,
          percentage: 70,
          created_at: "2024-01-01T12:00:00.000Z"
        },
        {
          _Id: "4",
          quizId: "quiz2",
          userId: "user1",
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          created_at: "2024-01-02T12:00:00.000Z"
        },
        {
          _Id: "5",
          quizId: "quiz2",
          userId: "user1",
          score: 9,
          totalQuestions: 10,
          percentage: 90,
          created_at: "2024-01-03T12:00:00.000Z"
        }
      ];
    
    useEffect(() => {
        // Fetch results for the current
        console.log('Fetching results...');
        const fetchResults = async () => {
            if (!userId) {
                console.log('No user ID found');
                return;
            }
      
            try {
                console.log('Fetching results for user:', userId);
                const baseUrl = process.env.NEXT_PUBLIC_RESULTS_SERVICE_URL || 'http://localhost:8070';
                const response = await fetch(`${baseUrl}/api/results/user/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch results');
                
                const data = await response.json();
                // Calculate percentage if not provided
                const processedData = data.map((result: QuizResult) => ({
                ...result,
                percentage: result.percentage || (result.score / result.totalQuestions * 100)
                }));

                console.log('Processed data:', processedData);
                setResults(processedData);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [userId]);

    useEffect(() => {
        if (!results.length || !chartRef.current) return;

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
            .x(d => xScale(new Date(d.created_at)))
            .y(d => yScale(d.percentage));

        // Add lines for each quiz
        quizGroups.forEach((quizResults, quizId) => {
            // Sort results by date
            const sortedResults = quizResults.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
        
            // Add the line
            svg.append('path')
              .datum(sortedResults)
              .attr('fill', 'none')
              .attr('stroke', colorScale(quizId))
              .attr('stroke-width', 2)
              .attr('d', line);
        
            // Add points
            svg.selectAll(`dot-${quizId}`)
              .data(sortedResults)
              .enter()
              .append('circle')
              .attr('cx', d => xScale(new Date(d.created_at)))
              .attr('cy', d => yScale(d.percentage))
              .attr('r', 4)
              .style('fill', colorScale(quizId));
          });

          


    }, [results]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-purple-800">Your Performance History</h2>
            
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">Error: {error}</div>}
            
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
            </div>
        </div>
    );
}