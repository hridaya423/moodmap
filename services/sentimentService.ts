import type { SentimentResponse, FilterOptions } from '@/types';

export async function fetchSentimentData(options?: FilterOptions): Promise<SentimentResponse> {
  try {
    const params = new URLSearchParams();
    
    if (options?.startDate) {
      params.append('from', options.startDate.toISOString());
    }
    
    if (options?.keywords?.length) {
      params.append('keywords', options.keywords.join(' OR '));
    }
    if (options?.locations?.length) {
      const encodedLocations = options.locations.map(loc => encodeURIComponent(loc));
      params.append('locations', encodedLocations.join(','));
    } else {
      params.append('locations', 'Global');
    }
    const url = `/api/sentiment?${params.toString()}`;
    console.log('Fetching sentiment data from:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch sentiment data: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data) {
      const normalizedData: { [key: string]: number } = {};
      Object.entries(data.data).forEach(([country, sentiment]) => {
        normalizedData[country] = sentiment as number;
      });
      data.data = normalizedData;
    }

    return data;
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    throw error;
  }
}