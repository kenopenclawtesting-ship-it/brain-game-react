import React from 'react';

function GameStage({ children, showCopyright = true }) {
  return (
    <div className="game-stage">
      {/* Background image from extracted Flash sprite */}
      <img
        src="/sprites/DefineSprite_282_BgBrain/1.png"
        alt=""
        className="stage-bg-img"
        draggable={false}
      />

      {/* Left column with marquee lights */}
      <div className="stage-column stage-column-left">
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className="column-light" style={{ animationDelay: `${(i % 3) * 0.33}s` }} />
        ))}
      </div>

      {/* Right column with marquee lights */}
      <div className="stage-column stage-column-right">
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className="column-light" style={{ animationDelay: `${((i + 1) % 3) * 0.33}s` }} />
        ))}
      </div>

      {/* Spotlights */}
      <div className="spotlight spotlight-left" />
      <div className="spotlight spotlight-right" />

      {/* Inner content area */}
      <div className="stage-inner">
        {children}
      </div>

      {/* Platform (pink tiered steps) */}
      <div className="platform">
        <div className="platform-step step-1" />
        <div className="platform-step step-2" />
        <div className="platform-step step-3" />
        <div className="marquee-strip">
          {Array.from({ length: 32 }, (_, i) => (
            <div key={i} className="marquee-light" style={{ animationDelay: `${(i % 3) * 0.33}s` }} />
          ))}
        </div>
        <div className="pedestal" />
      </div>

      {/* Copyright */}
      {showCopyright && (
        <div className="copyright-bar">
          © 2007-2008 Playfish Ltd. All Rights Reserved
        </div>
      )}
    </div>
  );
}

export default GameStage;
