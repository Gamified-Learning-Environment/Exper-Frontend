'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card } from '../ui/card';
import { useAuth } from '@/contexts/auth.context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import BubbleChart from './BubbleChart';
import PerformanceHeatmap from './PerformanceHeatmap';
import RadarChart from './RadarChart';
import BoxPlot from './BoxPlot';

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

const CategoryProgress = () => {
    const chartRef = useRef<SVGSVGElement>(null);
    const { user } = useAuth();
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [bubbleData, setBubbleData] = useState<{ category: string; count: number; }[]>([]);

    // Helper function to calculate standard deviation
    const calculateStandardDeviation = (values: number[]): number => {
        const mean = d3.mean(values) || 0;
        const variance = d3.mean(values.map(x => Math.pow(x - mean, 2))) || 0;
        return Math.sqrt(variance);
    };

    // Calculate consistency based on standard deviation of scores
    const calculateConsistency = (results: QuizResult[]): number => {
        if (results.length < 2) return 0;
        const scores = results.map(r => r.percentage);
        const stdDev = calculateStandardDeviation(scores);
        // Convert stdDev to a 0-100 scale where lower stdDev means higher consistency
        // Max stdDev we consider is 50 (very inconsistent)
        const consistency = Math.max(0, 100 - (stdDev * 2));
        return Math.round(consistency);
    };

    // Calculate improvement rate based on score progression
    const calculateImprovementRate = (results: QuizResult[]): number => {
        if (results.length < 2) return 0;
        
        // Sort results by date
        const sortedResults = [...results].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Calculate moving average to smooth out fluctuations
        const windowSize = 3;
        const movingAverages = sortedResults.map((_, i) => {
            const window = sortedResults.slice(Math.max(0, i - windowSize + 1), i + 1);
            return d3.mean(window.map(r => r.percentage)) || 0;
        });

        // Calculate overall improvement
        const firstAvg = movingAverages[0];
        const lastAvg = movingAverages[movingAverages.length - 1];
        const improvement = ((lastAvg - firstAvg) / firstAvg) * 100;
        
        // Convert to 0-100 scale, considering 50% improvement as maximum
        return Math.round(Math.min(100, Math.max(0, improvement * 2)));
    };

    // Calculate completion rate
    const calculateCompletionRate = (results: QuizResult[]): number => {
        if (results.length === 0) return 0;
        
        // Calculate completion rate based on questions attempted vs questions available
        const questionsCompleted = results.reduce((sum, result) => 
            sum + result.totalQuestions, 0
        );
        
        // Assuming a target of 100 questions per category
        const targetQuestions = 100;
        
        // Convert to percentage, cap at 100
        return Math.min(100, Math.round((questionsCompleted / targetQuestions) * 100));
    };

    // Process data for bubble chart
    useEffect(() => {
        if (!user?._id) return;
        
        const fetchAllCategoryData = async () => {
            try {
                // Fetch results for all categories
                const categoryPromises = categories.map(category =>
                    fetch(`http://localhost:8070/api/results/category/${user._id}/${category}`)
                        .then(res => res.json())
                );
                
                const allResults = await Promise.all(categoryPromises);
                
                // Process data for bubble chart
                const bubbleData = categories.map((category, index) => ({
                    category,
                    count: allResults[index].length
                }));
                
                setBubbleData(bubbleData);
            } catch (error) {
                console.error('Error fetching bubble chart data:', error);
            }
        };

        if (categories.length > 0) {
            fetchAllCategoryData();
        }
    }, [categories, user?._id]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:9090/api/categories');
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                setCategories(data);
                if (data.length > 0) {
                    setSelectedCategory(data[0]); // Set first category as default
                }
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch categories');
            }
        };

        fetchCategories();
    }, []);

    // Fetch results for selected category
    useEffect(() => {
        const fetchResults = async () => {
            if (!user?._id || !selectedCategory) return;
            setLoading(true);

            try {
                const response = await fetch(`http://localhost:8070/api/results/category/${user._id}/${selectedCategory}`);
                if (!response.ok) throw new Error('Failed to fetch results');
                const data = await response.json();
                setResults(data);
                setError(null);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user?._id, selectedCategory]);

    // D3 chart rendering
    useEffect(() => {
        if (!chartRef.current || !results.length) return;

        // Clear existing chart
        d3.select(chartRef.current).selectAll('*').remove();

        // Chart dimensions
        const margin = { top: 20, right: 50, bottom: 60, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select(chartRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Sort results by date
        const sortedResults = [...results].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Create scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(sortedResults, d => new Date(d.created_at)) as [Date, Date])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0])
            .nice();

        // Line generator
        const line = d3.line<QuizResult>()
            .defined(d => !isNaN(d.percentage) && d.percentage !== null) // Handle missing or invalid values
            .x(d => xScale(new Date(d.created_at)))
            .y(d => yScale(d.percentage))
            .curve(d3.curveMonotoneX);

        // Add gradient
        const gradient = svg.append('linearGradient')
            .attr('id', `line-gradient-${selectedCategory}`)
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

        // Line path
        svg.append('path')
            .datum(sortedResults.filter(d => d.percentage !== null && !isNaN(d.percentage)))
            .attr('fill', 'none')
            .attr('stroke', `url(#line-gradient-${selectedCategory})`)
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add the line path
        svg.selectAll('circle')
            .data(sortedResults)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(new Date(d.created_at)))
            .attr('cy', d => yScale(d.percentage))
            .attr('r', 6)
            .attr('fill', d => d.percentage >= 70 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)')
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .append('title')
            .text(d => `Score: ${d.percentage}%\nDate: ${new Date(d.created_at).toLocaleDateString()}`);

        // Axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));

        // Add gridlines
        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .ticks(5)
                .tickSize(-height)
                .tickFormat(() => '')
            )
            .style('stroke-dasharray', '3,3')
            .style('stroke-opacity', 0.2);

        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .ticks(5)
                .tickSize(-width)
                .tickFormat(() => '')
            )
            .style('stroke-dasharray', '3,3')
            .style('stroke-opacity', 0.2);

        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        svg.append('g')
            .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));

    }, [results, selectedCategory]);

    return (
        <Card className="p-6 space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-bold text-purple-800">
                    Quiz Progress Tracker
                </h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px] bg-white border-2 border-purple-200 hover:border-purple-400 transition-all">
                        <SelectValue placeholder="Choose Category 📚" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem 
                                key={category} 
                                value={category}
                                className="flex items-center gap-2"
                            >
                                <span>📚</span> {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading && (
                <div className="flex justify-center items-center h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                </div>
            )}
            
            {error && (
                <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-200">
                    Error: {error}
                </div>
            )}
            
            {!loading && !error && results.length === 0 && (
                <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg">
                    No quiz results found for {selectedCategory}
                </div>
            )}
            
            {!loading && !error && results.length > 0 && bubbleData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Progress Tracker Line Chart */}
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-xl font-bold text-purple-800">
                            Progress Timeline
                        </h3>
                        <div className="w-full overflow-x-auto">
                            <svg ref={chartRef} className="w-full min-w-[800px] h-[400px] bg-white rounded-lg shadow-md" />
                        </div>
                    </div>

                    {/* Quiz Completion Overview */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-purple-800">
                            Quiz Completion Overview
                        </h3>
                        <BubbleChart data={bubbleData} />
                    </div>

                    {/* Performance Analysis */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-purple-800">
                            Performance Analysis
                        </h3>
                        <RadarChart data={[
                            { metric: "Accuracy", value: Math.round(d3.mean(results, d => d.percentage) || 0) },
                            { metric: "Consistency", value: calculateConsistency(results) },
                            { metric: "Improvement", value: calculateImprovementRate(results) },
                            { metric: "Completion", value: calculateCompletionRate(results) }
                        ]} />
                    </div>

                    {/* Performance Heatmap */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-purple-800">
                            Performance Heatmap
                        </h3>
                        <PerformanceHeatmap results={results} />
                    </div>

                    {/* Score Distribution */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-purple-800">
                            Score Distribution
                        </h3>
                        <BoxPlot results={results} />
                        <div className="text-sm text-gray-600 text-center">
                            Box plot showing score distribution with quartiles, median, and outliers
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CategoryProgress;