/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: Request) {
  try {
    const { sentiment_data } = await req.json();
    const scores = Object.values(sentiment_data)
      .filter((data: any) => data && typeof data.score === 'number')
      .map((data: any) => data.score);
    
    if (scores.length === 0) {
      throw new Error('No valid sentiment scores found in the data');
    }

    const avgSentiment = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    const positiveSentiment = scores.filter((score: number) => score > 0).length;
    const negativeSentiment = scores.filter((score: number) => score < 0).length;
    const neutralSentiment = scores.filter((score: number) => score === 0).length;
    
    const countryScores = Object.entries(sentiment_data)
      .filter(([_, data]: [string, any]) => data && typeof data.score === 'number')
      .map(([country, data]: [string, any]) => ({
        country,
        score: data.score
      }));

    const mostPositive = countryScores.reduce((a, b) => a.score > b.score ? a : b);
    const mostNegative = countryScores.reduce((a, b) => a.score < b.score ? a : b);

    const prompt = `Analyze this global sentiment data:
    - Average sentiment score: ${avgSentiment.toFixed(3)}
    - Countries analyzed: ${scores.length}
    - Positive sentiment: ${positiveSentiment} countries
    - Negative sentiment: ${negativeSentiment} countries
    - Neutral sentiment: ${neutralSentiment} countries
    - Most positive: ${mostPositive.country} (${mostPositive.score.toFixed(3)})
    - Most negative: ${mostNegative.country} (${mostNegative.score.toFixed(3)})

    Give a brief, insightful analysis of what this data indicates about global sentiment. 
    Focus on key patterns, notable outliers, and possible implications.
    Keep the tone professional but approachable. 
    Limit the response to 2-3 paragraphs.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({
      insights: completion.choices[0]?.message?.content || 'No insights generated',
      statistics: {
        averageSentiment: avgSentiment,
        totalCountries: scores.length,
        positiveCount: positiveSentiment,
        negativeCount: negativeSentiment,
        neutralCount: neutralSentiment,
        mostPositive,
        mostNegative
      }
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}