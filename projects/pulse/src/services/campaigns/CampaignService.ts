/**
 * Campaign Service - Campaign creation, audience targeting, and delivery tracking
 */

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  targetAudience: AudienceTarget;
  schedule?: CampaignSchedule;
  content: CampaignContent;
  metrics: CampaignMetrics;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface AudienceTarget {
  segmentId?: string;
  tags?: string[];
  contactTypes?: ('all' | 'personal' | 'business')[];
  excludeTags?: string[];
  minEngagementScore?: number;
  maxContacts?: number;
}

export interface CampaignSchedule {
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  sendTime?: 'now' | 'scheduled';
  optimalSendTime?: {
    enabled: boolean;
    hours?: { start: number; end: number };
  };
}

export interface CampaignContent {
  type: 'message' | 'template' | 'ai_generated';
  templateId?: string;
  message: string;
  subject?: string; // For email campaigns
  mediaUrl?: string;
  cta?: {
    text: string;
    url?: string;
  };
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  conversionRate: number;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  category: string;
  content: CampaignContent;
  variables?: string[];
  createdAt: Date;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalReach: number;
  totalEngagement: number;
  averageConversion: number;
  topPerforming: Campaign[];
}

// In-memory storage
let campaigns: Campaign[] = [];
let templates: CampaignTemplate[] = [];

class CampaignService {
  /**
   * Get all campaigns
   */
  getCampaigns(status?: CampaignStatus): Campaign[] {
    if (status) {
      return campaigns.filter(c => c.status === status);
    }
    return [...campaigns];
  }

  /**
   * Get campaign by ID
   */
  getCampaign(campaignId: string): Campaign | undefined {
    return campaigns.find(c => c.id === campaignId);
  }

  /**
   * Create a new campaign
   */
  createCampaign(campaignData: Omit<Campaign, 'id' | 'status' | 'metrics' | 'createdAt' | 'updatedAt'>): Campaign {
    const campaign: Campaign = {
      ...campaignData,
      id: `campaign_${Date.now()}`,
      status: 'draft',
      metrics: {
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        conversionRate: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    campaigns.push(campaign);
    return campaign;
  }

  /**
   * Update a campaign
   */
  updateCampaign(campaignId: string, updates: Partial<Campaign>): Campaign | undefined {
    const index = campaigns.findIndex(c => c.id === campaignId);
    if (index === -1) return undefined;

    const updatedCampaign = {
      ...campaigns[index],
      ...updates,
      updatedAt: new Date(),
    };

    campaigns[index] = updatedCampaign;
    return updatedCampaign;
  }

  /**
   * Schedule a campaign
   */
  scheduleCampaign(campaignId: string, schedule: CampaignSchedule): Campaign | undefined {
    return this.updateCampaign(campaignId, {
      status: 'scheduled',
      schedule,
    });
  }

  /**
   * Start a campaign
   */
  startCampaign(campaignId: string): Campaign | undefined {
    const campaign = this.getCampaign(campaignId);
    if (!campaign || campaign.status !== 'scheduled') return undefined;

    // Simulate campaign execution
    return this.updateCampaign(campaignId, {
      status: 'running',
      startedAt: new Date(),
      metrics: {
        ...campaign.metrics,
        // Simulate some initial metrics
        sent: Math.floor(Math.random() * 100),
        delivered: Math.floor(Math.random() * 90),
      },
    });
  }

  /**
   * Pause a running campaign
   */
  pauseCampaign(campaignId: string): Campaign | undefined {
    const campaign = this.getCampaign(campaignId);
    if (!campaign || campaign.status !== 'running') return undefined;

    return this.updateCampaign(campaignId, { status: 'paused' });
  }

  /**
   * Resume a paused campaign
   */
  resumeCampaign(campaignId: string): Campaign | undefined {
    const campaign = this.getCampaign(campaignId);
    if (!campaign || campaign.status !== 'paused') return undefined;

    return this.updateCampaign(campaignId, { status: 'running' });
  }

  /**
   * Cancel a campaign
   */
  cancelCampaign(campaignId: string): Campaign | undefined {
    return this.updateCampaign(campaignId, {
      status: 'cancelled',
      completedAt: new Date(),
    });
  }

  /**
   * Complete a campaign
   */
  completeCampaign(campaignId: string): Campaign | undefined {
    return this.updateCampaign(campaignId, {
      status: 'completed',
      completedAt: new Date(),
    });
  }

  /**
   * Delete a campaign
   */
  deleteCampaign(campaignId: string): boolean {
    const index = campaigns.findIndex(c => c.id === campaignId);
    if (index === -1) return false;

    campaigns.splice(index, 1);
    return true;
  }

  /**
   * Update campaign metrics
   */
  updateMetrics(campaignId: string, metrics: Partial<CampaignMetrics>): Campaign | undefined {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return undefined;

    const updatedMetrics = {
      ...campaign.metrics,
      ...metrics,
    };

    // Recalculate conversion rate
    if (updatedMetrics.sent > 0) {
      updatedMetrics.conversionRate = (updatedMetrics.delivered / updatedMetrics.sent) * 100;
    }

    return this.updateCampaign(campaignId, { metrics: updatedMetrics });
  }

  /**
   * Get campaign stats
   */
  getStats(): CampaignStats {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'running' || c.status === 'scheduled').length;
    
    const totalReach = campaigns.reduce((sum, c) => sum + c.metrics.delivered, 0);
    const totalEngagement = campaigns.reduce((sum, c) => sum + c.metrics.opened + c.metrics.clicked, 0);
    
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');
    const averageConversion = completedCampaigns.length > 0
      ? completedCampaigns.reduce((sum, c) => sum + c.metrics.conversionRate, 0) / completedCampaigns.length
      : 0;

    const topPerforming = [...campaigns]
      .sort((a, b) => b.metrics.conversionRate - a.metrics.conversionRate)
      .slice(0, 5);

    return {
      totalCampaigns,
      activeCampaigns,
      totalReach,
      totalEngagement,
      averageConversion,
      topPerforming,
    };
  }

  /**
   * Get templates
   */
  getTemplates(category?: string): CampaignTemplate[] {
    if (category) {
      return templates.filter(t => t.category === category);
    }
    return [...templates];
  }

  /**
   * Create a template
   */
  createTemplate(templateData: Omit<CampaignTemplate, 'id' | 'createdAt'>): CampaignTemplate {
    const template: CampaignTemplate = {
      ...templateData,
      id: `template_${Date.now()}`,
      createdAt: new Date(),
    };

    templates.push(template);
    return template;
  }

  /**
   * Get estimated audience size
   */
  getAudienceSize(target: AudienceTarget): number {
    // Stub: In production, this would query the actual contact database
    // For demo, return a random number based on criteria
    let baseSize = Math.floor(Math.random() * 500) + 100;
    
    if (target.maxContacts) {
      return Math.min(baseSize, target.maxContacts);
    }
    
    return baseSize;
  }

  /**
   * Preview campaign content
   */
  previewContent(campaignId: string): { preview: string; variables: Record<string, string> } | undefined {
    const campaign = this.getCampaign(campaignId);
    if (!campaign) return undefined;

    // Extract variables from content
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: Record<string, string> = {};
    let match;
    
    while ((match = variableRegex.exec(campaign.content.message)) !== null) {
      variables[match[1]] = `[${match[1]}]`;
    }

    return {
      preview: campaign.content.message,
      variables,
    };
  }
}

export const campaignService = new CampaignService();
export default campaignService;