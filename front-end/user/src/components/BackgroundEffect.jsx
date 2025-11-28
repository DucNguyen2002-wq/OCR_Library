/**
 * BackgroundEffect Component
 * 
 * Component quản lý hiệu ứng background động cho ứng dụng
 * Hỗ trợ 3 loại hiệu ứng:
 * 1. gradient-wave: Sóng gradient động
 * 2. floating-icons: Icon sách trôi nhẹ
 * 3. floating-particles: Hạt ánh sáng trôi
 */

import React, { useState, useEffect } from 'react';
import '../styles/backgrounds/gradient-wave.css';
import '../styles/backgrounds/floating-icons.css';
import '../styles/backgrounds/floating-particles.css';

const BackgroundEffect = ({ effectType = 'gradient-wave', enabled = true }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!enabled || !mounted) {
    return null;
  }

  // Gradient Wave Effect
  if (effectType === 'gradient-wave') {
    return <div className="gradient-wave-background" aria-hidden="true" />;
  }

  // Floating Icons Effect
  if (effectType === 'floating-icons') {
    return (
      <div className="floating-icons-background" aria-hidden="true">
        <div className="floating-icon icon-book"></div>
        <div className="floating-icon icon-bookmark"></div>
        <div className="floating-icon icon-pen"></div>
        <div className="floating-icon icon-book"></div>
        <div className="floating-icon icon-bookmark"></div>
        <div className="floating-icon icon-pen"></div>
        <div className="floating-icon icon-book"></div>
        <div className="floating-icon icon-bookmark"></div>
      </div>
    );
  }

  // Floating Particles Effect
  if (effectType === 'floating-particles') {
    return (
      <div className="floating-particles-background" aria-hidden="true">
        {[...Array(15)].map((_, index) => (
          <div key={index} className="particle"></div>
        ))}
      </div>
    );
  }

  // Default: no effect
  return null;
};

export default BackgroundEffect;
