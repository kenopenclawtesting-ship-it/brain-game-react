import React from 'react';

function GameStage({ children, showCopyright = true }) {
  // Generate marquee lights
  const lights = Array.from({ length: 40 }, (_, i) => (
    <div key={i} className="marquee-light" />
  ));

  return (
    <div className="game-stage">
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

      {/* Platform with marquee lights */}
      <div className="platform">
        <div className="platform-top" />
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
