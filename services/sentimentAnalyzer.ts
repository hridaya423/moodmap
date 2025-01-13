import Sentiment from 'sentiment';
import type { ContentItem, SentimentData } from '@/types';

export class SentimentAnalyzer {
  private sentiment: Sentiment;

  constructor() {
    this.sentiment = new Sentiment();
  }

  async analyzeSentiment(text: string): Promise<number> {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string');
      }

      const analysis = this.sentiment.analyze(text);
      return this.normalizeScore(analysis.comparative);
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      throw error;
    }
  }

  private normalizeScore(score: number): number {
    return Math.max(-1, Math.min(1, score / 5));
  }

  async analyzeBatch(texts: string[]): Promise<number[]> {
    if (!Array.isArray(texts)) {
      throw new Error('Invalid input: texts must be an array');
    }
    const chunkSize = 10;
    const results: number[] = [];

    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map(text => this.analyzeSentiment(text))
      );
      results.push(...chunkResults);
    }

    return results;
  }

  async aggregateContentByLocation(contents: ContentItem[]): Promise<SentimentData> {
    const contentByLocation: { [location: string]: ContentItem[] } = {};
    
    contents.forEach(content => {
      if (!contentByLocation[content.location]) {
        contentByLocation[content.location] = [];
      }
      contentByLocation[content.location].push(content);
    });

    const sentimentData: SentimentData = {};

    for (const [location, locationContents] of Object.entries(contentByLocation)) {
      const redditContent = locationContents.filter(c => c.source === 'reddit');

      const redditSentiments = await this.analyzeBatch(redditContent.map(c => c.text));
      const totalSentiments = [...redditSentiments];
      const averageSentiment = totalSentiments.length > 0
        ? totalSentiments.reduce((a, b) => a + b, 0) / totalSentiments.length
        : 0;

      const subreddits = Array.from(new Set(
        redditContent
          .map(c => c.url)
          .filter(Boolean)
          .map(url => {
            const match = url?.match(/reddit\.com\/r\/([^/]+)/);
            return match ? match[1] : null;
          })
          .filter(Boolean) as string[]
      ));


      sentimentData[location] = {
        score: averageSentiment,
        sources: {
          reddit: {
            count: redditContent.length,
            subreddits
          }
        }
      };
    }

    return sentimentData;
  }
}