"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AccessibilitySettings {
  highContrast: boolean;
  dyslexicFont: boolean;
  largeText: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  toggleHighContrast: () => void;
  toggleDyslexicFont: () => void;
  toggleLargeText: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    dyslexicFont: false,
    largeText: false,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("accessibility-settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    
    const html = document.documentElement;
    
    if (settings.highContrast) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }
    
    if (settings.dyslexicFont) {
      html.classList.add("dyslexic-font");
    } else {
      html.classList.remove("dyslexic-font");
    }
    
    if (settings.largeText) {
      html.classList.add("large-text");
    } else {
      html.classList.remove("large-text");
    }
  }, [settings]);

  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleDyslexicFont = useCallback(() => {
    setSettings(prev => ({ ...prev, dyslexicFont: !prev.dyslexicFont }));
  }, []);

  const toggleLargeText = useCallback(() => {
    setSettings(prev => ({ ...prev, largeText: !prev.largeText }));
  }, []);

  const speakText = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleHighContrast,
        toggleDyslexicFont,
        toggleLargeText,
        speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
