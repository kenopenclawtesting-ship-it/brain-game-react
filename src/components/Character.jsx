import React from 'react';

function Character({ message }) {
  return (
    <div className="character-wrapper">
      {message && (
        <div className="speech-bubble" style={{ marginTop: 55 }}>{message}</div>
      )}
      {/* Character matching OG Flash game style */}
      <svg width="140" height="180" viewBox="0 0 140 180" xmlns="http://www.w3.org/2000/svg">
        {/* Hair - messy, voluminous, dark curly/wavy */}
        <ellipse cx="70" cy="52" rx="50" ry="50" fill="#1C1C1C" />
        {/* Curly hair tufts sticking out */}
        <circle cx="25" cy="35" r="15" fill="#1C1C1C" />
        <circle cx="115" cy="35" r="15" fill="#1C1C1C" />
        <circle cx="30" cy="18" r="12" fill="#1C1C1C" />
        <circle cx="55" cy="8" r="14" fill="#1C1C1C" />
        <circle cx="85" cy="5" r="16" fill="#1C1C1C" />
        <circle cx="110" cy="15" r="13" fill="#1C1C1C" />
        <circle cx="120" cy="50" r="10" fill="#1C1C1C" />
        <circle cx="20" cy="50" r="10" fill="#1C1C1C" />
        <circle cx="40" cy="3" r="10" fill="#1C1C1C" />
        <circle cx="100" cy="3" r="10" fill="#1C1C1C" />
        
        {/* Face - large round, beige/peach */}
        <ellipse cx="70" cy="62" rx="38" ry="36" fill="#FDE8CE" />
        
        {/* Rosy cheeks - prominent pink circles */}
        <ellipse cx="42" cy="72" rx="10" ry="7" fill="rgba(255,140,160,0.45)" />
        <ellipse cx="98" cy="72" rx="10" ry="7" fill="rgba(255,140,160,0.45)" />
        
        {/* Eyes - small black dots */}
        <circle cx="58" cy="60" r="3.5" fill="#1C1C1C" />
        <circle cx="82" cy="60" r="3.5" fill="#1C1C1C" />
        
        {/* Tiny eye highlights */}
        <circle cx="59.5" cy="58.5" r="1.2" fill="white" />
        <circle cx="83.5" cy="58.5" r="1.2" fill="white" />
        
        {/* Small smile */}
        <path d="M62 75 Q70 82 78 75" stroke="#C08060" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        
        {/* Neck */}
        <rect x="62" y="94" width="16" height="10" fill="#FDE8CE" />
        
        {/* Body - white shirt */}
        <rect x="42" y="100" width="56" height="50" rx="8" fill="white" />
        
        {/* Shirt collar V-shape */}
        <path d="M58 100 L70 115 L82 100" stroke="#E8E8E8" strokeWidth="1.5" fill="none" />
        
        {/* Green diamond tie */}
        <polygon points="70,105 65,118 70,132 75,118" fill="#3A8A3A" />
        
        {/* Arms outstretched */}
        <rect x="20" y="108" width="26" height="11" rx="5.5" fill="white" />
        <rect x="94" y="108" width="26" height="11" rx="5.5" fill="white" />
        
        {/* Hands - flesh colored */}
        <circle cx="18" cy="113" r="7" fill="#FDE8CE" />
        <circle cx="122" cy="113" r="7" fill="#FDE8CE" />
        
        {/* Right hand waving slightly higher */}
        <circle cx="124" cy="105" r="7" fill="#FDE8CE" />
        <rect x="112" y="102" width="14" height="10" rx="5" fill="white" />
      </svg>
      {/* Metallic podium */}
      <div className="character-pedestal" />
    </div>
  );
}

export default Character;
