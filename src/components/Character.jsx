import React from 'react';

function Character({ message }) {
  return (
    <div className="character-wrapper">
      {message && (
        <div className="speech-bubble">{message}</div>
      )}
      {/* Chibi character placeholder - SVG */}
      <svg width="160" height="200" viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg">
        {/* Hair back */}
        <ellipse cx="80" cy="65" rx="55" ry="55" fill="#1a1a1a" />
        {/* Spiky hair bits */}
        <path d="M25 50 Q15 20 40 30 Q30 10 55 25" fill="#1a1a1a" />
        <path d="M135 50 Q145 20 120 30 Q130 10 105 25" fill="#1a1a1a" />
        <path d="M60 10 Q70 -5 80 10 Q90 -5 100 10" fill="#1a1a1a" />
        {/* Face */}
        <ellipse cx="80" cy="72" rx="42" ry="40" fill="#FFDCB5" />
        {/* Eyes */}
        <ellipse cx="65" cy="70" rx="7" ry="8" fill="white" />
        <ellipse cx="95" cy="70" rx="7" ry="8" fill="white" />
        <ellipse cx="65" cy="71" rx="4" ry="5" fill="#2a2a2a" />
        <ellipse cx="95" cy="71" rx="4" ry="5" fill="#2a2a2a" />
        <ellipse cx="66" cy="69" rx="2" ry="2" fill="white" />
        <ellipse cx="96" cy="69" rx="2" ry="2" fill="white" />
        {/* Eyebrows */}
        <path d="M55 60 Q65 55 75 60" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
        <path d="M85 60 Q95 55 105 60" stroke="#1a1a1a" strokeWidth="2.5" fill="none" />
        {/* Mouth - smile */}
        <path d="M68 85 Q80 95 92 85" stroke="#c0755a" strokeWidth="2" fill="none" />
        {/* Cheek blush */}
        <ellipse cx="52" cy="82" rx="8" ry="5" fill="rgba(255,150,150,0.3)" />
        <ellipse cx="108" cy="82" rx="8" ry="5" fill="rgba(255,150,150,0.3)" />
        {/* Body - shirt */}
        <rect x="55" y="110" width="50" height="55" rx="8" fill="white" />
        {/* Tie */}
        <polygon points="80,115 75,130 80,140 85,130" fill="#3a8a3a" />
        {/* Arms */}
        <rect x="35" y="115" width="22" height="12" rx="6" fill="white" />
        <rect x="103" y="115" width="22" height="12" rx="6" fill="white" />
        {/* Hands */}
        <circle cx="33" cy="121" r="8" fill="#FFDCB5" />
        <circle cx="127" cy="121" r="8" fill="#FFDCB5" />
        {/* Wave hand (right) - raised */}
        <circle cx="132" cy="108" r="8" fill="#FFDCB5" />
        <rect x="120" y="105" width="14" height="12" rx="5" fill="white" />
      </svg>
    </div>
  );
}

export default Character;
