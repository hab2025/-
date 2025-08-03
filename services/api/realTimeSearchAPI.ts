import { LiveSearchResult, WebSearchResult } from '@/types/chat';

// Configuration for different search APIs
const SEARCH_CONFIG = {
  // DuckDuckGo Instant Answer API (free)
  duckduckgo: {
    baseUrl: 'https://api.duckduckgo.com/',
    params: {
      format: 'json',
      no_html: '1',
      skip_disambig: '1',
    },
  },
  // NewsAPI for real-time news (requires API key)
  newsapi: {
    baseUrl: 'https://newsapi.org/v2/everything',
    apiKey: process.env.EXPO_PUBLIC_NEWS_API_KEY || '',
  },
  // Alternative search APIs
  serpapi: {
    baseUrl: 'https://serpapi.com/search',
    apiKey: process.env.EXPO_PUBLIC_SERP_API_KEY || '',
  },
};

export class RealTimeSearchAPI {
  private static instance: RealTimeSearchAPI;

  public static getInstance(): RealTimeSearchAPI {
    if (!RealTimeSearchAPI.instance) {
      RealTimeSearchAPI.instance = new RealTimeSearchAPI();
    }
    return RealTimeSearchAPI.instance;
  }

  /**
   * Search using DuckDuckGo Instant Answer API
   */
  async searchDuckDuckGo(query: string): Promise<LiveSearchResult[]> {
    try {
      const url = new URL(SEARCH_CONFIG.duckduckgo.baseUrl);
      url.searchParams.append('q', query);
      Object.entries(SEARCH_CONFIG.duckduckgo.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString());
      const data = await response.json();

      const results: LiveSearchResult[] = [];

      // Add instant answer if available
      if (data.Answer) {
        results.push({
          title: 'Instant Answer',
          url: data.AnswerURL || '',
          snippet: data.Answer,
          source: 'DuckDuckGo',
          timestamp: new Date().toISOString(),
          relevanceScore: 1.0,
        });
      }

      // Add abstract if available
      if (data.Abstract) {
        results.push({
          title: data.Heading || 'Abstract',
          url: data.AbstractURL || '',
          snippet: data.Abstract,
          source: data.AbstractSource || 'DuckDuckGo',
          timestamp: new Date().toISOString(),
          relevanceScore: 0.9,
        });
      }

      // Add related topics
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        data.RelatedTopics.slice(0, 3).forEach((topic: any, index: number) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || 'Related Topic',
              url: topic.FirstURL,
              snippet: topic.Text,
              source: 'DuckDuckGo',
              timestamp: new Date().toISOString(),
              relevanceScore: 0.8 - (index * 0.1),
            });
          }
        });
      }

      return results;
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      return [];
    }
  }

  /**
   * Search for real-time news using NewsAPI
   */
  async searchNews(query: string, language: string = 'ar'): Promise<LiveSearchResult[]> {
    if (!SEARCH_CONFIG.newsapi.apiKey) {
      console.warn('NewsAPI key not configured');
      return [];
    }

    try {
      const url = new URL(SEARCH_CONFIG.newsapi.baseUrl);
      url.searchParams.append('q', query);
      url.searchParams.append('language', language);
      url.searchParams.append('sortBy', 'publishedAt');
      url.searchParams.append('pageSize', '10');
      url.searchParams.append('apiKey', SEARCH_CONFIG.newsapi.apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== 'ok' || !data.articles) {
        return [];
      }

      return data.articles.map((article: any, index: number) => ({
        title: article.title,
        url: article.url,
        snippet: article.description || article.content?.substring(0, 200) + '...',
        source: article.source?.name || 'News',
        timestamp: article.publishedAt,
        relevanceScore: 1.0 - (index * 0.05),
      }));
    } catch (error) {
      console.error('NewsAPI search error:', error);
      return [];
    }
  }

  /**
   * Search for financial data (stocks, crypto, etc.)
   */
  async searchFinancial(query: string): Promise<LiveSearchResult[]> {
    // This is a mock implementation - in a real app, you'd use APIs like:
    // - Alpha Vantage
    // - Yahoo Finance API
    // - CoinGecko API for crypto
    
    const mockFinancialData: LiveSearchResult[] = [
      {
        title: `${query} - Current Price`,
        url: `https://finance.yahoo.com/quote/${query}`,
        snippet: `Real-time price data for ${query}. Market data delayed by 15 minutes.`,
        source: 'Financial Data',
        timestamp: new Date().toISOString(),
        relevanceScore: 1.0,
      },
    ];

    return mockFinancialData;
  }

  /**
   * Comprehensive search that combines multiple sources
   */
  async comprehensiveSearch(query: string, options: {
    includeNews?: boolean;
    includeFinancial?: boolean;
    language?: string;
  } = {}): Promise<LiveSearchResult[]> {
    const {
      includeNews = true,
      includeFinancial = false,
      language = 'ar',
    } = options;

    const searchPromises: Promise<LiveSearchResult[]>[] = [
      this.searchDuckDuckGo(query),
    ];

    if (includeNews) {
      searchPromises.push(this.searchNews(query, language));
    }

    if (includeFinancial) {
      searchPromises.push(this.searchFinancial(query));
    }

    try {
      const results = await Promise.all(searchPromises);
      const combinedResults = results.flat();

      // Sort by relevance score and timestamp
      return combinedResults
        .sort((a, b) => {
          // First sort by relevance score
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          // Then by timestamp (newer first)
          return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
        })
        .slice(0, 10); // Limit to top 10 results
    } catch (error) {
      console.error('Comprehensive search error:', error);
      return [];
    }
  }

  /**
   * Detect if query needs real-time search
   */
  needsRealTimeSearch(query: string): boolean {
    const realTimeKeywords = [
      // Arabic keywords
      'سعر', 'أسعار', 'الآن', 'اليوم', 'حالياً', 'مباشر', 'فوري', 'أخبار', 'اخبار',
      'حديث', 'جديد', 'آخر', 'أحدث', 'طازج', 'عاجل', 'مستجدات', 'تطورات',
      'بورصة', 'أسهم', 'عملة', 'دولار', 'ريال', 'يورو', 'ذهب', 'نفط',
      'طقس', 'حالة الطقس', 'درجة الحرارة', 'مطر', 'عاصفة',
      'كورونا', 'كوفيد', 'وباء', 'فيروس', 'لقاح',
      'انتخابات', 'سياسة', 'حكومة', 'رئيس', 'وزير',
      'رياضة', 'كرة القدم', 'مباراة', 'نتيجة', 'هدف',
      
      // English keywords
      'price', 'current', 'now', 'today', 'live', 'real-time', 'breaking',
      'news', 'latest', 'recent', 'update', 'stock', 'crypto', 'bitcoin',
      'weather', 'temperature', 'forecast', 'covid', 'vaccine',
      'election', 'politics', 'government', 'president', 'minister',
      'sports', 'football', 'soccer', 'match', 'score', 'goal',
    ];

    const lowerQuery = query.toLowerCase();
    return realTimeKeywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
  }

  /**
   * Smart search that automatically determines search strategy
   */
  async smartSearch(query: string, language: string = 'ar'): Promise<LiveSearchResult[]> {
    const needsRealTime = this.needsRealTimeSearch(query);
    
    if (!needsRealTime) {
      // For general queries, use DuckDuckGo only
      return this.searchDuckDuckGo(query);
    }

    // For real-time queries, use comprehensive search
    const isFinancialQuery = /\b(سعر|price|stock|crypto|bitcoin|dollar|ريال|دولار|بورصة|أسهم)\b/i.test(query);
    
    return this.comprehensiveSearch(query, {
      includeNews: true,
      includeFinancial: isFinancialQuery,
      language,
    });
  }
}

// Export singleton instance
export const realTimeSearchAPI = RealTimeSearchAPI.getInstance();

