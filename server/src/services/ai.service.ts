// Provides simplified mocking of an AI analysis step for Civic issues

export interface AIAnalysisResult {
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  category: string;
  priorityScore: number;
}

export const analyzeIssue = async (description: string, imageUrl?: string): Promise<AIAnalysisResult> => {
  // TODO: Replace this mock implementation with actual API calls to Gemini / OpenAI
  const lowerDesc = description.toLowerCase();
  let urgency: AIAnalysisResult['urgency'] = 'Low';
  let priorityScore = 10;
  let category = 'Other';
  
  if (lowerDesc.includes('fire') || lowerDesc.includes('accident') || lowerDesc.includes('emergency')) {
    urgency = 'Critical';
    priorityScore = 90 + Math.floor(Math.random() * 10);
    category = 'Emergency';
  } else if (lowerDesc.includes('pothole') || lowerDesc.includes('road')) {
    urgency = 'Medium';
    priorityScore = 40 + Math.floor(Math.random() * 20);
    category = 'Roadworks';
  } else if (lowerDesc.includes('garbage') || lowerDesc.includes('trash') || lowerDesc.includes('waste')) {
    urgency = 'Medium';
    priorityScore = 50 + Math.floor(Math.random() * 20);
    category = 'Sanitation';
  } else if (lowerDesc.includes('water') || lowerDesc.includes('leak')) {
    urgency = 'High';
    priorityScore = 70 + Math.floor(Math.random() * 20);
    category = 'Utilities';
  }

  // Basic sentiment heuristic (mock)
  let sentiment: AIAnalysisResult['sentiment'] = 'Neutral';
  if (lowerDesc.includes('bad') || lowerDesc.includes('terrible') || lowerDesc.includes('angry')) {
    sentiment = 'Negative';
  } else if (lowerDesc.includes('help') || lowerDesc.includes('please')) {
    sentiment = 'Positive';
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return { urgency, sentiment, category, priorityScore };
};
