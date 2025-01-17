/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, RefreshCw, MessageCircle, TrendingUp, TrendingDown, Globe } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIInsightsProps {
  sentimentData: Record<string, any>;
  loading: boolean;
}
interface Statistics {
  averageSentiment: number;
  totalCountries: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  mostPositive: { country: string; score: number };
  mostNegative: { country: string; score: number };
}
async function fetchAIInsights(data: Record<string, any>) {
  try {
    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sentiment_data: data,
        model: 'llama-3.3-70b-versatile',
        provider: 'groq'
      }),
    });
    
    if (!response.ok) throw new Error('Failed to fetch insights from Groq');
    return await response.json();
  } catch (error) {
    console.error('Error fetching insights:', error);
    return null;
  }
}

const AIInsights: React.FC<AIInsightsProps> = ({ sentimentData, loading }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeData = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await fetchAIInsights(sentimentData);
      if (result?.insights) {
        setInsights(result.insights);
        setStatistics(result.statistics);
      }
    } catch (err) {
      setError('Failed to generate insights. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!loading && Object.keys(sentimentData).length > 0) {
      analyzeData();
    }
  }, [sentimentData, loading]);

  if (loading || Object.keys(sentimentData).length === 0) return null;

  return (
    <div className="mt-8 col-span-3">
      <div className="bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-green-500/10 backdrop-blur-sm rounded-2xl border border-teal-100/50 shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 p-0.5 shadow-lg">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-teal-500" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                  What does AI think?
                </h2>
                <p className="text-sm text-teal-600/70 mt-1">Powered by Llama 3.3 70B Versatile via <a href="https://groq.com/">Groq</a></p>
              </div>    
            </div>
            <button
              onClick={analyzeData}
              disabled={analyzing}
              className="flex items-center px-6 py-3 text-sm bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 text-white rounded-full hover:shadow-lg disabled:opacity-50 transition-all hover:-translate-y-0.5 hover:scale-105"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </>
              )}
            </button>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : analyzing ? (
            <div className="animate-pulse space-y-6 max-w-4xl">
              <div className="h-4 bg-teal-200/50 rounded w-3/4"></div>
              <div className="h-4 bg-teal-200/50 rounded w-5/6"></div>
              <div className="h-4 bg-teal-200/50 rounded w-2/3"></div>
              <div className="h-4 bg-teal-200/50 rounded w-4/5"></div>
            </div>
          ) : (statistics && insights) ? (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-teal-100/50 shadow-sm hover:shadow-md transition-all">
                  <div className="text-sm text-teal-600/70 mb-2">Global Average</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                    {(statistics.averageSentiment * 100).toFixed(1)}%
                  </div>
                  <div className="flex items-center mt-2">
                    <Globe className="w-4 h-4 text-teal-500 mr-1" />
                    <span className="text-sm text-teal-600/70">Sentiment Score</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-teal-100/50 shadow-sm hover:shadow-md transition-all">
                  <div className="text-sm text-teal-600/70 mb-2">Most Positive</div>
                  <div className="text-xl font-bold text-emerald-600 truncate">
                    {statistics.mostPositive.country}
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600">
                      {(statistics.mostPositive.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-teal-100/50 shadow-sm hover:shadow-md transition-all">
                  <div className="text-sm text-teal-600/70 mb-2">Most Negative</div>
                  <div className="text-xl font-bold text-red-600 truncate">
                    {statistics.mostNegative.country}
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">
                      {(statistics.mostNegative.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-teal-100/50 shadow-sm hover:shadow-md transition-all">
                  <div className="text-sm text-teal-600/70 mb-2">Distribution</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-lg font-semibold text-emerald-600">{statistics.positiveCount}</span>
                    </div>
                    <div className="text-teal-200 mx-2">|</div>
                    <div className="flex items-center">
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-lg font-semibold text-red-600">{statistics.negativeCount}</span>
                    </div>
                  </div>
                  <div className="text-sm text-teal-600/70 mt-2">
                    Positive vs Negative
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-teal-100/50 shadow-md">
                <div className="flex items-start space-x-4">
                  <MessageCircle className="w-5 h-5 text-teal-500 mt-1" />
                  <div className="flex-1">
                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                        {insights}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {insights && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="text-teal-600/70">
                Analysis based on data from {Object.keys(sentimentData).length} countries
              </div>
              <div className="text-teal-600 flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                AI-Generated Insights
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;