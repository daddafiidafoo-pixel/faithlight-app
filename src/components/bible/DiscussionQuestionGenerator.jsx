import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Loader2, ChevronDown } from 'lucide-react';

export default function DiscussionQuestionGenerator({ onGenerateQuestions }) {
  const [topic, setTopic] = useState('');
  const [groupSize, setGroupSize] = useState('5-15');
  const [difficulty, setDifficulty] = useState('moderate');
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const questions = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 10-12 thoughtful discussion questions for a small group Bible study on: "${topic}"

Group Size: ${groupSize} people
Difficulty Level: ${difficulty}

Requirements:
1. **Icebreaker Questions** (2): Light, easy questions to start discussion
   - Personal connection questions
   - Helps people feel comfortable sharing

2. **Observation Questions** (3): What does the text say?
   - Encourage people to notice details
   - Build on each other

3. **Interpretation Questions** (3): What does it mean?
   - Explore deeper meaning
   - Discuss context and implications

4. **Application Questions** (3): How should we live it out?
   - Personal application
   - Practical life change
   - Encourage sharing experiences

5. **Closing/Challenge Questions** (2): What will you do?
   - Commitment to action
   - Encouragement to apply the lesson

Guidelines:
- Use inclusive language that welcomes all spiritual maturity levels
- Avoid "yes/no" questions; use open-ended prompts
- Build naturally from surface to deeper questions
- Include quiet reflection time suggestions
- Suggest discussion techniques (pair-share, small groups, whole group)
- Time management: estimate 2-3 min per question for ${groupSize} people

Format each question with:
- Question number and type
- The question itself
- Discussion tips (what to listen for, follow-up probes)
- Time estimate

Make questions relevant, engaging, and spiritually transformative.`,
        add_context_from_internet: true
      });

      onGenerateQuestions(`Discussion Questions: ${topic}`, questions);
      setTopic('');
      setExpanded(false);
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-green-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Group Discussion Questions</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-green-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-green-200 p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Scripture Topic or Reference:</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Sermon on the Mount' or 'John 13-17'"
              className="text-sm"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Group Size:</label>
              <select
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                disabled={isLoading}
              >
                <option value="3-5">Small (3-5)</option>
                <option value="5-15">Medium (5-15)</option>
                <option value="15-30">Large (15-30)</option>
                <option value="30+">Very Large (30+)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                disabled={isLoading}
              >
                <option value="beginner">Beginner-Friendly</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging/Deep</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleGenerateQuestions}
            disabled={!topic.trim() || isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            Generate Questions
          </Button>

          <p className="text-xs text-gray-600 italic">
            💡 Tip: These questions work best for small groups, home churches, or Bible study classes. Customize based on your group's style and time available.
          </p>
        </div>
      )}
    </Card>
  );
}