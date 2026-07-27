import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameControls } from '../hooks/useGameControls';
import { useGameLoop } from '../hooks/useGameLoop';
import { useAudio } from '../hooks/useAudio';
import { DRAGON_SKINS, DragonSkin } from '../game/skins';
import { generateShareCard } from '../game/shareCard';
import { fetchLeaderboard, submitScore, ScoreEntry } from '../lib/cloudScores';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { stateRef, uiState, startGame, setGameOver } = useGameState();
  const { playJump, playHit, playPowerUpCollect, playShieldBreak, playBoost, toggleMute, isMuted, ensureCtx } = useAudio(stateRef);
  const { onTouchStart, onTouchEnd, handleJump } = useGameControls(stateRef, startGame, playJump, ensureCtx);

  useGameLoop(canvasRef, stateRef, setGameOver, playHit, playPowerUpCollect, playShieldBreak, playBoost);

  // Leaderboard & Skin state
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('ink-dragon-playername') || '');
  const [selectedSkinId, setSelectedSkinId] = useState(() => localStorage.getItem('ink-dragon-selected-skin') || 'classic');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Share Card Modal state
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);

  // 同步選擇皮膚至 stateRef
  const handleSelectSkin = (skinId: string) => {
    setSelectedSkinId(skinId);
    stateRef.current.selectedSkinId = skinId;
    localStorage.setItem('ink-dragon-selected-skin', skinId);
  };

  // 載入雲端與本地排行榜
  useEffect(() => {
    if (uiState.mode === 'DEAD' || uiState.mode === 'IDLE') {
      fetchLeaderboard().then(setLeaderboard);
    }
    if (uiState.mode === 'DEAD') {
      setSubmitted(false);
      setShowLeaderboard(false);
      setShareCardUrl(null);
    }
  }, [uiState.mode]);

  const handleSubmit = useCallback(async () => {
    const name = playerName.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    localStorage.setItem('ink-dragon-playername', name);
    const ok = await submitScore(name, uiState.score, selectedSkinId);
    if (ok) {
      const updated = await fetchLeaderboard();
      setLeaderboard(updated);
      setSubmitted(true);
      setShowLeaderboard(true);
    }
    setSubmitting(false);
  }, [playerName, uiState.score, selectedSkinId, submitting]);

  // 生成戰報卡片
  const handleGenerateShareCard = () => {
    const dataUrl = generateShareCard(
      playerName || '大俠小墨龍',
      uiState.score,
      uiState.highScore,
      selectedSkinId
    );
    setShareCardUrl(dataUrl);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isNewRecord = uiState.isNewRecord;

  return (
    <div
      className="relative w-full h-[100dvh] min-h-[100vh] overflow-hidden select-none bg-[#F5F0E8] text-[#2C1810] transition-colors duration-1000"
      onClick={handleJump}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <canvas ref={canvasRef} className="block w-full h-full bg-[#F5F0E8]" />

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        title={isMuted ? '開啟音效' : '靜音'}
        className="absolute top-3 right-3 z-50 w-10 h-10 flex items-center justify-center rounded-full border border-[#3D2B1F]/30 bg-[#F5F0E8]/70 text-[#3D2B1F] hover:bg-[#F5F0E8] transition-colors shadow-sm backdrop-blur-sm"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        )}
      </button>

      {/* IDLE Screen Overlay */}
      {uiState.mode === 'IDLE' && (
        <div className="absolute inset-0 flex flex-col items-center justify-between text-center py-10 z-40 pointer-events-auto bg-[#F5F0E8]/40 backdrop-blur-[1px]">
          <div className="mt-6">
            <h1 className="text-5xl md:text-7xl text-[#8B4513] font-brush tracking-widest drop-shadow-md mb-2" style={{textShadow: '3px 3px 0px rgba(200,184,162,0.5)'}}>
              仙人掌大逃亡
            </h1>
            <h2 className="text-xl md:text-3xl text-[#2C1810] tracking-widest opacity-90">
              奔跑吧小墨龍
            </h2>
          </div>

          {/* 神龍水墨皮膚選擇 Carousel */}
          <div className="w-full max-w-3xl md:max-w-4xl px-4 my-2" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm sm:text-base md:text-xl font-bold text-[#5A3E30] mb-3 tracking-widest drop-shadow-sm">
              🎨 選擇出戰神龍水墨皮膚
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {DRAGON_SKINS.map((skin: DragonSkin) => {
                const isSelected = skin.id === selectedSkinId;
                return (
                  <button
                    key={skin.id}
                    onClick={() => handleSelectSkin(skin.id)}
                    className={`p-3.5 sm:p-4 md:p-5 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#E34234] bg-white shadow-xl scale-[1.03] ring-2 ring-[#E34234]/30'
                        : 'border-[#3D2B1F]/20 bg-[#F5F0E8]/90 hover:border-[#3D2B1F]/50 hover:bg-white/60 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl sm:text-3xl">{skin.badge}</span>
                        <span className="font-bold text-sm sm:text-base md:text-lg text-[#2C1810] tracking-wide">
                          {skin.name}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#5A3E30] leading-relaxed">
                        {skin.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2 text-right">
                        <span className="inline-block text-xs md:text-sm bg-[#E34234] text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                          ✓ 出戰中
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[#3D2B1F] animate-pulse text-base md:text-xl border border-[#3D2B1F]/30 px-8 py-3 rounded bg-[#F5F0E8]/90 shadow-md cursor-pointer" onClick={startGame}>
              點擊螢幕或按空白鍵開始冒險
            </p>
          </div>
        </div>
      )}

      {/* GAME OVER Screen Overlay */}
      {uiState.mode === 'DEAD' && (
        <div
          className="absolute inset-0 bg-[#1A1410]/70 flex flex-col items-center justify-center text-center backdrop-blur-sm z-50 overflow-y-auto py-6"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') return;
            if (!showLeaderboard && !shareCardUrl) startGame();
          }}
        >
          <div
            className="border-[3px] border-[#E34234] p-6 sm:p-8 relative bg-[#F5F0E8] w-full mx-4 shadow-2xl rounded-xl"
            style={{ maxWidth: '28rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* New record badge */}
            {isNewRecord && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#E34234] text-white text-xs sm:text-sm font-bold px-4 py-1 rounded-full shadow-md tracking-widest whitespace-nowrap">
                🏆 新紀錄！
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl text-[#E34234] font-brush tracking-widest mb-4 border-b-2 border-[#E34234]/30 pb-2">
              遊戲結束
            </h1>

            {/* Score comparison */}
            <div className="mb-5 space-y-1">
              <p className="text-4xl sm:text-5xl text-[#2C1810] font-sans font-bold">
                {uiState.score}
                <span className="text-base sm:text-lg font-normal ml-2 text-[#5A3E30]">本次距離</span>
              </p>
              <p className="text-base text-[#2C1810]/80 font-sans">
                個人最佳：<span className={`font-bold ${isNewRecord ? 'text-[#E34234]' : ''}`}>{uiState.highScore}</span>
              </p>
            </div>

            {/* Submit to leaderboard */}
            {!submitted ? (
              <div className="mb-5 space-y-2" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm font-bold text-[#5A3E30]">上傳成績至全台雲端排行榜</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="輸入大俠名字"
                    maxLength={20}
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-[#3D2B1F]/30 rounded-lg bg-white text-[#2C1810] focus:outline-none focus:border-[#E34234]"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!playerName.trim() || submitting}
                    className="px-4 py-2 text-sm bg-[#E34234] font-bold text-white rounded-lg disabled:opacity-40 hover:bg-[#c73228] transition-colors whitespace-nowrap"
                  >
                    {submitting ? '…' : '送出'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold text-[#5A3E30] mb-4">✓ 成績已成功登錄雲端！</p>
            )}

            {/* 功能按鈕組：戰報生成 & 排行榜 */}
            <div className="flex justify-center gap-3 mb-5">
              <button
                onClick={handleGenerateShareCard}
                className="px-4 py-2 text-xs sm:text-sm border border-[#8B4513] bg-[#EAE2D5] text-[#3D2B1F] rounded-lg font-bold hover:bg-[#d8c8b0] transition-colors flex items-center gap-1 shadow-sm"
              >
                🎨 生成水墨戰報
              </button>

              <button
                onClick={() => setShowLeaderboard((v) => !v)}
                className="px-4 py-2 text-xs sm:text-sm border border-[#E34234] text-[#E34234] rounded-lg font-bold hover:bg-[#E34234]/10 transition-colors shadow-sm"
              >
                {showLeaderboard ? '收起榜單' : '🌐 雲端排行榜 Top 10'}
              </button>
            </div>

            {/* Leaderboard table */}
            {showLeaderboard && leaderboard.length > 0 && (
              <div className="mb-5 w-full text-left border-t border-[#E34234]/20 pt-3">
                <p className="text-xs sm:text-sm font-bold text-[#5A3E30] mb-2 tracking-widest text-center">🏅 全台雲端排行榜 Top 10</p>
                <table className="w-full text-xs sm:text-sm text-[#2C1810]">
                  <tbody>
                    {leaderboard.map((entry, i) => (
                      <tr
                        key={i}
                        className={`border-b border-[#E34234]/10 last:border-0 ${
                          entry.name === playerName.trim() && entry.score === uiState.score
                            ? 'font-bold text-[#E34234] bg-[#E34234]/5'
                            : ''
                        }`}
                      >
                        <td className="py-1.5 pr-2 w-6 text-center font-bold">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                        </td>
                        <td className="py-1.5 flex-1 truncate max-w-[130px] font-medium">{entry.name}</td>
                        <td className="py-1.5 pl-2 text-right font-mono font-bold">{entry.score}m</td>
                        <td className="py-1.5 pl-2 text-right text-[#9A8070] text-[11px] sm:text-xs">{entry.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p
              className="text-[#E34234] text-xs sm:text-sm font-bold animate-pulse cursor-pointer border border-[#E34234]/30 inline-block px-6 py-2.5 rounded-lg bg-white/70 shadow-sm"
              onClick={startGame}
            >
              點擊螢幕或按 Enter 重新開始
            </p>
          </div>
        </div>
      )}

      {/* 水墨戰報卡片彈窗 (Modal) */}
      {shareCardUrl && (
        <div
          className="fixed inset-0 z-[99999] bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShareCardUrl(null)}
        >
          <div className="relative max-w-sm w-full bg-[#F5F0E8] p-4 rounded-xl shadow-2xl flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-base text-[#8B4513]">🎨 你的水墨專屬戰報圖卡</h3>
            <img src={shareCardUrl} alt="水墨戰報" className="w-full rounded border border-[#3D2B1F]/30 shadow-md" />
            <div className="flex gap-3 w-full justify-center">
              <a
                href={shareCardUrl}
                download={`墨龍戰報-${playerName || '大俠'}.png`}
                className="px-4 py-2 bg-[#E34234] text-white text-xs font-bold rounded shadow hover:bg-[#c73228] transition-colors flex items-center gap-1"
              >
                📥 下載圖卡 (PNG)
              </a>
              <button
                onClick={() => setShareCardUrl(null)}
                className="px-4 py-2 bg-[#3D2B1F]/20 text-[#2C1810] text-xs font-bold rounded hover:bg-[#3D2B1F]/30"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
