export function createFluidBlob(touchpointInstance: any) {
  // Create the blob container
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="fluid-blob-container">
      <svg width="72" height="72" class="fluid-blob-svg" viewBox="0 0 72 72">
        <defs>
          <!-- Enhanced gradient with blacks for contrast -->
          <linearGradient id="blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0.8" />
            <stop offset="15%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="30%" style="stop-color:#1a1a1a;stop-opacity:0.9" />
            <stop offset="45%" style="stop-color:#764ba2;stop-opacity:1" />
            <stop offset="60%" style="stop-color:#f093fb;stop-opacity:1" />
            <stop offset="75%" style="stop-color:#2c2c2c;stop-opacity:0.7" />
            <stop offset="90%" style="stop-color:#f5576c;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4facfe;stop-opacity:1" />
          </linearGradient>
          
          <!-- Dynamic inner gradient with dark contrast -->
          <radialGradient id="inner-gradient" cx="50%" cy="30%" r="60%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
            <stop offset="20%" style="stop-color:#f0f8ff;stop-opacity:0.7" />
            <stop offset="40%" style="stop-color:#000000;stop-opacity:0.3" />
            <stop offset="70%" style="stop-color:#e6f3ff;stop-opacity:0.4" />
            <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:0.2" />
            <animateTransform attributeName="gradientTransform" 
              type="rotate" 
              values="0 36 22;360 36 22" 
              dur="8s" 
              repeatCount="indefinite"/>
          </radialGradient>
          
          <!-- 3D Tangent developable gradient - flowing like tangent lines with depth -->
          <linearGradient id="tangent-gradient-3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="20%" style="stop-color:#4facfe;stop-opacity:0.9" />
            <stop offset="40%" style="stop-color:#f093fb;stop-opacity:0.7" />
            <stop offset="60%" style="stop-color:#667eea;stop-opacity:0.8" />
            <stop offset="80%" style="stop-color:#f5576c;stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.3" />
            <animateTransform attributeName="gradientTransform" 
              type="rotate" 
              values="0 36 36;180 36 36;360 36 36" 
              dur="12s" 
              repeatCount="indefinite"/>
          </linearGradient>
          
          <!-- 3D Surface gradient for depth layers -->
          <linearGradient id="surface-3d" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8" />
            <stop offset="33%" style="stop-color:#764ba2;stop-opacity:0.6" />
            <stop offset="66%" style="stop-color:#4facfe;stop-opacity:0.4" />
            <stop offset="100%" style="stop-color:#f093fb;stop-opacity:0.2" />
            <animateTransform attributeName="gradientTransform" 
              type="skewX" 
              values="0;15;-10;0" 
              dur="8s" 
              repeatCount="indefinite"/>
          </linearGradient>
          
          <!-- Envelope gradient for developable surface effect with 3D lighting -->
          <radialGradient id="envelope-gradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="30%" style="stop-color:#f5576c;stop-opacity:0.8" />
            <stop offset="60%" style="stop-color:#764ba2;stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:#4facfe;stop-opacity:0.2" />
            <animateTransform attributeName="gradientTransform" 
              type="rotate scale" 
              values="0 1;120 1.2;240 0.9;360 1" 
              dur="10s" 
              repeatCount="indefinite"/>
          </radialGradient>
          
          <!-- 3D Shadow gradient for depth -->
          <radialGradient id="depth-shadow" cx="60%" cy="40%" r="50%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0" />
            <stop offset="70%" style="stop-color:#1a1a1a;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0.6" />
          </radialGradient>
          
          <!-- Sparkle gradient with dark base -->
          <radialGradient id="sparkle-gradient" cx="50%" cy="50%" r="30%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#f093fb;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
          </radialGradient>
          
          <!-- Dark shadow gradient -->
          <radialGradient id="shadow-gradient" cx="50%" cy="70%" r="40%">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0.6" />
            <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
          </radialGradient>
          
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="inner-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="innerGlow"/>
            <feComposite in="innerGlow" in2="SourceGraphic" operator="over"/>
          </filter>
          
          <filter id="depth-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="depthBlur"/>
            <feComposite in="depthBlur" in2="SourceGraphic" operator="over"/>
          </filter>
          
          <filter id="tangent-glow-3d" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="tangentGlow3D"/>
            <feOffset in="tangentGlow3D" dx="0.5" dy="1" result="offsetGlow"/>
            <feMerge>
              <feMergeNode in="offsetGlow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <!-- Clipping path to keep curves inside the blob -->
          <clipPath id="blob-clip">
            <circle cx="36" cy="36" r="20"/>
          </clipPath>
        </defs>
        
        <!-- Dark shadow base -->
        <ellipse cx="36" cy="40" rx="25" ry="20" fill="url(#shadow-gradient)" opacity="0.4">
          <animate attributeName="rx" values="25;30;22;25" dur="6s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="20;15;25;20" dur="6s" repeatCount="indefinite"/>
        </ellipse>
        
        <!-- Main blob shape (20% larger) -->
        <path class="blob-path" fill="url(#blob-gradient)" filter="url(#glow)">
          <animate attributeName="d" 
            dur="5s" 
            repeatCount="indefinite"
            values="M36,14 C50,14 58,22 58,36 C58,50 50,58 36,58 C22,58 14,50 14,36 C14,22 22,14 36,14 Z;
                    M40,12 C54,17 60,29 58,42 C55,55 43,60 30,58 C17,55 12,43 14,30 C17,17 29,12 40,12 Z;
                    M31,11 C47,13 62,24 60,38 C58,53 42,59 28,56 C13,54 11,38 13,28 C16,13 24,11 31,11 Z;
                    M38,10 C52,13 62,26 60,40 C58,53 44,58 31,55 C18,53 10,40 12,26 C14,13 25,10 38,10 Z;
                    M34,13 C47,13 59,25 59,38 C59,52 47,59 34,59 C20,59 13,52 13,38 C13,25 20,13 34,13 Z;
                    M36,14 C50,14 58,22 58,36 C58,50 50,58 36,58 C22,58 14,50 14,36 C14,22 22,14 36,14 Z"/>
        </path>
        
        <!-- Group for 3D tangent developable curves -->
        <g clip-path="url(#blob-clip)">
          <!-- 3D Tangent Developable - Back Layer (furthest) -->
          <g opacity="0.3" transform="scale(0.8) translate(4,6)" filter="url(#depth-blur)">
            <!-- Back surface tangents -->
            <path fill="none" stroke="url(#depth-shadow)" stroke-width="1.2" stroke-linecap="round">
              <animate attributeName="d" 
                dur="16s" 
                repeatCount="indefinite"
                values="M28,32 Q36,28 44,32 Q48,36 44,40 Q36,44 28,40 Q24,36 28,32;
                        M26,34 Q36,26 46,34 Q50,38 46,42 Q36,46 26,42 Q22,38 26,34;
                        M30,30 Q36,30 42,30 Q46,34 42,38 Q36,42 30,38 Q26,34 30,30;
                        M24,36 Q36,24 48,36 Q52,40 48,44 Q36,48 24,44 Q20,40 24,36;
                        M28,32 Q36,28 44,32 Q48,36 44,40 Q36,44 28,40 Q24,36 28,32"/>
              <animateTransform attributeName="transform" 
                type="rotateX" 
                values="0;30;60;30;0" 
                dur="16s" 
                repeatCount="indefinite"/>
            </path>
          </g>
          
          <!-- 3D Tangent Developable - Middle Layer -->
          <g opacity="0.6" transform="scale(0.9) translate(2,3)">
            <!-- Middle surface tangents with 3D perspective -->
            <path fill="none" stroke="url(#surface-3d)" stroke-width="1.0" filter="url(#tangent-glow-3d)" stroke-linecap="round">
              <animate attributeName="d" 
                dur="12s" 
                repeatCount="indefinite"
                values="M30,30 Q36,26 42,30 Q46,34 42,38 Q36,42 30,38 Q26,34 30,30;
                        M28,32 Q36,24 44,32 Q48,36 44,40 Q36,44 28,40 Q24,36 28,32;
                        M32,28 Q36,28 40,28 Q44,32 40,36 Q36,40 32,36 Q28,32 32,28;
                        M26,34 Q36,22 46,34 Q50,38 46,42 Q36,46 26,42 Q22,38 26,34;
                        M30,30 Q36,26 42,30 Q46,34 42,38 Q36,42 30,38 Q26,34 30,30"/>
              <animateTransform attributeName="transform" 
                type="rotateY" 
                values="0;-20;20;-10;0" 
                dur="12s" 
                repeatCount="indefinite"/>
            </path>
            
            <!-- Secondary middle tangent -->
            <path fill="none" stroke="url(#tangent-gradient-3d)" stroke-width="0.8" filter="url(#tangent-glow-3d)" stroke-linecap="round">
              <animate attributeName="d" 
                dur="14s" 
                repeatCount="indefinite" 
                begin="3s"
                values="M32,26 Q36,30 40,26 Q44,30 40,34 Q36,38 32,34 Q28,30 32,26;
                        M30,28 Q36,32 42,28 Q46,32 42,36 Q36,40 30,36 Q26,32 30,28;
                        M34,24 Q36,28 38,24 Q42,28 38,32 Q36,36 34,32 Q30,28 34,24;
                        M28,30 Q36,34 44,30 Q48,34 44,38 Q36,42 28,38 Q24,34 28,30;
                        M32,26 Q36,30 40,26 Q44,30 40,34 Q36,38 32,34 Q28,30 32,26"/>
              <animateTransform attributeName="transform" 
                type="skewX" 
                values="0;10;-5;15;0" 
                dur="14s" 
                repeatCount="indefinite"/>
            </path>
          </g>
          
          <!-- 3D Tangent Developable - Front Layer (closest) -->
          <g opacity="0.8">
            <!-- Primary front tangent family with full 3D transforms -->
            <path fill="none" stroke="url(#tangent-gradient-3d)" stroke-width="1.4" filter="url(#tangent-glow-3d)" stroke-linecap="round">
              <animate attributeName="d" 
                dur="10s" 
                repeatCount="indefinite"
                values="M24,28 Q36,24 48,28 Q52,32 48,36 Q36,40 24,36 Q20,32 24,28;
                        M26,30 Q36,22 46,30 Q50,34 46,38 Q36,42 26,38 Q22,34 26,30;
                        M22,26 Q36,26 50,26 Q54,30 50,34 Q36,38 22,34 Q18,30 22,26;
                        M28,32 Q36,20 44,32 Q48,36 44,40 Q36,44 28,40 Q24,36 28,32;
                        M24,28 Q36,24 48,28 Q52,32 48,36 Q36,40 24,36 Q20,32 24,28"/>
              <animateTransform attributeName="transform" 
                type="rotateZ" 
                values="0;15;-10;20;0" 
                dur="10s" 
                repeatCount="indefinite"/>
            </path>
            
            <!-- Secondary front tangent with different 3D rotation -->
            <path fill="none" stroke="url(#envelope-gradient)" stroke-width="1.0" filter="url(#tangent-glow-3d)" stroke-linecap="round">
              <animate attributeName="d" 
                dur="8s" 
                repeatCount="indefinite" 
                begin="2s"
                values="M28,24 Q36,30 44,24 Q48,28 44,32 Q36,36 28,32 Q24,28 28,24;
                        M30,26 Q36,28 42,26 Q46,30 42,34 Q36,38 30,34 Q26,30 30,26;
                        M26,22 Q36,32 46,22 Q50,26 46,30 Q36,34 26,30 Q22,26 26,22;
                        M32,28 Q36,26 40,28 Q44,32 40,36 Q36,40 32,36 Q28,32 32,28;
                        M28,24 Q36,30 44,24 Q48,28 44,32 Q36,36 28,32 Q24,28 28,24"/>
              <animateTransform attributeName="transform" 
                type="matrix" 
                values="1 0 0 1 0 0;1.1 0.1 -0.1 0.9 1 -1;0.9 -0.1 0.1 1.1 -1 1;1 0 0 1 0 0" 
                dur="8s" 
                repeatCount="indefinite"/>
            </path>
          </g>
          
          <!-- 3D Envelope Surface - creates the developable surface effect -->
          <g opacity="0.5">
            <!-- Ruled surface lines suggesting developable geometry -->
            <path fill="none" stroke="url(#envelope-gradient)" stroke-width="0.6" filter="url(#tangent-glow-3d)" stroke-linecap="round">
              <animate attributeName="d" 
                dur="18s" 
                repeatCount="indefinite"
                values="M20,36 Q30,28 40,36 Q50,28 60,36 Q50,44 40,36 Q30,44 20,36;
                        M22,34 Q32,30 42,34 Q52,30 58,34 Q52,42 42,38 Q32,42 22,34;
                        M24,38 Q34,26 44,38 Q54,26 56,38 Q54,46 44,42 Q34,46 24,38;
                        M18,32 Q28,32 38,32 Q48,32 62,32 Q48,48 38,44 Q28,48 18,32;
                        M20,36 Q30,28 40,36 Q50,28 60,36 Q50,44 40,36 Q30,44 20,36"/>
              <animateTransform attributeName="transform" 
                type="perspective" 
                values="1;1.2;0.8;1.1;1" 
                dur="18s" 
                repeatCount="indefinite"/>
            </path>
            
            <!-- Counter-rotating developable surface -->
            <path fill="none" stroke="url(#surface-3d)" stroke-width="0.8" filter="url(#tangent-glow-3d)" stroke-linecap="round">
              <animate attributeName="d" 
                dur="20s" 
                repeatCount="indefinite" 
                begin="5s"
                values="M36,20 C42,22 46,28 46,36 C46,44 42,50 36,52 C30,50 26,44 26,36 C26,28 30,22 36,20;
                        M36,18 C44,20 50,26 50,36 C50,46 44,52 36,54 C28,52 22,46 22,36 C22,26 28,20 36,18;
                        M36,22 C40,24 44,30 44,36 C44,42 40,48 36,50 C32,48 28,42 28,36 C28,30 32,24 36,22;
                        M36,16 C46,18 54,24 54,36 C54,48 46,54 36,56 C26,54 18,48 18,36 C18,24 26,18 36,16;
                        M36,20 C42,22 46,28 46,36 C46,44 42,50 36,52 C30,50 26,44 26,36 C26,28 30,22 36,20"/>
              <animateTransform attributeName="transform" 
                type="rotateX rotateY" 
                values="0 0;30 20;60 -10;30 15;0 0" 
                dur="20s" 
                repeatCount="indefinite"/>
            </path>
          </g>
        </g>
        
        <!-- Dynamic inner layers with black contrast -->
        <ellipse cx="36" cy="26" rx="7" ry="10" fill="url(#inner-gradient)" filter="url(#inner-glow)">
          <animate attributeName="rx" values="7;11;5;7" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="10;6;12;10" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;1;0.6;0.8" dur="4s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" 
            type="rotate" 
            values="0 36 26;18 36 26;-12 36 26;0 36 26" 
            dur="6s" 
            repeatCount="indefinite"/>
        </ellipse>
        
        <!-- Enhanced moving sparkles -->
        <circle cx="30" cy="22" r="1.8" fill="url(#sparkle-gradient)">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="r" values="1.2;2.4;1.2" dur="2s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" 
            type="translate" 
            values="0,0;4,2;-2,5;0,0" 
            dur="3s" 
            repeatCount="indefinite"/>
        </circle>
        
        <circle cx="42" cy="30" r="1.2" fill="url(#sparkle-gradient)">
          <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
          <animate attributeName="r" values="0.6;1.8;0.6" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
          <animateTransform attributeName="transform" 
            type="translate" 
            values="0,0;-2,4;1,-2;0,0" 
            dur="3.5s" 
            repeatCount="indefinite" 
            begin="0.5s"/>
        </circle>
        
        <!-- Dark sparkle for contrast -->
        <circle cx="38" cy="42" r="1" fill="#000000" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.9;0.4;0.6" dur="2.8s" repeatCount="indefinite" begin="1s"/>
          <animate attributeName="r" values="0.8;1.5;0.8" dur="2.8s" repeatCount="indefinite" begin="1s"/>
        </circle>
        
        <!-- Single rotating inner ring with subtle black sections -->
        <circle cx="36" cy="36" r="12" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.6">
          <animate attributeName="stroke-dasharray" values="0,75;37,37;0,75" dur="3s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" 
            type="rotate" 
            values="0 36 36;360 36 36" 
            dur="4s" 
            repeatCount="indefinite"/>
        </circle>
      </svg>
      
      <!-- Larger ripple rings (20% bigger) -->
      <div class="blob-ripples">
        <div class="ripple ripple-1"></div>
        <div class="ripple ripple-2"></div>
        <div class="ripple ripple-3"></div>
      </div>
      
      <!-- Larger pulse effect -->
      <div class="pulse-ring"></div>
    </div>
  `;

  // Updated styles with 20% larger sizes
  const style = document.createElement('style');
  style.textContent = `
    .fluid-blob-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 500;
      cursor: pointer;
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .fluid-blob-svg {
      position: relative;
      z-index: 10;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 4px 18px rgba(102, 126, 234, 0.5)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
    }
    
    .blob-ripples {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
      top: 0;
      left: 0;
    }
    
    .ripple {
      position: absolute;
      border: 1px solid rgba(102, 126, 234, 0.15);
      border-radius: 50%;
      animation: ripple-expand 4s ease-out infinite;
      opacity: 0;
    }
    
    .ripple-1 {
      width: 84px;
      height: 84px;
      top: -6px;
      left: -6px;
      animation-delay: 0s;
      border-color: rgba(245, 87, 108, 0.2);
    }
    
    .ripple-2 {
      width: 102px;
      height: 102px;
      top: -15px;
      left: -15px;
      animation-delay: 1.5s;
      border-color: rgba(79, 172, 254, 0.15);
    }
    
    .ripple-3 {
      width: 120px;
      height: 120px;
      top: -24px;
      left: -24px;
      animation-delay: 3s;
      border-color: rgba(240, 147, 251, 0.1);
    }
    
    .pulse-ring {
      position: absolute;
      width: 54px;
      height: 54px;
      top: 9px;
      left: 9px;
      border: 1px solid rgba(245, 87, 108, 0.4);
      border-radius: 50%;
      animation: pulse-ring 3s ease-in-out infinite;
      opacity: 0;
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    }
    
    @keyframes ripple-expand {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      15% {
        opacity: 0.5;
      }
      85% {
        opacity: 0.1;
      }
      100% {
        transform: scale(1.7);
        opacity: 0;
      }
    }
    
    @keyframes pulse-ring {
      0% {
        transform: scale(0.9);
        opacity: 0;
        border-color: rgba(245, 87, 108, 0.4);
      }
      50% {
        transform: scale(1.1);
        opacity: 0.7;
        border-color: rgba(79, 172, 254, 0.6);
      }
      100% {
        transform: scale(1.3);
        opacity: 0;
        border-color: rgba(240, 147, 251, 0.3);
      }
    }
    
    .fluid-blob-container:hover {
      transform: scale(1.15);
    }
    
    .fluid-blob-container:hover .fluid-blob-svg {
      filter: drop-shadow(0 6px 25px rgba(245, 87, 108, 0.7)) 
             drop-shadow(0 3px 12px rgba(0, 0, 0, 0.5))
             drop-shadow(0 0 15px rgba(240, 147, 251, 0.6));
    }
    
    .fluid-blob-container:hover .ripple {
      animation-duration: 2s;
    }
    
    .fluid-blob-container:hover .ripple-1 {
      border-color: rgba(245, 87, 108, 0.4);
    }
    
    .fluid-blob-container:hover .ripple-2 {
      border-color: rgba(79, 172, 254, 0.3);
    }
    
    .fluid-blob-container:hover .ripple-3 {
      border-color: rgba(240, 147, 251, 0.25);
    }
    
    .fluid-blob-container:hover .pulse-ring {
      animation-duration: 1.5s;
    }
    
    .fluid-blob-container:active {
      transform: scale(1.05);
    }
    
    .fluid-blob-container:active .fluid-blob-svg {
      filter: drop-shadow(0 2px 12px rgba(118, 75, 162, 0.9)) 
             drop-shadow(0 1px 6px rgba(0, 0, 0, 0.7));
    }
    
    .fluid-blob-container:focus {
      outline: 2px solid rgba(79, 172, 254, 0.7);
      outline-offset: 4px;
      border-radius: 50%;
    }
    
    .fluid-blob-container.hidden {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.8);
    }
    
    @media (max-width: 768px) {
      .fluid-blob-container {
        bottom: 15px;
        right: 15px;
        width: 60px;
        height: 60px;
      }
      
      .fluid-blob-svg {
        width: 60px;
        height: 60px;
      }
      
      .ripple-1 { width: 72px; height: 72px; top: -6px; left: -6px; }
      .ripple-2 { width: 84px; height: 84px; top: -12px; left: -12px; }
      .ripple-3 { width: 96px; height: 96px; top: -18px; left: -18px; }
      
      .pulse-ring {
        width: 42px;
        height: 42px;
        top: 9px;
        left: 9px;
      }
    }
  `;

  // Add styles to head
  document.head.appendChild(style);
  
  // Add container to body
  document.body.appendChild(container);
  
  // Add click handler to open Touchpoint
  container.addEventListener('click', () => {
    console.log('🎯 Siri blob clicked - opening Touchpoint');
    touchpointInstance.expanded = true;
    
    // Hide blob when touchpoint opens
    container.classList.add('hidden');
  });
  
  // Show blob again when touchpoint closes
  const checkTouchpointState = () => {
    if (!touchpointInstance.expanded) {
      container.classList.remove('hidden');
    }
  };
  
  // Check periodically if touchpoint is closed
  setInterval(checkTouchpointState, 500);
  
  // Add keyboard accessibility
  container.setAttribute('tabindex', '0');
  container.setAttribute('role', 'button');
  container.setAttribute('aria-label', 'Open chat assistant');
  
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      touchpointInstance.expanded = true;
      container.classList.add('hidden');
    }
  });
  
  console.log('✨ Tangent developable blob with mathematical elegance created!');
}