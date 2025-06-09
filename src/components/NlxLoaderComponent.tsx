import { React, type CustomModalityComponent } from '@nlxai/touchpoint-ui'
const { useEffect, useState, useRef } = React

/**
 * Data structure for the NlxAiMetamorphosis modality
 */
export interface NlxAiMetamorphosisData {
  /** Duration of the full animation cycle in seconds. Defaults to 20 */
  duration?: number
  /** Auto-advance to next step after animation completes. Defaults to true */
  autoAdvance?: boolean
  /** Choice ID to send when animation completes (if autoAdvance is true) */
  onCompleteChoiceId?: string
  /** Custom message to display below the loader */
  message?: string
}

interface AnimationState {
  time: number
  phase: number
  progress: number
  fadeProgress: number
}

interface ConversationHandler {
  sendChoice: (choiceId: string) => void
  sendSlots: (slots: Record<string, any>) => void
}

interface NlxAiMetamorphosisComponentProps {
  data: NlxAiMetamorphosisData
  conversationHandler: ConversationHandler
  enabled?: boolean
}

// Computing evolution timeline with clean icons
const COMPUTING_ERAS = [
  {
    name: '1940s',
    title: 'Punch Cards',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* Punch card outline */}
        <rect x="120" y="140" width="160" height="120" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Corner cut */}
        <path d="M 260 140 L 280 160 L 280 140 Z" fill="currentColor" opacity="0.2"/>
        {/* Punch holes in rows */}
        <rect x="140" y="160" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="156" y="160" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="172" y="160" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="188" y="160" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="220" y="160" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="252" y="160" width="8" height="4" rx="2" fill="currentColor"/>
        
        <rect x="140" y="180" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="172" y="180" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="204" y="180" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="236" y="180" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="252" y="180" width="8" height="4" rx="2" fill="currentColor"/>
        
        <rect x="156" y="200" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="188" y="200" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="204" y="200" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="220" y="200" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="252" y="200" width="8" height="4" rx="2" fill="currentColor"/>
        
        <rect x="140" y="220" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="156" y="220" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="188" y="220" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="236" y="220" width="8" height="4" rx="2" fill="currentColor"/>
        
        <rect x="140" y="240" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="172" y="240" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="204" y="240" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="220" y="240" width="8" height="4" rx="2" fill="currentColor"/>
        <rect x="236" y="240" width="8" height="4" rx="2" fill="currentColor"/>
      </g>
    )
  },
  {
    name: '1950s',
    title: 'Vacuum Tubes',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* Glass tube outline */}
        <path d="M 180 120 Q 180 100 200 100 Q 220 100 220 120 L 220 260 Q 220 280 200 280 Q 180 280 180 260 Z" 
              fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Internal structure */}
        <rect x="190" y="140" width="20" height="100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        {/* Cathode */}
        <rect x="194" y="220" width="12" height="8" fill="currentColor" opacity="0.8"/>
        {/* Grid lines */}
        <line x1="185" y1="160" x2="215" y2="160" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <line x1="185" y1="180" x2="215" y2="180" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <line x1="185" y1="200" x2="215" y2="200" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        {/* Base pins */}
        <line x1="190" y1="280" x2="190" y2="300" stroke="currentColor" strokeWidth="2"/>
        <line x1="200" y1="280" x2="200" y2="300" stroke="currentColor" strokeWidth="2"/>
        <line x1="210" y1="280" x2="210" y2="300" stroke="currentColor" strokeWidth="2"/>
        {/* Glow effect */}
        <circle cx="200" cy="190" r="25" fill="currentColor" opacity="0.1"/>
      </g>
    )
  },
  {
    name: '1960s',
    title: 'Transistors',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* Transistor symbol - clean schematic */}
        <circle cx="200" cy="200" r="40" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Base line */}
        <line x1="140" y1="200" x2="180" y2="200" stroke="currentColor" strokeWidth="2"/>
        {/* Vertical line */}
        <line x1="180" y1="170" x2="180" y2="230" stroke="currentColor" strokeWidth="2"/>
        {/* Collector line */}
        <line x1="180" y1="180" x2="220" y2="160" stroke="currentColor" strokeWidth="2"/>
        <line x1="220" y1="160" x2="220" y2="140" stroke="currentColor" strokeWidth="2"/>
        {/* Emitter line with arrow */}
        <line x1="180" y1="220" x2="220" y2="240" stroke="currentColor" strokeWidth="2"/>
        <line x1="220" y1="240" x2="220" y2="260" stroke="currentColor" strokeWidth="2"/>
        {/* Arrow */}
        <path d="M 210 235 L 220 240 L 215 228" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Labels */}
        <text x="125" y="205" fontSize="10" fill="currentColor" opacity="0.6">B</text>
        <text x="225" y="145" fontSize="10" fill="currentColor" opacity="0.6">C</text>
        <text x="225" y="265" fontSize="10" fill="currentColor" opacity="0.6">E</text>
      </g>
    )
  },
  {
    name: '1970s',
    title: 'Microprocessor',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* Chip body */}
        <rect x="150" y="150" width="100" height="100" rx="4" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2"/>
        {/* Die in center */}
        <rect x="170" y="170" width="60" height="60" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1"/>
        {/* Circuit pattern on die */}
        <rect x="185" y="185" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
        <line x1="185" y1="200" x2="215" y2="200" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
        <line x1="200" y1="185" x2="200" y2="215" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
        {/* Pins - left side */}
        <line x1="140" y1="165" x2="150" y2="165" stroke="currentColor" strokeWidth="2"/>
        <line x1="140" y1="185" x2="150" y2="185" stroke="currentColor" strokeWidth="2"/>
        <line x1="140" y1="205" x2="150" y2="205" stroke="currentColor" strokeWidth="2"/>
        <line x1="140" y1="225" x2="150" y2="225" stroke="currentColor" strokeWidth="2"/>
        {/* Pins - right side */}
        <line x1="250" y1="165" x2="260" y2="165" stroke="currentColor" strokeWidth="2"/>
        <line x1="250" y1="185" x2="260" y2="185" stroke="currentColor" strokeWidth="2"/>
        <line x1="250" y1="205" x2="260" y2="205" stroke="currentColor" strokeWidth="2"/>
        <line x1="250" y1="225" x2="260" y2="225" stroke="currentColor" strokeWidth="2"/>
        {/* Pins - top */}
        <line x1="165" y1="140" x2="165" y2="150" stroke="currentColor" strokeWidth="2"/>
        <line x1="185" y1="140" x2="185" y2="150" stroke="currentColor" strokeWidth="2"/>
        <line x1="205" y1="140" x2="205" y2="150" stroke="currentColor" strokeWidth="2"/>
        <line x1="225" y1="140" x2="225" y2="150" stroke="currentColor" strokeWidth="2"/>
        {/* Pins - bottom */}
        <line x1="165" y1="250" x2="165" y2="260" stroke="currentColor" strokeWidth="2"/>
        <line x1="185" y1="250" x2="185" y2="260" stroke="currentColor" strokeWidth="2"/>
        <line x1="205" y1="250" x2="205" y2="260" stroke="currentColor" strokeWidth="2"/>
        <line x1="225" y1="250" x2="225" y2="260" stroke="currentColor" strokeWidth="2"/>
      </g>
    )
  },
  {
    name: '1984',
    title: 'Personal Computer',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* Classic Mac shape */}
        <rect x="140" y="120" width="120" height="140" rx="8" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Screen */}
        <rect x="155" y="135" width="90" height="70" rx="4" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1"/>
        {/* Screen content */}
        <rect x="165" y="145" width="70" height="50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
        {/* Apple logo hint */}
        <circle cx="200" cy="170" r="8" fill="currentColor" opacity="0.2"/>
        {/* Floppy drive */}
        <rect x="165" y="215" width="70" height="4" rx="2" fill="currentColor" opacity="0.3"/>
        {/* Base/chin */}
        <rect x="140" y="235" width="120" height="25" fill="currentColor" opacity="0.05"/>
        {/* Feet */}
        <rect x="155" y="260" width="20" height="5" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="225" y="260" width="20" height="5" rx="2" fill="currentColor" opacity="0.3"/>
      </g>
    )
  },
  {
    name: '1990s',
    title: 'World Wide Web',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* Globe */}
        <circle cx="200" cy="200" r="60" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Latitude lines */}
        <ellipse cx="200" cy="200" rx="60" ry="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <ellipse cx="200" cy="200" rx="60" ry="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        {/* Longitude lines */}
        <ellipse cx="200" cy="200" rx="20" ry="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <ellipse cx="200" cy="200" rx="40" ry="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        {/* Connection nodes */}
        <circle cx="200" cy="140" r="4" fill="currentColor"/>
        <circle cx="240" cy="180" r="4" fill="currentColor"/>
        <circle cx="240" cy="220" r="4" fill="currentColor"/>
        <circle cx="200" cy="260" r="4" fill="currentColor"/>
        <circle cx="160" cy="220" r="4" fill="currentColor"/>
        <circle cx="160" cy="180" r="4" fill="currentColor"/>
        {/* Connection lines */}
        <line x1="200" y1="140" x2="240" y2="180" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="240" y1="180" x2="240" y2="220" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="240" y1="220" x2="200" y2="260" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="200" y1="260" x2="160" y2="220" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="160" y1="220" x2="160" y2="180" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="160" y1="180" x2="200" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      </g>
    )
  },
  {
    name: '2007',
    title: 'iPhone',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* iPhone body */}
        <rect x="165" y="120" width="70" height="140" rx="8" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Screen */}
        <rect x="170" y="135" width="60" height="106" rx="2" fill="currentColor" opacity="0.1"/>
        {/* Home button */}
        <circle cx="200" cy="250" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        {/* Speaker */}
        <rect x="192" y="127" width="16" height="2" rx="1" fill="currentColor" opacity="0.6"/>
        {/* App grid */}
        <rect x="178" y="145" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="195" y="145" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="212" y="145" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="178" y="162" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="195" y="162" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="212" y="162" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="178" y="179" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="195" y="179" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="212" y="179" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
        {/* Dock */}
        <rect x="170" y="220" width="60" height="20" fill="currentColor" opacity="0.05"/>
      </g>
    )
  },
  {
    name: '2010s',
    title: 'Cloud Computing',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* Clean cloud shape */}
        <path d="M 160 220 Q 160 200 180 200 Q 180 180 200 180 Q 220 170 240 180 Q 260 180 260 200 Q 280 200 280 220 Q 280 240 260 240 L 180 240 Q 160 240 160 220" 
              fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Upload/download arrows */}
        <line x1="200" y1="250" x2="200" y2="280" stroke="currentColor" strokeWidth="2"/>
        <path d="M 195 275 L 200 280 L 205 275" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="180" y1="150" x2="180" y2="120" stroke="currentColor" strokeWidth="2"/>
        <path d="M 175 125 L 180 120 L 185 125" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="220" y1="120" x2="220" y2="150" stroke="currentColor" strokeWidth="2"/>
        <path d="M 215 145 L 220 150 L 225 145" fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Server indicators inside cloud */}
        <rect x="185" y="205" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
        <rect x="197" y="205" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
        <rect x="209" y="205" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
        <rect x="191" y="217" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
        <rect x="203" y="217" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      </g>
    )
  },
  {
    name: '2020s',
    title: 'Artificial Intelligence',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* Brain outline - left hemisphere */}
        <path d="M 200 140 Q 170 140 155 160 Q 140 180 140 200 Q 140 230 160 250 Q 180 270 200 270" 
              fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Brain outline - right hemisphere */}
        <path d="M 200 140 Q 230 140 245 160 Q 260 180 260 200 Q 260 230 240 250 Q 220 270 200 270" 
              fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* Neural pathways */}
        <path d="M 170 170 Q 185 160 185 180 Q 185 190 170 190 Q 160 190 160 180 Q 160 170 170 170" 
              fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <path d="M 230 170 Q 215 160 215 180 Q 215 190 230 190 Q 240 190 240 180 Q 240 170 230 170" 
              fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <path d="M 185 210 Q 200 200 215 210" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        {/* Neural nodes */}
        <circle cx="170" cy="180" r="3" fill="currentColor" opacity="0.8"/>
        <circle cx="230" cy="180" r="3" fill="currentColor" opacity="0.8"/>
        <circle cx="200" cy="160" r="3" fill="currentColor" opacity="0.8"/>
        <circle cx="200" cy="205" r="3" fill="currentColor" opacity="0.8"/>
        <circle cx="185" cy="230" r="3" fill="currentColor" opacity="0.8"/>
        <circle cx="215" cy="230" r="3" fill="currentColor" opacity="0.8"/>
        {/* Connections */}
        <line x1="170" y1="180" x2="200" y2="160" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
        <line x1="230" y1="180" x2="200" y2="160" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
        <line x1="170" y1="180" x2="200" y2="205" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
        <line x1="230" y1="180" x2="200" y2="205" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
        <line x1="185" y1="230" x2="200" y2="205" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
        <line x1="215" y1="230" x2="200" y2="205" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      </g>
    )
  },
  {
    name: 'Today',
    title: 'Conversational AI',
    icon: (opacity: number) => (
      <g opacity={opacity}>
        {/* User message bubble */}
        <path d="M 140 160 Q 140 140 160 140 L 220 140 Q 240 140 240 160 L 240 180 Q 240 200 220 200 L 170 200 L 150 210 L 155 200 L 160 200 Q 140 200 140 180 Z" 
              fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2"/>
        {/* AI response bubble */}
        <path d="M 160 230 Q 160 210 180 210 L 240 210 Q 260 210 260 230 L 260 250 Q 260 270 240 270 L 200 270 L 190 280 L 195 270 L 180 270 Q 160 270 160 250 Z" 
              fill="none" stroke="currentColor" strokeWidth="2"/>
        {/* AI sparkle in response */}
        <path d="M 235 240 L 240 235 L 245 240 L 240 245 Z" fill="currentColor" opacity="0.8"/>
        <path d="M 240 235 L 240 245 M 235 240 L 245 240" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        {/* Typing dots in user message */}
        <circle cx="170" cy="170" r="2" fill="currentColor" opacity="0.6"/>
        <circle cx="190" cy="170" r="2" fill="currentColor" opacity="0.6"/>
        <circle cx="210" cy="170" r="2" fill="currentColor" opacity="0.6"/>
      </g>
    )
  },
]

