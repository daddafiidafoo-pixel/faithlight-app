import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, Circle, Lock, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function PathProgressDisplay({ path, isDarkMode, onItemComplete }) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  if (!path) return null;

  const currentItem = path.items?.[path.current_step_index];

  return (
    <>
      <Card style={{ backgroundColor: cardColor, borderColor }}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle style={{ color: textColor }}>{path.path_name}</CardTitle>
              <p className="text-xs mt-1" style={{ color: mutedColor }}>
                {path.primary_interests?.join(', ')}
              </p>
            </div>
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: path.status === 'completed' ? '#10b981' : primaryColor,
                color: '#FFFFFF'
              }}
            >
              {path.status}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold" style={{ color: textColor }}>
                Overall Progress
              </span>
              <span className="text-sm" style={{ color: mutedColor }}>
                {Math.round(path.overall_progress_percent)}%
              </span>
            </div>
            <Progress value={path.overall_progress_percent} className="h-2" />
          </div>

          {/* Time Progress */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
            <div>
              <p className="text-xs" style={{ color: mutedColor }}>Completed</p>
              <p className="text-lg font-semibold" style={{ color: textColor }}>
                {path.total_completed_hours}h
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: mutedColor }}>Total</p>
              <p className="text-lg font-semibold" style={{ color: textColor }}>
                {path.total_estimated_hours}h
              </p>
            </div>
          </div>

          {/* Current Item */}
          {currentItem && (
            <div className="border rounded-lg p-4" style={{ borderColor, backgroundColor: bgColor }}>
              <div className="flex items-start gap-3">
                <Circle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: textColor }}>
                    {currentItem.sequence_order}. {currentItem.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>
                    {currentItem.estimated_duration_hours} hours
                  </p>
                  {currentItem.ai_summary && (
                    <p className="text-xs mt-2" style={{ color: mutedColor }}>
                      {currentItem.ai_summary}
                    </p>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      onItemComplete?.(currentItem);
                      toast.success('Module marked as completed!');
                    }}
                    className="mt-3 gap-2"
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Sequence Overview */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold" style={{ color: textColor }}>
                Learning Sequence
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="text-xs gap-1"
                style={{ color: primaryColor }}
              >
                View All
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-1">
              {path.items?.slice(0, 3).map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded text-xs">
                  {item.is_completed ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} />
                  ) : idx === path.current_step_index ? (
                    <Circle className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
                  ) : (
                    <Lock className="w-4 h-4 flex-shrink-0" style={{ color: mutedColor }} />
                  )}
                  <span style={{ color: item.is_completed ? '#10b981' : textColor }}>
                    {item.title}
                  </span>
                </div>
              ))}
              {path.items?.length > 3 && (
                <p className="text-xs text-center mt-2" style={{ color: mutedColor }}>
                  +{path.items.length - 3} more items
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetails && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: cardColor }}>
            <DialogHeader>
              <DialogTitle style={{ color: textColor }}>Learning Path Sequence</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              {path.items?.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="w-full p-4 rounded-lg border text-left transition-all hover:shadow-md"
                  style={{
                    backgroundColor: bgColor,
                    borderColor: selectedItem?.id === item.id ? primaryColor : borderColor,
                    borderWidth: selectedItem?.id === item.id ? '2px' : '1px'
                  }}
                >
                  <div className="flex items-start gap-3">
                    {item.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                    ) : idx === path.current_step_index ? (
                      <Circle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                    ) : (
                      <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: mutedColor }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold" style={{ color: textColor }}>
                        {item.sequence_order}. {item.title}
                      </p>
                      <p className="text-xs mt-1" style={{ color: mutedColor }}>
                        {item.estimated_duration_hours} hours • {item.type}
                      </p>
                      {item.is_completed && item.key_takeaways?.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: '#10b981' }}>
                          <Sparkles className="w-3 h-3" />
                          Has summary
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}