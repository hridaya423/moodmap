import { supabase } from '@/lib/supabase';
import { SentimentData } from '@/types';

export class SentimentCacheService {
  private static STALE_THRESHOLD = 180 * 60 * 1000;

  async getCachedData(countries: string[]): Promise<{ [key: string]: SentimentData | null }> {
    const { data: cachedData, error } = await supabase
      .from('sentiment_cache')
      .select('country, sentiment_data, updated_at')
      .in('country', countries);

    if (error) {
      console.error('Error fetching cached data:', error);
      return {};
    }

    const result: { [key: string]: SentimentData | null } = {};
    const now = new Date().getTime();

    cachedData.forEach(record => {
      const updatedAt = new Date(record.updated_at).getTime();
      const isStale = now - updatedAt > SentimentCacheService.STALE_THRESHOLD;
      result[record.country] = isStale ? null : record.sentiment_data;
    });

    return result;
  }

  async updateCache(country: string, data: SentimentData): Promise<void> {
    const { error } = await supabase
      .from('sentiment_cache')
      .upsert({
        country,
        sentiment_data: data,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Error updating cache for ${country}:`, error);
    }
  }

  async bulkUpdateCache(data: { [country: string]: SentimentData }): Promise<void> {
    const updates = Object.entries(data).map(([country, sentimentData]) => ({
      country,
      sentiment_data: sentimentData,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('sentiment_cache')
      .upsert(updates);

    if (error) {
      console.error('Error bulk updating cache:', error);
    }
  }
}