const NlxAiMetamorphosisComponent: React.FC<NlxAiMetamorphosisComponentProps> = ({
  data,
  conversationHandler,
  enabled = true,
}) => {
  console.log('🎭 Computing Evolution: Starting animation sequence')
  
  const duration = data.duration ?? 20
  const autoAdvance = data.autoAdvance ?? false
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()
  
  const [animState, setAnimState] = useState<AnimationState>({
    time: 0,
    phase: 0,
    progress: 0,
    fadeProgress: 1,
  })

  // Smooth easing function
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // Animation loop
  useEffect(() => {
    console.log('🚀 Starting computing evolution animation')
    
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }
      
      const elapsed = (currentTime - startTimeRef.current) / 1000
      const totalProgress = Math.min(elapsed / duration, 1)
      
      // Calculate phase and progress
      const phaseCount = COMPUTING_ERAS.length
      const phaseDuration = duration / phaseCount
      const currentPhase = Math.min(Math.floor(elapsed / phaseDuration), phaseCount - 1)
      const phaseProgress = (elapsed % phaseDuration) / phaseDuration
      
      // Simple fade transition
      let fadeProgress = 1
      const transitionDuration = 0.15 // 15% of phase duration for transition
      
      if (phaseProgress < transitionDuration) {
        // Fade in
        fadeProgress = easeInOutCubic(phaseProgress / transitionDuration)
      } else if (phaseProgress > (1 - transitionDuration)) {
        // Fade out
        fadeProgress = easeInOutCubic((1 - phaseProgress) / transitionDuration)
      }
      
      setAnimState({
        time: elapsed,
        phase: currentPhase,
        progress: phaseProgress,
        fadeProgress: fadeProgress,
      })
      
      // Continue or complete animation
      if (totalProgress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        console.log('✨ Computing evolution complete!')
        if (autoAdvance && enabled) {
          if (data.onCompleteChoiceId) {
            conversationHandler.sendChoice(data.onCompleteChoiceId)
          } else {
            conversationHandler.sendSlots({ 
              nlxAnimationComplete: true,
              finalPhase: COMPUTING_ERAS[COMPUTING_ERAS.length - 1].name,
              completedAt: new Date().toISOString() 
            })
          }
        }
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [duration, autoAdvance, enabled, data.onCompleteChoiceId, conversationHandler])

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
    height: '500px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: '20px',
    overflow: 'hidden',
  }

  const currentEra = COMPUTING_ERAS[animState.phase]

  return (
    <div style={containerStyle}>
      {/* Subtle background gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)',
      }} />
      
      {/* Main SVG container */}
      <svg 
        width="400" 
        height="400" 
        viewBox="0 0 400 400"
        style={{ 
          position: 'absolute',
          color: '#ffffff',
        }}
      >
        {/* Render current icon with fade */}
        {currentEra.icon(animState.fadeProgress)}
      </svg>
      
      {/* Era label */}
      <div style={{
        position: 'absolute',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        opacity: animState.fadeProgress,
        transition: 'opacity 0.3s ease-out',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.6)',
          marginBottom: '4px',
          letterSpacing: '0.5px',
        }}>
          {currentEra.name}
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#ffffff',
          letterSpacing: '-0.5px',
        }}>
          {currentEra.title}
        </div>
      </div>
      
      {/* Timeline progress */}
      <div style={{
        position: 'absolute',
        bottom: '60px',
        left: '50px',
        right: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {COMPUTING_ERAS.map((_, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: '2px',
              backgroundColor: index < animState.phase 
                ? 'rgba(255,255,255,0.8)' 
                : index === animState.phase 
                  ? 'rgba(255,255,255,0.8)'
                  : 'rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '1px',
              transition: 'background-color 0.5s ease',
            }}
          >
            {index === animState.phase && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${animState.progress * 100}%`,
                height: '100%',
                backgroundColor: '#ffffff',
                transition: 'width 0.1s linear',
              }} />
            )}
          </div>
        ))}
      </div>
      
      {/* Optional message */}
      {data.message && (
        <div style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          maxWidth: '350px',
          lineHeight: 1.6,
        }}>
          {data.message}
        </div>
      )}
    </div>
  )
}

export default NlxAiMetamorphosisComponent