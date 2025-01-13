/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { RedditCollector } from '@/services/datacollectors/reddit';
import { SentimentAnalyzer } from '@/services/sentimentAnalyzer';
import { SentimentCacheService } from '@/services/sentimentCache';
import type { SentimentResponse } from '@/types';

export const runtime = 'edge';

const redditCollector = new RedditCollector();
const sentimentAnalyzer = new SentimentAnalyzer();
const cacheService = new SentimentCacheService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locations = (searchParams.get('locations') || 'global').split(',');
    const keywords = searchParams.get('keywords') || '';

    console.log(`Processing request for locations: ${locations.join(', ')}`);

    const cachedData = await cacheService.getCachedData(locations);
    const sentimentData: { [location: string]: any } = {};
    const processingErrors: string[] = [];
    const locationsToFetch = locations.filter(loc => !cachedData[loc]);

    Object.entries(cachedData).forEach(([location, data]) => {
      if (data) {
        sentimentData[location] = data;
      }
    });

    for (const location of locationsToFetch) {
      try {
        console.log(`Collecting fresh data for ${location}`);
        
        const [redditContent] = await Promise.all([
          redditCollector.collectData(keywords, location),
        ]);

        const allContent = [...redditContent];
        
        if (allContent.length === 0) {
          const emptyData = {
            score: 0,
            sources: {
              reddit: { count: 0, subreddits: [] },
            }
          };
          sentimentData[location] = emptyData;
          await cacheService.updateCache(location, emptyData);
          continue;
        }
        const sentiments = await sentimentAnalyzer.analyzeBatch(
          allContent.map(item => item.text)
        );
        const totalSentiment = sentiments.reduce((sum, s) => sum + s, 0);
        const avgSentiment = totalSentiment / sentiments.length;

        const subreddits = Array.from(new Set(
          redditContent
            .map(content => {
              const match = content.url?.match(/reddit\.com\/r\/([^/]+)/);
              return match ? match[1] : null;
            })
            .filter(Boolean) as string[]
        ));
        const locationData = {
          score: avgSentiment,
          sources: {
            reddit: {
              count: redditContent.length,
              subreddits
            },
          }
        };
        sentimentData[location] = locationData;
        await cacheService.updateCache(location, locationData);
      } catch (error) {
        console.error(`Error processing ${location}:`, error);
        processingErrors.push(error instanceof Error ? error.message : 'Unknown error');
        const errorData = {
          score: 0,
          sources: {
            reddit: { count: 0, subreddits: [] },
          }
        };
        sentimentData[location] = errorData;
        await cacheService.updateCache(location, errorData);
      }
    }
    const response: SentimentResponse = {
      data: sentimentData,
      timestamp: new Date().toISOString(),
      status: processingErrors.length === 0 ? 'success' : 'partial',
      errors: processingErrors.length > 0 ? processingErrors : undefined
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing sentiment:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch data',
        data: {},
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}