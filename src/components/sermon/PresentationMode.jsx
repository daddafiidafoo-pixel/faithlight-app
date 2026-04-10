import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw, Download, Palette, Monitor, FileText, Printer, StickyNote, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SermonExporter from './SermonExporter';

export default function PresentationMode({ sermon, onClose }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [theme, setTheme] = useState('modern');
  const [showNotes, setShowNotes] = useState(false);
  const [presenterMode, setPresenterMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [notes, setNotes] = useState({});

  // Parse sermon into sections
  const sections = parseSermonSections(sermon.content);
  const totalSections = sections.length;

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSection]);

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExportPPTX = async () => {
    try {
      const pptxContent = sections.map((section, idx) => `
Slide ${idx + 1}:
${section.title}

${section.content}

${notes[idx] ? `\nSpeaker Notes:\n${notes[idx]}` : ''}
      `).join('\n\n---\n\n');

      const blob = new Blob([pptxContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sermon.title}-slides.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Slides exported! Import this file into PowerPoint or Google Slides');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export slides');
    }
  };

  const openPresenterView = () => {
    const presenterWindow = window.open('', '_blank', 'width=1200,height=800');
    if (presenterWindow) {
      presenterWindow.document.write(`
        <html>
          <head>
            <title>Presenter View - ${sermon.title}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: system-ui, -apple-system, sans-serif; background: #1f2937; color: white; height: 100vh; display: flex; flex-direction: column; }
              .header { background: #111827; padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
              .timer { font-size: 2rem; font-family: monospace; font-weight: bold; color: #60a5fa; }
              .content { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; overflow: hidden; }
              .current-slide, .next-slide { background: white; color: black; border-radius: 0.5rem; padding: 2rem; overflow-y: auto; }
              .next-slide { opacity: 0.6; }
              .notes { background: #374151; padding: 1.5rem; border-radius: 0.5rem; overflow-y: auto; grid-column: 1 / -1; }
              .slide-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; border-bottom: 3px solid #3b82f6; padding-bottom: 0.5rem; }
              .notes-title { font-size: 1rem; font-weight: bold; margin-bottom: 0.5rem; color: #fbbf24; }
              h2 { font-size: 1.2rem; margin-bottom: 0.5rem; }
            </style>
          </head>
          <body>
            <div class="header">
              <div><strong>${sermon.title}</strong> - Slide <span id="slide-num">1</span> / ${totalSections}</div>
              <div class="timer" id="timer">0:00</div>
            </div>
            <div class="content">
              <div class="current-slide">
                <div class="slide-title">Current Slide</div>
                <div id="current"></div>
              </div>
              <div class="next-slide">
                <div class="slide-title">Next Slide</div>
                <div id="next"></div>
              </div>
              <div class="notes">
                <div class="notes-title">Speaker Notes</div>
                <div id="notes">No notes for this slide</div>
              </div>
            </div>
            <script>
              let currentIdx = ${currentSection};
              const sections = ${JSON.stringify(sections)};
              const notesData = ${JSON.stringify(notes)};
              
              function updateView() {
                document.getElementById('slide-num').textContent = currentIdx + 1;
                document.getElementById('current').innerHTML = '<h2>' + (sections[currentIdx].title || '') + '</h2><p>' + sections[currentIdx].content.substring(0, 500) + '</p>';
                document.getElementById('next').innerHTML = sections[currentIdx + 1] ? '<h2>' + (sections[currentIdx + 1].title || '') + '</h2><p>' + sections[currentIdx + 1].content.substring(0, 500) + '</p>' : 'End of presentation';
                document.getElementById('notes').textContent = notesData[currentIdx] || 'No notes for this slide';
              }
              
              updateView();
              
              window.addEventListener('message', (e) => {
                if (e.data.type === 'UPDATE_SLIDE') {
                  currentIdx = e.data.section;
                  updateView();
                } else if (e.data.type === 'UPDATE_TIMER') {
                  document.getElementById('timer').textContent = e.data.time;
                }
              });
            </script>
          </body>
        </html>
      `);
      presenterWindow.document.close();
      setPresenterMode(true);
      toast.success('Presenter view opened in new window');
    } else {
      toast.error('Please allow popups to open presenter view');
    }
  };

  useEffect(() => {
    if (presenterMode) {
      const presenterWindow = window.open('', '_blank');
      if (presenterWindow) {
        presenterWindow.postMessage({ type: 'UPDATE_SLIDE', section: currentSection }, '*');
        presenterWindow.postMessage({ type: 'UPDATE_TIMER', time: formatTime(timer) }, '*');
      }
    }
  }, [currentSection, timer, presenterMode]);

  const currentSlide = sections[currentSection];

  const themes = {
    modern: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border-indigo-600',
      accent: 'text-indigo-700'
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-blue-500',
      accent: 'text-blue-400'
    },
    classic: {
      bg: 'bg-amber-50',
      text: 'text-gray-800',
      border: 'border-amber-600',
      accent: 'text-amber-800'
    },
    minimal: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      border: 'border-gray-400',
      accent: 'text-gray-700'
    }
  };

  const currentTheme = themes[theme];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header Controls */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
          <span className="text-sm font-semibold">{sermon.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-white hover:bg-gray-800"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <span className="text-lg font-mono">{formatTime(timer)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimer(0)}
              className="text-white hover:bg-gray-800"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-white" />
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32 h-8 text-xs bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes Toggle */}
          <Button
            variant={showNotes ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className={showNotes ? "" : "text-white hover:bg-gray-800"}
          >
            <StickyNote className="w-4 h-4" />
          </Button>

          {/* Presenter View */}
          <Button
            variant="ghost"
            size="sm"
            onClick={openPresenterView}
            className="text-white hover:bg-gray-800 gap-2"
          >
            <Monitor className="w-4 h-4" />
            <ExternalLink className="w-3 h-3" />
          </Button>

          {/* Export Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl p-3 space-y-2 min-w-[200px] z-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportPPTX}
                  className="w-full justify-start gap-2"
                >
                  <FileText className="w-4 h-4" />
                  PPTX Slides
                </Button>
                <div className="border-t pt-2">
                  <SermonExporter sermon={sermon} title={sermon.title} />
                </div>
              </div>
            )}
          </div>

          {/* Section Counter */}
          <span className="text-sm">
            {currentSection + 1} / {totalSections}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="max-w-6xl w-full flex gap-6">
          {/* Main Slide */}
          <div className={`flex-1 ${currentTheme.bg} rounded-2xl shadow-2xl p-12 overflow-y-auto`}>
            {currentSlide.title && (
              <h1 className={`text-5xl font-bold ${currentTheme.text} mb-8 border-b-4 ${currentTheme.border} pb-6`}>
                {currentSlide.title}
              </h1>
            )}
            <div className={`prose prose-2xl max-w-none ${currentTheme.text} leading-relaxed`}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className={`text-3xl mb-6 leading-relaxed ${currentTheme.text}`}>{children}</p>,
                  h1: ({ children }) => <h1 className={`text-5xl font-bold mb-6 ${currentTheme.text}`}>{children}</h1>,
                  h2: ({ children }) => <h2 className={`text-4xl font-semibold mb-4 ${currentTheme.text}`}>{children}</h2>,
                  h3: ({ children }) => <h3 className={`text-3xl font-semibold mb-4 ${currentTheme.text}`}>{children}</h3>,
                  ul: ({ children }) => <ul className={`space-y-4 ml-8 list-disc text-3xl ${currentTheme.text}`}>{children}</ul>,
                  ol: ({ children }) => <ol className={`space-y-4 ml-8 list-decimal text-3xl ${currentTheme.text}`}>{children}</ol>,
                  li: ({ children }) => <li className={`text-3xl leading-relaxed ${currentTheme.text}`}>{children}</li>,
                  strong: ({ children }) => <strong className={`${currentTheme.accent} font-bold`}>{children}</strong>,
                  em: ({ children }) => <em className={`${currentTheme.accent}`}>{children}</em>,
                }}
              >
                {currentSlide.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Speaker Notes Panel */}
          {showNotes && (
            <div className="w-80 bg-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <StickyNote className="w-4 h-4" />
                  Speaker Notes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(false)}
                  className="text-white hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <textarea
                value={notes[currentSection] || ''}
                onChange={(e) => setNotes({ ...notes, [currentSection]: e.target.value })}
                placeholder="Add speaker notes for this slide..."
                className="flex-1 bg-gray-700 text-white rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="mt-4 text-xs text-gray-400">
                Notes are saved locally and included in PPTX exports
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentSection === 0}
          className="text-white hover:bg-gray-800 gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </Button>

        <div className="text-white text-sm">
          Use ← → arrow keys or space to navigate • ESC to exit
        </div>

        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentSection === totalSections - 1}
          className="text-white hover:bg-gray-800 gap-2"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

function parseSermonSections(content) {
  const sections = [];
  
  // Split by major headings (##) or numbered points
  const parts = content.split(/(?=#{1,2}\s)|(?=\d+\.\s\*\*)/);
  
  parts.forEach(part => {
    const trimmed = part.trim();
    if (!trimmed) return;

    // Extract title from markdown heading or bold text
    const titleMatch = trimmed.match(/^#{1,2}\s(.+)|^\d+\.\s\*\*(.+)\*\*/m);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : '';
    
    const content = title 
      ? trimmed.replace(/^#{1,2}\s.+\n?|^\d+\.\s\*\*.+\*\*\n?/, '').trim()
      : trimmed;

    if (content) {
      sections.push({ title, content });
    }
  });

  // If no sections found, create one from entire content
  if (sections.length === 0) {
    sections.push({ title: '', content });
  }

  return sections;
}