import { BacklogItem, EstimationResult, TShirtSize } from './types';

/**
 * AI Prompt Templates for OpenAI/Claude integration
 * These can be used to enhance the estimation tool with AI capabilities
 */

export class PromptTemplates {
  /**
   * Generate a prompt to get AI suggestions for T-shirt sizing
   */
  static getEffortEstimationPrompt(
    featureDescription: string,
    technicalContext?: string
  ): string {
    return `You are an experienced technical lead estimating software development effort.

Feature Description:
${featureDescription}

${technicalContext ? `Technical Context:\n${technicalContext}\n` : ''}

Based on this feature, provide a T-shirt size estimation (XS, S, M, L, XL, XXL, XXXL) where:
- XS: 9 hours (trivial task, single file change)
- S: 18 hours (simple feature, 1-2 days)
- M: 36 hours (moderate feature, 1 week)
- L: 72 hours (complex feature, 2 weeks)
- XL: 108 hours (very complex, 3 weeks)
- XXL: 144 hours (major feature, 4 weeks)
- XXXL: 189 hours (epic-level work, 5+ weeks)

Also identify which roles are needed: Fullstack, QA, DevOps, BA, SM, UX

Respond in JSON format:
{
  "tshirt_size": "M",
  "roles": ["Fullstack", "QA"],
  "reasoning": "explanation here",
  "risks": ["potential risk 1", "potential risk 2"]
}`;
  }

  /**
   * Generate a prompt to break down an epic into features
   */
  static getFeatureBreakdownPrompt(epicDescription: string): string {
    return `You are a Business Analyst breaking down an epic into implementable user stories.

Epic Description:
${epicDescription}

Break this epic into 5-10 concrete user stories/features. For each feature:
1. Provide a clear, concise name
2. Describe what needs to be built
3. Suggest a T-shirt size (XS, S, M, L, XL, XXL, XXXL)
4. Identify required roles

Respond in JSON format:
{
  "epic": "${epicDescription}",
  "features": [
    {
      "feature": "Feature name",
      "description": "What needs to be built",
      "tshirt_size": "M",
      "roles": ["Fullstack", "QA"]
    }
  ]
}`;
  }

  /**
   * Generate a prompt to validate and refine an existing estimation
   */
  static getEstimationReviewPrompt(
    backlog: BacklogItem[],
    estimation: EstimationResult
  ): string {
    return `You are a senior project manager reviewing a project estimation.

Backlog (${backlog.length} items):
${JSON.stringify(backlog, null, 2)}

Current Estimation:
- Total Duration: ${estimation.durationWeeks} weeks (${estimation.durationSprints} sprints)
- Total Cost: $${estimation.totalCost.toLocaleString()}
- Team Size: ${estimation.teamComposition.length} roles
- Total Hours: ${Math.round(estimation.totalBaseHours)} hours

Review this estimation and provide:
1. Validation (is it reasonable?)
2. Potential risks or red flags
3. Suggestions for optimization
4. Missing considerations

Respond in JSON format:
{
  "overall_assessment": "reasonable|optimistic|pessimistic",
  "confidence_level": "high|medium|low",
  "risks": ["risk 1", "risk 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "adjusted_duration_weeks": 12,
  "reasoning": "Detailed explanation"
}`;
  }

  /**
   * Generate a prompt to suggest project risks based on estimation
   */
  static getRiskAnalysisPrompt(estimation: EstimationResult): string {
    return `You are a risk management expert analyzing a software project estimation.

Project Details:
- Duration: ${estimation.durationWeeks} weeks
- Team Size: ${estimation.teamComposition.map((t) => `${t.count} ${t.role}`).join(', ')}
- Total Cost: $${estimation.totalCost.toLocaleString()}
- Backlog Items: ${estimation.backlogItemCount}

Identify potential risks in these categories:
1. Schedule risks (timeline, dependencies, critical path)
2. Resource risks (team composition, availability, skills)
3. Technical risks (complexity, unknowns, integrations)
4. Budget risks (cost overruns, scope creep)

For each risk, provide:
- Risk description
- Impact (high/medium/low)
- Probability (high/medium/low)
- Mitigation strategy

Respond in JSON format:
{
  "risks": [
    {
      "category": "schedule",
      "description": "Risk description",
      "impact": "high",
      "probability": "medium",
      "mitigation": "How to mitigate this risk"
    }
  ],
  "overall_risk_level": "high|medium|low"
}`;
  }

  /**
   * Generate a prompt to create a project summary for stakeholders
   */
  static getStakeholderSummaryPrompt(
    estimation: EstimationResult,
    projectName: string
  ): string {
    return `You are a project manager preparing an executive summary for stakeholders.

Project: ${projectName}

Estimation Results:
- Timeline: ${estimation.durationWeeks} weeks (${estimation.durationSprints} sprints)
- Start Date: ${estimation.startDate}
- End Date: ${estimation.endDate}
- Total Cost: $${estimation.totalCost.toLocaleString()}
- Team: ${estimation.teamComposition.map((t) => `${t.count} ${t.role}`).join(', ')}
- Scope: ${estimation.backlogItemCount} features/stories

Create a concise, executive-friendly summary including:
1. Project Overview (2-3 sentences)
2. Key Deliverables
3. Timeline & Milestones
4. Investment Required
5. Team Structure
6. Success Factors
7. Next Steps

Use clear, business-focused language. Avoid technical jargon.`;
  }

  /**
   * Generate a prompt to optimize team composition
   */
  static getTeamOptimizationPrompt(estimation: EstimationResult): string {
    return `You are a resource manager optimizing team composition for efficiency and cost.

Current Team:
${estimation.teamComposition.map((t) => `- ${t.role}: ${t.count} @ ${t.allocationPercentage}%`).join('\n')}

Project Duration: ${estimation.durationWeeks} weeks
Total Effort: ${Math.round(estimation.totalBaseHours)} hours
Total Cost: $${estimation.totalCost.toLocaleString()}

Suggest optimizations considering:
1. Can roles be consolidated? (e.g., full-stack covering multiple areas)
2. Can part-time resources be used more effectively?
3. Are there over/under-staffed roles?
4. What's the optimal team size for this duration?

Respond in JSON format:
{
  "optimized_team": [
    {
      "role": "Fullstack",
      "count": 3,
      "allocation_percentage": 100
    }
  ],
  "estimated_savings": 15000,
  "reasoning": "Detailed explanation",
  "trade_offs": ["trade-off 1", "trade-off 2"]
}`;
  }
}

