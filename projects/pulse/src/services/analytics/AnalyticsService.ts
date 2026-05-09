/**
 * Analytics Service - Response metrics, engagement scoring, and export reports
 */

export interface ResponseMetrics {
  contactId: string;
  contactName: string;
  averageResponseTime: number; // in minutes
  totalMessages: number;
  sentMessages: number;
  receivedMessages: number;
  responseRate: number;
  lastMessageAt?: Date;
  trend: 'up' | 'down' | 'stable';
}

export interface EngagementScore {
  contactId: string;
  contactName: string;
  score: number; // 0-100
  breakdown: {
    frequency: number;
    recency: number;
    sentiment: number;
    responsiveness: number;
  };
  tier: 'cold' | 'warm' | 'hot' | ' VIP';
  updatedAt: Date;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  type: ReportType;
  dateRange: DateRange;
  data: Record<string, any>;
  generatedAt: Date;
}

export type ReportType = 
  | 'response_times'
  | 'engagement'
  | 'campaign_performance'
  | 'conversion'
  | 'comprehensive';

export interface DateRange {
  start: Date;
  end: Date;
}

// Mock data for demo
const responseMetricsData: Map<string, ResponseMetrics> = new Map();
const engagementScoresData: Map<string, EngagementScore> = new Map();

class AnalyticsService {
  /**
   * Get response metrics for a contact
   */
  getResponseMetrics(contactId: string): ResponseMetrics | undefined {
    return responseMetricsData.get(contactId);
  }

  /**
   * Get response metrics for all contacts
   */
  getAllResponseMetrics(): ResponseMetrics[] {
    return Array.from(responseMetricsData.values());
  }

  /**
   * Get top responders
   */
  getTopResponders(limit: number = 10): ResponseMetrics[] {
    return Array.from(responseMetricsData.values())
      .sort((a, b) => a.averageResponseTime - b.averageResponseTime)
      .slice(0, limit);
  }

