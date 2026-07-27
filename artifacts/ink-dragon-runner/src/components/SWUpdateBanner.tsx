import React, { useEffect, useState } from 'react';

export const SWUpdateBanner: React.FC = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 依據使用者規則：本地 localhost 環境主動 unregister 並跳過註冊，避免 HMR 衝突
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    );

    if ('serviceWorker' in navigator) {
      if (isLocalhost) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        return;
      }

      const swUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/sw.js`;

      // 正式環境 (GitHub Pages / Production) 註冊與主動檢查 SW
      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          // 定期或分頁可見時主動檢查伺服器更新
          const checkUpdate = () => {
            reg.update().catch(() => {});
          };

          window.addEventListener('focus', checkUpdate);
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') checkUpdate();
          });

          // 如果已經有待命的 waiting worker
          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setShowBanner(true);
          }

          // 監聽新版本下載安裝
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  setWaitingWorker(installingWorker);
                  setShowBanner(true);
                }
              };
            }
          };
        })
        .catch(() => {});

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Vite Chunk Hash 自癒機制：擷取動態載入失敗錯誤並自動重新整理
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorMsg = 'reason' in event ? (event.reason?.message || '') : (event.message || '');
      if (
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('Dynamically imported module') ||
        errorMsg.includes('Failed to fetch dynamically imported module')
      ) {
        const hasReloaded = sessionStorage.getItem('vite_chunk_reload');
        if (!hasReloaded) {
          sessionStorage.setItem('vite_chunk_reload', 'true');
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleChunkError);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-[9999] bg-[#F5F0E8] border-2 border-[#E34234] text-[#2C1810] p-4 rounded-lg shadow-2xl flex items-center justify-between gap-3 animate-bounce">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🐲</span>
        <div>
          <h4 className="font-bold text-sm text-[#E34234]">發現新版本 (v1.2.1)！</h4>
          <p className="text-xs text-[#5A3E30]">已修復資產快取與 404 自癒機制，點擊即刻載入最新版。</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 bg-[#E34234] hover:bg-[#c73228] text-white text-xs font-bold rounded shadow transition-colors whitespace-nowrap"
        >
          立即更新
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="px-2 py-1.5 text-xs text-[#9A8070] hover:text-[#3D2B1F]"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
