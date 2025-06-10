import {
  React,
  Icons,
  TextButton,
//  IconButton,
  BaseText,
  SmallText,
} from "@nlxai/touchpoint-ui"

import type { CustomComponent } from '../custom-component-types';

interface PongGameData {
  gameSpeed?: number;
  paddleSpeed?: number;
  ballSpeed?: number;
  winningScore?: number;
  title?: string;
  instructions?: string;
  gameOverMessage?: string;
  onGameOverSlot?: string;
  onScoreSlot?: string;
  gameOverChoiceId?: string;
  gameResultsContextName?: string;
  currentScoreContextName?: string;
}

interface GameState {
  playerScore: number;
  aiScore: number;
  gameStatus: 'waiting' | 'playing' | 'paused' | 'gameOver';
  winner: 'player' | 'ai' | null;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  vx?: number;
  vy?: number;
}

const PongGameComponent: CustomComponent<PongGameData> = ({
  data,
  conversationHandler,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationRef = React.useRef<number>();
  const keysRef = React.useRef<Set<string>>(new Set());

  const gameSpeed = data.gameSpeed || 16;
  const paddleSpeed = data.paddleSpeed || 6;
  const ballSpeed = data.ballSpeed || 4;
  const winningScore = data.winningScore || 10;

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 80;
  const BALL_SIZE = 10;

  const [gameState, setGameState] = React.useState<GameState>({
    playerScore: 0,
    aiScore: 0,
    gameStatus: 'waiting',
    winner: null
  });

  const gameObjects = React.useRef({
    player: { x: 20, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT } as GameObject,
    ai: { x: CANVAS_WIDTH - 30, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT } as GameObject,
    ball: { x: CANVAS_WIDTH / 2 - BALL_SIZE / 2, y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2, width: BALL_SIZE, height: BALL_SIZE, vx: ballSpeed, vy: ballSpeed } as GameObject
  });

  const initializeGame = React.useCallback(() => {
    const { player, ai, ball } = gameObjects.current;
    player.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    ai.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    ball.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
    ball.y = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    ball.vy = (Math.random() - 0.5) * ballSpeed * 2;
    setGameState({ playerScore: 0, aiScore: 0, gameStatus: 'waiting', winner: null });
  }, [ballSpeed]);

  const checkCollision = (rect1: GameObject, rect2: GameObject): boolean => {
    return rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y;
  };

  const updateGame = React.useCallback(() => {
    const { player, ai, ball } = gameObjects.current;
    if (keysRef.current.has('ArrowUp') || keysRef.current.has('KeyW')) {
      player.y = Math.max(0, player.y - paddleSpeed);
    }
    if (keysRef.current.has('ArrowDown') || keysRef.current.has('KeyS')) {
      player.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player.y + paddleSpeed);
    }
    const aiCenter = ai.y + PADDLE_HEIGHT / 2;
    const ballCenter = ball.y + BALL_SIZE / 2;
    const aiSpeed = paddleSpeed * 0.7;
    if (ballCenter < aiCenter - 10) {
      ai.y = Math.max(0, ai.y - aiSpeed);
    } else if (ballCenter > aiCenter + 10) {
      ai.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, ai.y + aiSpeed);
    }
    ball.x += ball.vx!;
    ball.y += ball.vy!;
    if (ball.y <= 0 || ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
      ball.vy = -ball.vy!;
    }
    if (checkCollision(ball, player)) {
      ball.vx = Math.abs(ball.vx!);
      ball.vy! += (ball.y - (player.y + PADDLE_HEIGHT / 2)) * 0.1;
    }
    if (checkCollision(ball, ai)) {
      ball.vx = -Math.abs(ball.vx!);
      ball.vy! += (ball.y - (ai.y + PADDLE_HEIGHT / 2)) * 0.1;
    }
    if (ball.x < 0) {
      setGameState(prev => {
        const newAiScore = prev.aiScore + 1;
        const newState = {
          ...prev,
          aiScore: newAiScore,
          gameStatus: newAiScore >= winningScore ? 'gameOver' as const : prev.gameStatus,
          winner: newAiScore >= winningScore ? 'ai' as const : null
        };
        if (data.onScoreSlot) {
          conversationHandler.sendSlots({
            [data.onScoreSlot]: { playerScore: prev.playerScore, aiScore: newAiScore }
          });
        }
        return newState;
      });
      ball.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
      ball.y = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
      ball.vx = -ballSpeed;
      ball.vy = (Math.random() - 0.5) * ballSpeed * 2;
    }
    if (ball.x > CANVAS_WIDTH) {
      setGameState(prev => {
        const newPlayerScore = prev.playerScore + 1;
        const newState = {
          ...prev,
          playerScore: newPlayerScore,
          gameStatus: newPlayerScore >= winningScore ? 'gameOver' as const : prev.gameStatus,
          winner: newPlayerScore >= winningScore ? 'player' as const : null
        };
        if (data.onScoreSlot) {
          conversationHandler.sendSlots({
            [data.onScoreSlot]: { playerScore: newPlayerScore, aiScore: prev.aiScore }
          });
        }
        return newState;
      });
      ball.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
      ball.y = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
      ball.vx = ballSpeed;
      ball.vy = (Math.random() - 0.5) * ballSpeed * 2;
    }
  }, [paddleSpeed, ballSpeed, winningScore, data.onScoreSlot, conversationHandler]);

  const renderGame = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fff';
    const { player, ai, ball } = gameObjects.current;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(ai.x, ai.y, ai.width, ai.height);
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.playerScore.toString(), CANVAS_WIDTH / 4, 60);
    ctx.fillText(gameState.aiScore.toString(), (CANVAS_WIDTH * 3) / 4, 60);
    if (gameState.gameStatus === 'waiting') {
      ctx.font = '24px monospace';
      ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      ctx.font = '16px monospace';
      ctx.fillText('Use ↑↓ or W/S to move', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
    } else if (gameState.gameStatus === 'paused') {
      ctx.font = '24px monospace';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.font = '16px monospace';
      ctx.fillText('Press SPACE to Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    } else if (gameState.gameStatus === 'gameOver') {
      ctx.font = '36px monospace';
      ctx.fillText(gameState.winner === 'player' ? 'YOU WIN!' : 'AI WINS!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.font = '16px monospace';
      ctx.fillText('Press R to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    }
  }, [gameState]);

  const gameLoop = React.useCallback(() => {
    if (gameState.gameStatus === 'playing') {
      updateGame();
    }
    renderGame();
    animationRef.current = setTimeout(gameLoop, gameSpeed);
  }, [gameState.gameStatus, updateGame, renderGame, gameSpeed]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState(prev => ({ ...prev, gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing' }));
      }
      if (e.code === 'KeyR' && gameState.gameStatus === 'gameOver') {
        initializeGame();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.gameStatus, initializeGame]);

  React.useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  React.useEffect(() => {
    gameLoop();
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [gameLoop]);

  const startGame = () => setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
  const pauseGame = () => setGameState(prev => ({ ...prev, gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing' }));
  const restartGame = () => initializeGame();

  const endGame = () => {
    const slotsPayload: { [key: string]: any } = {};
    if (data.onGameOverSlot) {
      slotsPayload[data.onGameOverSlot] = "game_complete";
    }
    const contextPayload: { [key: string]: any } = {};
    const contextVarName = data.gameResultsContextName || 'gameResults';
    contextPayload[contextVarName] = {
      winner: gameState.winner,
      playerScore: gameState.playerScore,
      aiScore: gameState.aiScore,
      gameCompleted: true
    };
    const structuredRequest = {
      choice: data.gameOverChoiceId || undefined,
      slots: slotsPayload
    };
    conversationHandler.sendStructured(structuredRequest, contextPayload);
  };

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
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--primary-80)', margin: 0 }}>
          {data.title || 'Classic Pong'}
        </h2>
        <Icons.Play size={28} className="text-accent" />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <BaseText>{data.instructions || 'Use ↑↓ arrow keys or W/S to move your paddle'}</BaseText>
        <SmallText>First to {winningScore} points wins!</SmallText>
      </div>

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

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', marginTop: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <BaseText>Player</BaseText>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>
            {gameState.playerScore}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <BaseText>AI</BaseText>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--error-primary)' }}>
            {gameState.aiScore}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {gameState.gameStatus === 'waiting' && (
          <TextButton label="Start Game" Icon={Icons.Play} onClick={startGame} type="main" />
        )}
        {(gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') && (
          <TextButton label={gameState.gameStatus === 'playing' ? 'Pause' : 'Resume'} Icon={gameState.gameStatus === 'playing' ? Icons.Time : Icons.Play} onClick={pauseGame} type="ghost" />
        )}
        {gameState.gameStatus !== 'waiting' && (
          <TextButton label="Restart" Icon={Icons.Restart} onClick={restartGame} type="ghost" />
        )}
        {gameState.gameStatus === 'gameOver' && (
          <TextButton label="End Game" Icon={Icons.ArrowForward} onClick={endGame} type="main" />
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <SmallText>SPACE: Start/Pause</SmallText>
        <SmallText>↑↓ / W S: Move</SmallText>
        <SmallText>R: Restart</SmallText>
      </div>
    </div>
  );
};

export default PongGameComponent;