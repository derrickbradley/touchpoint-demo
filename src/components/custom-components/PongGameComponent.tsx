import {
  React,
  Icons,
  TextButton,
  IconButton,
  BaseText,
  SmallText,
  type CustomModalityComponent,
} from "@nlxai/touchpoint-ui"

interface PongGameData {
  // Game settings
  gameSpeed?: number // milliseconds between frames (default: 16 for ~60fps)
  paddleSpeed?: number // pixels per frame (default: 6)
  ballSpeed?: number // initial ball speed (default: 4)
  winningScore?: number // score to win (default: 10)
  
  // UI customization
  title?: string
  instructions?: string
  gameOverMessage?: string
  
  // NLX integration - Slots
  onGameOverSlot?: string 
  onScoreSlot?: string 
  gameOverChoiceId?: string 
  
  // NLX integration - Context Variables (optional)
  gameResultsContextName?: string // context variable name for game results (default: "gameResults")
  currentScoreContextName?: string // context variable name for current score (default: "currentScore")
}

interface GameState {
  playerScore: number
  aiScore: number
  gameStatus: 'waiting' | 'playing' | 'paused' | 'gameOver'
  winner: 'player' | 'ai' | null
}

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  vx?: number // velocity x
  vy?: number // velocity y
}

const PongGameComponent: CustomModalityComponent<PongGameData> = ({
  data,
  conversationHandler,
  enabled = true,
}) => {
  // Debug logging for component initialization
  React.useEffect(() => {
    console.log('🎮 PONG GAME COMPONENT - Initialized')
    console.log('  - Component enabled:', enabled)
    console.log('  - Received data:', data)
    console.log('  - Data keys:', Object.keys(data || {}))
    console.log('  - ConversationHandler available:', !!conversationHandler)
    console.log('  - ConversationHandler methods:', conversationHandler ? Object.getOwnPropertyNames(Object.getPrototypeOf(conversationHandler)) : 'N/A')
    
    // Return cleanup function to detect component unmounting
    return () => {
      console.log('🔄 PONG GAME COMPONENT - Re-rendering or unmounting detected')
      console.log('  - This suggests the component is being recreated')
    }
  }, [data, enabled, conversationHandler])
  
  // Canvas ref
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const animationRef = React.useRef<number>()
  const keysRef = React.useRef<Set<string>>(new Set())
  
  // Game settings
  const gameSpeed = data.gameSpeed || 16
  const paddleSpeed = data.paddleSpeed || 6
  const ballSpeed = data.ballSpeed || 4
  const winningScore = data.winningScore || 10
  
  // Game dimensions
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 400
  const PADDLE_WIDTH = 10
  const PADDLE_HEIGHT = 80
  const BALL_SIZE = 10
  
  // Game state
  const [gameState, setGameState] = React.useState<GameState>({
    playerScore: 0,
    aiScore: 0,
    gameStatus: 'waiting',
    winner: null
  })
  
  // Log game state changes
  React.useEffect(() => {
    console.log('🎯 PONG GAME - Game state changed:', gameState)
  }, [gameState])
  
  // Game objects
  const gameObjects = React.useRef({
    player: {
      x: 20,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT
    } as GameObject,
    ai: {
      x: CANVAS_WIDTH - 30,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT
    } as GameObject,
    ball: {
      x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
      y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
      width: BALL_SIZE,
      height: BALL_SIZE,
      vx: ballSpeed,
      vy: ballSpeed
    } as GameObject
  })
  
  // Initialize game
  const initializeGame = React.useCallback(() => {
    console.log('🎮 PONG GAME - Initializing new game')
    console.log('  - Game settings:', {
      gameSpeed,
      paddleSpeed,
      ballSpeed,
      winningScore
    })
    console.log('  - NLX integration:', {
      onGameOverSlot: data.onGameOverSlot || 'Not configured',
      onScoreSlot: data.onScoreSlot || 'Not configured',
      gameOverChoiceId: data.gameOverChoiceId || 'Not configured',
      gameResultsContextName: data.gameResultsContextName || 'gameResults (default)',
      currentScoreContextName: data.currentScoreContextName || 'currentScore (default)'
    })
    
    const { player, ai, ball } = gameObjects.current
    
    // Reset positions
    player.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
    ai.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2
    ball.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2
    ball.y = CANVAS_HEIGHT / 2 - BALL_SIZE / 2
    
    // Random ball direction
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed
    ball.vy = (Math.random() - 0.5) * ballSpeed * 2
    
    console.log('  - Ball initial velocity:', { vx: ball.vx, vy: ball.vy })
    
    setGameState({
      playerScore: 0,
      aiScore: 0,
      gameStatus: 'waiting',
      winner: null
    })
    
    console.log('✅ Game initialized successfully')
  }, [ballSpeed, gameSpeed, paddleSpeed, winningScore, data])
  
  // Collision detection
  const checkCollision = (rect1: GameObject, rect2: GameObject): boolean => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y
  }
  
  // Update game logic
  const updateGame = React.useCallback(() => {
    const { player, ai, ball } = gameObjects.current
    
    // Player movement
    if (keysRef.current.has('ArrowUp') || keysRef.current.has('KeyW')) {
      player.y = Math.max(0, player.y - paddleSpeed)
    }
    if (keysRef.current.has('ArrowDown') || keysRef.current.has('KeyS')) {
      player.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player.y + paddleSpeed)
    }
    
    // AI movement (simple AI that follows the ball)
    const aiCenter = ai.y + PADDLE_HEIGHT / 2
    const ballCenter = ball.y + BALL_SIZE / 2
    const aiSpeed = paddleSpeed * 0.7 // Make AI slightly slower
    
    if (ballCenter < aiCenter - 10) {
      ai.y = Math.max(0, ai.y - aiSpeed)
    } else if (ballCenter > aiCenter + 10) {
      ai.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, ai.y + aiSpeed)
    }
    
    // Ball movement
    ball.x += ball.vx!
    ball.y += ball.vy!
    
    // Ball collision with top/bottom walls
    if (ball.y <= 0 || ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
      ball.vy = -ball.vy!
    }
    
    // Ball collision with player paddle
    if (checkCollision(ball, player)) {
      ball.vx = Math.abs(ball.vx!) // Ensure ball goes right
      ball.vy! += (ball.y - (player.y + PADDLE_HEIGHT / 2)) * 0.1 // Add spin
    }
    
    // Ball collision with AI paddle
    if (checkCollision(ball, ai)) {
      ball.vx = -Math.abs(ball.vx!) // Ensure ball goes left
      ball.vy! += (ball.y - (ai.y + PADDLE_HEIGHT / 2)) * 0.1 // Add spin
    }
    
    // Scoring
    if (ball.x < 0) {
      // AI scores
      setGameState(prev => {
        const newAiScore = prev.aiScore + 1
        const newState = {
          ...prev,
          aiScore: newAiScore,
          gameStatus: newAiScore >= winningScore ? 'gameOver' as const : prev.gameStatus,
          winner: newAiScore >= winningScore ? 'ai' as const : null
        }
        
        // Send score to NLX
        if (data.onScoreSlot) {
          const scoreData = { playerScore: prev.playerScore, aiScore: newAiScore }
          console.log('🎯 PONG GAME - AI Scored! Sending to slot:', data.onScoreSlot)
          console.log('  - Score data:', scoreData)
          console.log('  - New AI score:', newAiScore)
          
          conversationHandler.sendSlots({
            [data.onScoreSlot]: scoreData
          })
          
          console.log('✅ Score slot update sent successfully')
        } else {
          console.log('⚠️ PONG GAME - No onScoreSlot configured, skipping score update')
        }
        
        return newState
      })
      
      // Reset ball
      ball.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2
      ball.y = CANVAS_HEIGHT / 2 - BALL_SIZE / 2
      ball.vx = -ballSpeed
      ball.vy = (Math.random() - 0.5) * ballSpeed * 2
    }
    
    if (ball.x > CANVAS_WIDTH) {
      // Player scores
      setGameState(prev => {
        const newPlayerScore = prev.playerScore + 1
        const newState = {
          ...prev,
          playerScore: newPlayerScore,
          gameStatus: newPlayerScore >= winningScore ? 'gameOver' as const : prev.gameStatus,
          winner: newPlayerScore >= winningScore ? 'player' as const : null
        }
        
        // Send score to NLX
        if (data.onScoreSlot) {
          const scoreData = { playerScore: newPlayerScore, aiScore: prev.aiScore }
          console.log('🎯 PONG GAME - Player Scored! Sending to slot:', data.onScoreSlot)
          console.log('  - Score data:', scoreData)
          console.log('  - New player score:', newPlayerScore)
          
          conversationHandler.sendSlots({
            [data.onScoreSlot]: scoreData
          })
          
          console.log('✅ Score slot update sent successfully')
        } else {
          console.log('⚠️ PONG GAME - No onScoreSlot configured, skipping score update')
        }
        
        return newState
      })
      
      // Reset ball
      ball.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2
      ball.y = CANVAS_HEIGHT / 2 - BALL_SIZE / 2
      ball.vx = ballSpeed
      ball.vy = (Math.random() - 0.5) * ballSpeed * 2
    }
  }, [paddleSpeed, ballSpeed, winningScore, data.onScoreSlot, conversationHandler])
  
  // Render game
  const renderGame = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Draw center line
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 0)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    ctx.stroke()
    ctx.setLineDash([])
    
    // Draw paddles
    ctx.fillStyle = '#fff'
    const { player, ai, ball } = gameObjects.current
    ctx.fillRect(player.x, player.y, player.width, player.height)
    ctx.fillRect(ai.x, ai.y, ai.width, ai.height)
    
    // Draw ball
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height)
    
    // Draw scores
    ctx.font = '48px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(gameState.playerScore.toString(), CANVAS_WIDTH / 4, 60)
    ctx.fillText(gameState.aiScore.toString(), (CANVAS_WIDTH * 3) / 4, 60)
    
    // Draw game status messages
    if (gameState.gameStatus === 'waiting') {
      ctx.font = '24px monospace'
      ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50)
      ctx.font = '16px monospace'
      ctx.fillText('Use ↑↓ or W/S to move', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80)
    } else if (gameState.gameStatus === 'paused') {
      ctx.font = '24px monospace'
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      ctx.font = '16px monospace'
      ctx.fillText('Press SPACE to Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)
    } else if (gameState.gameStatus === 'gameOver') {
      ctx.font = '36px monospace'
      ctx.fillText(
        gameState.winner === 'player' ? 'YOU WIN!' : 'AI WINS!',
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2
      )
      ctx.font = '16px monospace'
      ctx.fillText('Press R to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40)
    }
  }, [gameState])
  
  // Game loop
  const gameLoop = React.useCallback(() => {
    if (gameState.gameStatus === 'playing') {
      updateGame()
    }
    renderGame()
    animationRef.current = setTimeout(gameLoop, gameSpeed)
  }, [gameState.gameStatus, updateGame, renderGame, gameSpeed])
  
  // Keyboard event handlers
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      
      // Game control keys
      if (e.code === 'Space') {
        e.preventDefault()
        if (gameState.gameStatus === 'waiting' || gameState.gameStatus === 'paused') {
          console.log('⌨️ PONG GAME - SPACE pressed: Starting/Resuming game')
          setGameState(prev => ({ ...prev, gameStatus: 'playing' }))
        } else if (gameState.gameStatus === 'playing') {
          console.log('⌨️ PONG GAME - SPACE pressed: Pausing game')
          setGameState(prev => ({ ...prev, gameStatus: 'paused' }))
        }
      }
      
      if (e.code === 'KeyR' && gameState.gameStatus === 'gameOver') {
        console.log('⌨️ PONG GAME - R pressed: Restarting game')
        initializeGame()
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState.gameStatus, initializeGame])
  
  // Initialize game on mount (only once)
  React.useEffect(() => {
    console.log('🎮 PONG GAME - Component mounted, initializing game (one-time)')
    initializeGame()
  }, [initializeGame]) 
  
  // Start game loop
  React.useEffect(() => {
    gameLoop()
    return () => {
      console.log('🛑 PONG GAME - Component unmounting, cleaning up game loop')
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [gameLoop])
  
  // Control functions
  const startGame = () => {
    console.log('▶️ PONG GAME - Starting game via button')
    setGameState(prev => ({ ...prev, gameStatus: 'playing' }))
  }
  
  const pauseGame = () => {
    const newStatus = gameState.gameStatus === 'playing' ? 'paused' : 'playing'
    console.log(`⏸️ PONG GAME - Toggling game state: ${gameState.gameStatus} → ${newStatus}`)
    setGameState(prev => ({ 
      ...prev, 
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing' 
    }))
  }
  
  const restartGame = () => {
    console.log('🔄 PONG GAME - Restarting game via button')
    console.log('  - Current game state before restart:', gameState)
    initializeGame()
  }
  
  // CHANGE: This function now uses sendStructured to prevent race conditions.
  const endGame = () => {
    console.log('🏁 PONG GAME - End Game button clicked. Preparing structured request.')

    // 1. Prepare the slots payload.
    const slotsPayload: { [key: string]: any } = {};
    if (data.onGameOverSlot) {
      slotsPayload[data.onGameOverSlot] = "game_complete";
    }

    // 2. Prepare the context payload.
    const contextPayload: { [key: string]: any } = {};
    const contextVarName = data.gameResultsContextName || 'gameResults';
    contextPayload[contextVarName] = {
      winner: gameState.winner,
      playerScore: gameState.playerScore,
      aiScore: gameState.aiScore,
      gameCompleted: true
    };
    
    // 3. Construct the single, atomic request object.
    const structuredRequest = {
      choice: data.gameOverChoiceId || undefined,
      slots: slotsPayload
    };

    // 4. Send the structured request with the context.
    try {
      console.log('📤 PONG GAME - Sending structured request...');
      console.log('  - Request:', structuredRequest);
      console.log('  - Context:', contextPayload);
      conversationHandler.sendStructured(structuredRequest, contextPayload);
      console.log('✅ Structured request sent successfully.');
    } catch (error) {
      console.error('❌ Failed to send structured request:', error);
    }
  }
  
  return (
    <div style={{
      padding: '20px',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 'var(--outer-border-radius)',
      gap: '16px',
      position: 'relative', // Establishes a stacking context
      zIndex: 1            // Places the component in its own layer
    }}>
      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 500,
          color: 'var(--primary-80)',
          margin: 0
        }}>
          {data.title || 'Classic Pong'}
        </h2>
        <Icons.Play size={28} style={{ color: 'var(--accent)' }} />
      </div>
      
      {/* Instructions */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <BaseText>{data.instructions || 'Use ↑↓ arrow keys or W/S to move your paddle'}</BaseText>
        <SmallText>First to {winningScore} points wins!</SmallText>
      </div>
      
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid var(--primary-40)',
          borderRadius: 'var(--inner-border-radius)',
          backgroundColor: '#000',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {/* Score Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '300px',
        marginTop: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <BaseText>Player</BaseText>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: 'var(--accent)' 
          }}>
            {gameState.playerScore}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <BaseText>AI</BaseText>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: 'var(--error-primary)' 
          }}>
            {gameState.aiScore}
          </div>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {gameState.gameStatus === 'waiting' && (
          <TextButton
            label="Start Game"
            Icon={Icons.Play}
            onClick={startGame}
            type="main"
          />
        )}
        
        {(gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') && (
          <TextButton
            label={gameState.gameStatus === 'playing' ? 'Pause' : 'Resume'}
            Icon={gameState.gameStatus === 'playing' ? Icons.Time : Icons.Play}
            onClick={pauseGame}
            type="ghost"
          />
        )}
        
        {gameState.gameStatus !== 'waiting' && (
          <TextButton
            label="Restart"
            Icon={Icons.Restart}
            onClick={restartGame}
            type="ghost"
          />
        )}
        
        {gameState.gameStatus === 'gameOver' && (
          <TextButton
            label="End Game"
            Icon={Icons.ArrowForward}
            onClick={endGame}
            type="main"
          />
        )}
      </div>
      
      {/* Keyboard Hints */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginTop: '8px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <SmallText>SPACE: Start/Pause</SmallText>
        <SmallText>↑↓ / W S: Move</SmallText>
        <SmallText>R: Restart</SmallText>
      </div>
    </div>
  )
}

export default PongGameComponent