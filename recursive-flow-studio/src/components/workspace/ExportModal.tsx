import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, FileText, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

interface ExportModalProps {
  onClose: () => void;
  containerId: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, containerId }) => {
  const [format, setFormat] = useState<'png' | 'jpg' | 'svg' | 'pdf'>('png');
  const [scale, setScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const element = document.getElementById(containerId);
    if (!element) return;

    try {
      if (format === 'pdf') {
        const canvas = await html2canvas(element, {
          scale,
          backgroundColor: '#0a0a0a',
          logging: false,
          useCORS: true
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('recursion-tree.pdf');
      } else if (format === 'svg') {
        // Basic SVG export - find the SVG element inside the container
        const svgElement = element.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          saveAs(svgBlob, 'recursion-tree.svg');
        }
      } else {
        const canvas = await html2canvas(element, {
          scale,
          backgroundColor: '#0a0a0a',
          logging: false,
          useCORS: true
        });
        canvas.toBlob((blob) => {
          if (blob) saveAs(blob, `recursion-tree.${format}`);
        }, `image/${format === 'png' ? 'png' : 'jpeg'}`);
      }
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[400px] bg-background-secondary border border-border-color rounded-xl shadow-2xl overflow-hidden">
        <div className="h-12 flex items-center justify-between px-4 border-b border-border-color">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-accent-blue" />
            <span className="text-xs font-bold uppercase tracking-widest">Export Visualization</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-background-card rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Format</label>
            <div className="grid grid-cols-4 gap-2">
              {(['png', 'jpg', 'svg', 'pdf'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2 rounded border text-xs font-bold uppercase transition-all ${
                    format === f 
                      ? 'bg-accent-blue/10 border-accent-blue text-accent-blue' 
                      : 'bg-background-card border-border-color text-text-secondary hover:border-text-secondary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Scale / Resolution</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" max="4" step="1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="flex-1 h-1 bg-background-card rounded-lg appearance-none cursor-pointer accent-accent-blue"
              />
              <span className="text-xs font-mono text-accent-blue w-8">{scale}x</span>
            </div>
          </div>

          <div className="bg-background-card/50 p-4 rounded-lg border border-border-color space-y-2">
            <div className="flex items-center gap-2 text-text-secondary">
              {format === 'pdf' ? <FileText size={14} /> : <ImageIcon size={14} />}
              <span className="text-[10px] font-medium uppercase">Exporting as {format.toUpperCase()}</span>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              {format === 'pdf' 
                ? 'Generates a high-quality PDF document of the current visualization.' 
                : `Exports the current tree as a ${format.toUpperCase()} image with preserved theme and glow.`}
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3 bg-accent-blue hover:bg-accent-blue/80 disabled:bg-background-card disabled:text-text-secondary text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isExporting ? 'EXPORTING...' : 'DOWNLOAD NOW'}
          </button>
        </div>
      </div>
    </div>
  );
};
