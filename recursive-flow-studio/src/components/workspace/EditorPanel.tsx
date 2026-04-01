import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { Language, EngineSettings } from '../../types';
import { Type, Minus, Plus, Settings2 } from 'lucide-react';

interface EditorPanelProps {
  code: string;
  onChange: (value: string) => void;
  language: Language;
  settings: EngineSettings;
  onUpdateSettings: (settings: EngineSettings) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ code, onChange, language, settings, onUpdateSettings }) => {
  const updateSetting = (key: keyof EngineSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const getExtensions = () => {
    switch (language) {
      case 'javascript': return [javascript({ jsx: true })];
      case 'python': return [python()];
      case 'cpp': return [cpp()];
      case 'java': return [java()];
      case 'csharp': return [cpp()]; // C# is similar to C++ for basic highlighting
      default: return [javascript()];
    }
  };

  const fonts = [
    'Hack',
    'Fira Code',
    'JetBrains Mono',
    'Cascadia Code',
    'Source Code Pro',
    'monospace'
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#282c34]">
      {/* Editor Toolbar */}
      <div className="h-10 border-b border-white/5 bg-black/20 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Type size={14} className="text-text-secondary" />
            <select 
              value={settings.fontFamily}
              onChange={(e) => updateSetting('fontFamily', e.target.value)}
              className="bg-transparent text-[10px] font-medium text-text-secondary outline-none cursor-pointer hover:text-text-primary transition-colors"
            >
              {fonts.map(f => <option key={f} value={f} className="bg-[#282c34]">{f}</option>)}
            </select>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-1">
            <button 
              onClick={() => updateSetting('fontSize', Math.max(8, settings.fontSize - 1))}
              className="p-1 hover:bg-white/5 rounded text-text-secondary transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="text-[10px] font-mono text-text-secondary w-4 text-center">{settings.fontSize}</span>
            <button 
              onClick={() => updateSetting('fontSize', Math.min(32, settings.fontSize + 1))}
              className="p-1 hover:bg-white/5 rounded text-text-secondary transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-accent-blue uppercase tracking-widest">{language}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          theme={oneDark}
          extensions={getExtensions()}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            autocompletion: true,
          }}
          style={{ 
            fontSize: `${settings.fontSize}px`, 
            fontFamily: `${settings.fontFamily}, monospace`,
            lineHeight: settings.lineHeight,
            height: '100%' 
          }}
        />
      </div>
    </div>
  );
};
