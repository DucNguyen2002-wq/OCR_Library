/**
 * BackgroundSettings Component
 * 
 * Component cho phép user chọn hiệu ứng background
 * Lưu preference vào localStorage
 */

import React, { useState, useEffect } from 'react';
import './BackgroundSettings.css';

const BackgroundSettings = () => {
  const [backgroundType, setBackgroundType] = useState(() => {
    return localStorage.getItem('backgroundEffect') || 'gradient-wave';
  });
  
  const [enabled, setEnabled] = useState(() => {
    const savedEnabled = localStorage.getItem('backgroundEnabled');
    return savedEnabled === null ? true : savedEnabled === 'true';
  });

  const [showSettings, setShowSettings] = useState(false);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('backgroundEffect', backgroundType);
  }, [backgroundType]);

  useEffect(() => {
    localStorage.setItem('backgroundEnabled', enabled.toString());
    
    // Trigger custom event to notify App.jsx to update background
    window.dispatchEvent(new CustomEvent('backgroundSettingsChanged', {
      detail: { backgroundType, enabled }
    }));
  }, [enabled, backgroundType]);

  const effects = [
    {
      id: 'gradient-wave',
      name: 'Gradient Wave',
      description: 'Sóng gradient nhẹ nhàng - Hiện đại & Professional',
      icon: '🌊',
      performance: '⭐⭐⭐⭐⭐'
    },
    {
      id: 'floating-icons',
      name: 'Floating Icons',
      description: 'Icon sách trôi nhẹ - Truyền thống & Ấm áp',
      icon: '📚',
      performance: '⭐⭐⭐⭐'
    },
    {
      id: 'floating-particles',
      name: 'Floating Particles',
      description: 'Hạt ánh sáng trôi - Nghệ thuật & Cổ điển',
      icon: '✨',
      performance: '⭐⭐⭐⭐'
    }
  ];

  return (
    <div className="background-settings">
      <button 
        className="settings-toggle-btn"
        onClick={() => setShowSettings(!showSettings)}
        title="Cài đặt hiệu ứng nền"
      >
        🎨
      </button>

      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>🎨 Hiệu Ứng Nền</h3>
            <button 
              className="close-btn"
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>
          </div>

          <div className="settings-content">
            {/* Enable/Disable Toggle */}
            <div className="setting-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                <span className="toggle-text">
                  {enabled ? 'Bật hiệu ứng nền' : 'Tắt hiệu ứng nền'}
                </span>
              </label>
            </div>

            {/* Effect Selection */}
            {enabled && (
              <div className="effects-grid">
                {effects.map((effect) => (
                  <div
                    key={effect.id}
                    className={`effect-card ${backgroundType === effect.id ? 'active' : ''}`}
                    onClick={() => setBackgroundType(effect.id)}
                  >
                    <div className="effect-icon">{effect.icon}</div>
                    <div className="effect-info">
                      <h4>{effect.name}</h4>
                      <p>{effect.description}</p>
                      <div className="effect-performance">
                        <small>Performance: {effect.performance}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="settings-info">
              <small>
                💡 Hiệu ứng nền tạo cảm giác thư viện sống động mà không ảnh hưởng đến nội dung chính.
                Chọn hiệu ứng phù hợp với sở thích của bạn!
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSettings;
