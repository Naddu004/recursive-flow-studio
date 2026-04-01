import React, { useState } from 'react';
import { Share2, Copy, Check, Globe, Lock, Mail, Twitter, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ShareModal = ({ onClose }: { onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-background-secondary border border-border-color rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border-color bg-background-card/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center text-accent-blue">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight">Share Workspace</h2>
              <p className="text-xs text-text-secondary">Collaborate with others on this recursion flow</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Workspace URL</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-background-primary border border-border-color rounded-lg px-3 py-2 text-xs text-text-secondary truncate font-mono">
                {shareUrl}
              </div>
              <button 
                onClick={handleCopy}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-all flex items-center gap-2 text-xs font-bold active:scale-95"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'COPIED' : 'COPY'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 glass rounded-xl border-accent-blue/20 bg-accent-blue/5 cursor-pointer hover:border-accent-blue/40 transition-all group">
              <Globe size={20} className="text-accent-blue mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-text-primary mb-1">Public Access</div>
              <div className="text-[10px] text-text-secondary">Anyone with the link can view</div>
            </div>
            <div className="p-4 glass rounded-xl border-border-color bg-background-card cursor-pointer hover:border-accent-blue/40 transition-all group">
              <Lock size={20} className="text-text-secondary mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-text-primary mb-1">Private Access</div>
              <div className="text-[10px] text-text-secondary">Only invited users can view</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            <button className="text-text-secondary hover:text-accent-blue transition-colors"><Twitter size={20} /></button>
            <button className="text-text-secondary hover:text-accent-blue transition-colors"><Github size={20} /></button>
            <button className="text-text-secondary hover:text-accent-blue transition-colors"><Mail size={20} /></button>
          </div>
        </div>

        <div className="p-4 bg-background-card/50 border-t border-border-color flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </div>
  );
};
