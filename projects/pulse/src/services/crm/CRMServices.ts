/**
 * CRM Services - Pipeline management, lead tracking, and activity logging
 */

export interface CRMPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface Lead {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  pipelineId: string;
  stageId: string;
  value?: number;
  probability?: number;
  source?: string;
  assignedTo?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
  convertedAt?: Date;
}

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  createdBy?: string;
}

export type ActivityType = 
  | 'call'
  | 'email'
  | 'meeting'
  | 'note'
  | 'task'
  | 'status_change'
  | 'deal_won'
  | 'deal_lost';

export interface DealSummary {
  totalLeads: number;
  activeDeals: number;
  totalValue: number;
  averageDealSize: number;
  conversionRate: number;
  stageBreakdown: { stageId: string; count: number; value: number }[];
}

// In-memory storage (would be replaced with database in production)
let pipelines: CRMPipeline[] = [
  {
    id: 'default',
    name: 'Sales Pipeline',
    stages: [
      { id: 'lead', name: 'Lead', order: 0, color: '#6B7280' },
      { id: 'qualified', name: 'Qualified', order: 1, color: '#3B82F6' },
      { id: 'proposal', name: 'Proposal', order: 2, color: '#8B5CF6' },
      { id: 'negotiation', name: 'Negotiation', order: 3, color: '#F59E0B' },
      { id: 'closed_won', name: 'Closed Won', order: 4, color: '#10B981' },
      { id: 'closed_lost', name: 'Closed Lost', order: 5, color: '#EF4444' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let leads: Lead[] = [];
let activities: Activity[] = [];

class CRMServices {
  /**
   * Get all pipelines
   */
  getPipelines(): CRMPipeline[] {
    return [...pipelines];
  }

  /**
   * Get pipeline by ID
   */
  getPipeline(pipelineId: string): CRMPipeline | undefined {
    return pipelines.find(p => p.id === pipelineId);
  }

  /**
   * Create a new pipeline
   */
  createPipeline(name: string, stages?: PipelineStage[]): CRMPipeline {
    const defaultStages: PipelineStage[] = [
      { id: `stage_${Date.now()}_1`, name: 'New', order: 0, color: '#6B7280' },
      { id: `stage_${Date.now()}_2`, name: 'In Progress', order: 1, color: '#3B82F6' },
      { id: `stage_${Date.now()}_3`, name: 'Won', order: 2, color: '#10B981' },
      { id: `stage_${Date.now()}_4`, name: 'Lost', order: 3, color: '#EF4444' },
    ];

    const pipeline: CRMPipeline = {
      id: `pipeline_${Date.now()}`,
      name,
      stages: stages || defaultStages,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    pipelines.push(pipeline);
    return pipeline;
  }

  /**
   * Get all leads
   */
  getLeads(pipelineId?: string): Lead[] {
    if (pipelineId) {
      return leads.filter(l => l.pipelineId === pipelineId);
    }
    return [...leads];
  }

  /**
   * Get lead by ID
   */
  getLead(leadId: string): Lead | undefined {
    return leads.find(l => l.id === leadId);
  }

  /**
   * Create a new lead
   */
  createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
    const lead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    leads.push(lead);
    
    // Log activity
    this.logActivity({
      leadId: lead.id,
      type: 'note',
      description: 'Lead created',
    });

    return lead;
  }

  /**
   * Update a lead
   */
  updateLead(leadId: string, updates: Partial<Lead>): Lead | undefined {
    const index = leads.findIndex(l => l.id === leadId);
    if (index === -1) return undefined;

    const oldLead = leads[index];
    const updatedLead = {
      ...oldLead,
      ...updates,
      updatedAt: new Date(),
    };

    leads[index] = updatedLead;

    // Log status change if stage changed
    if (updates.stageId && updates.stageId !== oldLead.stageId) {
      const pipeline = this.getPipeline(updatedLead.pipelineId);
      const newStage = pipeline?.stages.find(s => s.id === updates.stageId);
      
      this.logActivity({
        leadId,
        type: 'status_change',
        description: `Stage changed to ${newStage?.name || updates.stageId}`,
        metadata: { oldStageId: oldLead.stageId, newStageId: updates.stageId },
      });

      // Handle deal won/lost
      if (updates.stageId === 'closed_won') {
        this.logActivity({
          leadId,
          type: 'deal_won',
          description: 'Deal closed successfully!',
        });
        updatedLead.convertedAt = new Date();
      } else if (updates.stageId === 'closed_lost') {
        this.logActivity({
          leadId,
          type: 'deal_lost',
          description: 'Deal lost',
        });
      }
    }

    return updatedLead;
  }

  /**
   * Move lead to a different stage
   */
  moveLeadToStage(leadId: string, stageId: string): Lead | undefined {
    return this.updateLead(leadId, { stageId });
  }

  /**
   * Delete a lead
   */
  deleteLead(leadId: string): boolean {
    const index = leads.findIndex(l => l.id === leadId);
    if (index === -1) return false;

    leads.splice(index, 1);
    // Also delete related activities
    activities = activities.filter(a => a.leadId !== leadId);
    
    return true;
  }

  /**
   * Get activities for a lead
   */
  getActivities(leadId: string): Activity[] {
    return activities
      .filter(a => a.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Log an activity
   */
  logActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Activity {
    const newActivity: Activity = {
      ...activity,
      id: `activity_${Date.now()}`,
      createdAt: new Date(),
    };

    activities.push(newActivity);

    // Update lead's last activity
    const lead = leads.find(l => l.id === activity.leadId);
    if (lead) {
      lead.lastActivityAt = new Date();
    }

    return newActivity;
  }

  /**
   * Get deal summary
   */
  getDealSummary(pipelineId?: string): DealSummary {
    const pipelineLeads = pipelineId 
      ? leads.filter(l => l.pipelineId === pipelineId)
      : leads;

    const totalLeads = pipelineLeads.length;
    const activeDeals = pipelineLeads.filter(l => 
      !['closed_won', 'closed_lost'].includes(l.stageId)
    ).length;
    
    const totalValue = pipelineLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const averageDealSize = totalLeads > 0 ? totalValue / totalLeads : 0;
    
    const converted = pipelineLeads.filter(l => l.stageId === 'closed_won').length;
    const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;

    // Stage breakdown
    const pipeline = pipelineId ? this.getPipeline(pipelineId) : pipelines[0];
    const stageBreakdown = pipeline?.stages.map(stage => ({
      stageId: stage.id,
      count: pipelineLeads.filter(l => l.stageId === stage.id).length,
      value: pipelineLeads
        .filter(l => l.stageId === stage.id)
        .reduce((sum, l) => sum + (l.value || 0), 0),
    })) || [];

    return {
      totalLeads,
      activeDeals,
      totalValue,
      averageDealSize,
      conversionRate,
      stageBreakdown,
    };
  }

  /**
   * Search leads
   */
  searchLeads(query: string): Lead[] {
    const lowerQuery = query.toLowerCase();
    return leads.filter(l => 
      l.contactName.toLowerCase().includes(lowerQuery) ||
      l.contactEmail?.toLowerCase().includes(lowerQuery) ||
      l.contactPhone?.includes(query) ||
      l.notes?.toLowerCase().includes(lowerQuery) ||
      l.tags?.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get leads by stage
   */
  getLeadsByStage(pipelineId: string, stageId: string): Lead[] {
    return leads.filter(l => l.pipelineId === pipelineId && l.stageId === stageId);
  }
}

export const crmService = new CRMServices();
export default crmService;