  /**
   * Get worst responders
   */
  getWorstResponders(limit: number = 10): ResponseMetrics[] {
    return Array.from(responseMetricsData.values())
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, limit);
  }

  /**
   * Update response metrics for a contact
   */
  updateResponseMetrics(
    contactId: string,
    contactName: string,
    responseTime: number,
    isOutgoing: boolean
  ): ResponseMetrics {
    let metrics = responseMetricsData.get(contactId);
    
    if (!metrics) {
      metrics = {
        contactId,
        contactName,
        averageResponseTime: responseTime,
        totalMessages: 1,
        sentMessages: isOutgoing ? 1 : 0,
        receivedMessages: isOutgoing ? 0 : 1,
        responseRate: 0,
        trend: 'stable',
      };
    } else {
      const totalMessages = metrics.totalMessages + 1;
      const totalResponseTime = metrics.averageResponseTime * metrics.totalMessages + responseTime;
      
      metrics = {
        ...metrics,
        averageResponseTime: totalResponseTime / totalMessages,
        totalMessages,
        sentMessages: metrics.sentMessages + (isOutgoing ? 1 : 0),
        receivedMessages: metrics.receivedMessages + (isOutgoing ? 0 : 1),
        lastMessageAt: new Date(),
      };
    }

    // Calculate response rate
    if (metrics.receivedMessages > 0) {
      // Simple response rate calculation
      metrics.responseRate = Math.min(100, (metrics.receivedMessages / metrics.sentMessages) * 100);
    }

    responseMetricsData.set(contactId, metrics);
    return metrics;
  }

  /**
   * Get engagement score for a contact
   */
  getEngagementScore(contactId: string): EngagementScore | undefined {
    return engagementScoresData.get(contactId);
  }

  /**
   * Get all engagement scores
   */
  getAllEngagementScores(): EngagementScore[] {
    return Array.from(engagementScoresData.values());
  }

  /**
   * Get contacts by engagement tier
   */
  getContactsByTier(tier: EngagementScore['tier']): EngagementScore[] {
    return Array.from(engagementScoresData.values())
      .filter(e => e.tier === tier);
  }

  /**
   * Calculate and update engagement score
   */
  calculateEngagementScore(
    contactId: string,
    contactName: string,
    messageFrequency: number,
    lastMessageDays: number,
    sentimentScore: number,
    responseRate: number
  ): EngagementScore {
    // Frequency score (0-25)
    const frequency = Math.min(25, messageFrequency * 5);
    
    // Recency score (0-25)
    const recency = Math.max(0, 25 - (lastMessageDays * 5));
    
    // Sentiment score (0-25)
    const sentiment = Math.min(25, Math.max(0, (sentimentScore + 1) * 12.5));
    
    // Responsiveness score (0-25)
    const responsiveness = Math.min(25, responseRate * 0.25);
    
    const totalScore = frequency + recency + sentiment + responsiveness;
    
    let tier: EngagementScore['tier'];
    if (totalScore >= 80) tier = 'VIP';
    else if (totalScore >= 60) tier = 'hot';
    else if (totalScore >= 40) tier = 'warm';
    else tier = 'cold';

    const engagement: EngagementScore = {
      contactId,
      contactName,
      score: Math.round(totalScore),
      breakdown: {
        frequency: Math.round(frequency),
        recency: Math.round(recency),
        sentiment: Math.round(sentiment),
        responsiveness: Math.round(responsiveness),
      },
      tier,
      updatedAt: new Date(),
    };

    engagementScoresData.set(contactId, engagement);
    return engagement;
  }

  /**
   * Generate a report
   */
  generateReport(
    name: string,
    type: ReportType,
    dateRange: DateRange
  ): AnalyticsReport {
    let data: Record<string, any> = {};

    switch (type) {
      case 'response_times':
        data = {
          averageResponseTime: this.calculateAverageResponseTime(),
          medianResponseTime: this.calculateMedianResponseTime(),
          byContact: this.getAllResponseMetrics(),
        };
        break;
        
      case 'engagement':
        data = {
          averageScore: this.calculateAverageEngagement(),
          distribution: this.getEngagementDistribution(),
          byContact: this.getAllEngagementScores(),
        };
        break;
        
      case 'campaign_performance':
        data = {
          // Would pull from campaign service
          totalCampaigns: 0,
          averageConversion: 0,
        };
        break;
        
      case 'conversion':
        data = {
          // Would pull from CRM service
          totalLeads: 0,
          conversionRate: 0,
        };
        break;
        
      case 'comprehensive':
        data = {
          responseTimes: {
            average: this.calculateAverageResponseTime(),
            median: this.calculateMedianResponseTime(),
          },
          engagement: {
            average: this.calculateAverageEngagement(),
            distribution: this.getEngagementDistribution(),
          },
        };
        break;
    }

    const report: AnalyticsReport = {
      id: `report_${Date.now()}`,
      name,
      type,
      dateRange,
      data,
      generatedAt: new Date(),
    };

    return report;
  }

  /**
   * Export report to CSV
   */
  exportToCSV(report: AnalyticsReport): string {
    const rows: string[] = [];
    
    // Add header
    rows.push(`Report: ${report.name}`);
    rows.push(`Type: ${report.type}`);
    rows.push(`Generated: ${report.generatedAt.toISOString()}`);
    rows.push(`Date Range: ${report.dateRange.start.toISOString()} - ${report.dateRange.end.toISOString()}`);
    rows.push('');

    // Add data
    if (report.data.byContact) {
      // Table format for contact data
      const contacts = report.data.byContact as any[];
      if (contacts.length > 0) {
        const headers = Object.keys(contacts[0]).join(',');
        rows.push(headers);
        
        for (const contact of contacts) {
          rows.push(Object.values(contact).join(','));
        }
      }
    } else {
      // Key-value format
      for (const [key, value] of Object.entries(report.data)) {
        if (typeof value !== 'object') {
          rows.push(`${key},${value}`);
        }
      }
    }

    return rows.join('\n');
  }

  /**
   * Get dashboard data
   */
  getDashboardData() {
    return {
      overview: {
        totalContacts: engagementScoresData.size,
        averageEngagement: this.calculateAverageEngagement(),
        hotContacts: this.getContactsByTier('hot').length,
        vipContacts: this.getContactsByTier('VIP').length,
      },
      responseMetrics: {
        averageTime: this.calculateAverageResponseTime(),
        medianTime: this.calculateMedianResponseTime(),
      },
      recentActivity: this.getAllResponseMetrics()
        .sort((a, b) => {
          const aDate = a.lastMessageAt?.getTime() || 0;
          const bDate = b.lastMessageAt?.getTime() || 0;
          return bDate - aDate;
        })
        .slice(0, 10),
    };
  }

  // Helper methods
  private calculateAverageResponseTime(): number {
    const metrics = this.getAllResponseMetrics();
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.averageResponseTime, 0);
    return sum / metrics.length;
  }

  private calculateMedianResponseTime(): number {
    const metrics = this.getAllResponseMetrics();
    if (metrics.length === 0) return 0;
    
    const sorted = metrics.map(m => m.averageResponseTime).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculateAverageEngagement(): number {
    const scores = this.getAllEngagementScores();
    if (scores.length === 0) return 0;
    
    const sum = scores.reduce((acc, s) => acc + s.score, 0);
    return sum / scores.length;
  }

  private getEngagementDistribution(): Record<string, number> {
    const distribution = { cold: 0, warm: 0, hot: 0, VIP: 0 };
    
    for (const score of this.getAllEngagementScores()) {
      distribution[score.tier]++;
    }
    
    return distribution;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;