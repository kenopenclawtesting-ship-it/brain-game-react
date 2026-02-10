import React from 'react';

function GameStage({ children, showCopyright = true }) {
  // Generate marquee lights for bottom strip
  const lights = Array.from({ length: 40 }, (_, i) => (
    <div key={i} className="marquee-light" />
  ));

  // Generate column lights (vertical)
  const columnLights = (side) => Array.from({ length: 14 }, (_, i) => (
    <div key={`${side}-${i}`} className="column-light" />
  ));

  return (
    <div className="game-stage">
      {/* Left metallic column */}
      <div className="stage-column stage-column-left">
        <div className="column-lights-strip">
          {columnLights('left')}
        </div>
      </div>

      {/* Right metallic column */}
      <div className="stage-column stage-column-right">
        <div className="column-lights-strip">
          {columnLights('right')}
        </div>
      </div>

      {/* Spotlights */}
      <div className="spotlight spotlight-left">
        <div className="spotlight-body" />
        <div className="spotlight-beam" />
      </div>
      <div className="spotlight spotlight-right">
        <div className="spotlight-body" />
        <div className="spotlight-beam" />
      </div>

      {/* Inner stage area where content goes */}
      <div className="stage-inner">
        {children}
      </div>

      {/* Platform with 3 tiered steps and marquee lights */}
      <div className="platform">
        <div className="platform-step-1" />
        <div className="platform-step-2" />
        <div className="platform-step-3" />
        <div className="marquee-strip">{lights}</div>
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
