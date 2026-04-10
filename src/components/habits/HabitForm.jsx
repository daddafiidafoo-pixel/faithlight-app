import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function HabitForm({ onSubmit, onCancel, lang }) {
  const [goalName, setGoalName] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('1');
  const [targetUnit, setTargetUnit] = useState('chapters');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState('blue');

  const UNITS = ['chapters', 'minutes', 'verses', 'hours', 'pages', 'prayers'];
  const COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'pink'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goalName.trim()) {
      alert('Please enter a goal name');
      return;
    }
    onSubmit({
      goal_name: goalName,
      description,
      target_value: parseFloat(targetValue),
      target_unit: targetUnit,
      frequency,
      color,
    });
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle>Create Spiritual Goal</CardTitle>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Goal Name</label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="E.g., Read Bible Chapter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this important to you?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Value</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                min="0.5"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === c ? 'border-gray-800' : 'border-gray-300'
                    } bg-${c}-500`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Create Goal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}