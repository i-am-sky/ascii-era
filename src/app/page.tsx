"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Camera, Scan, Type, SlidersHorizontal, Contrast, Settings } from 'lucide-react';

const CHARSETS = {
  simple: ' .:-=+*#%@',
  complex: ' `.-\':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@',
  binary: '01',
  blocks: ' ░▒▓█'
};

export default function Home() {
  const [fontSize, setFontSizeState] = useState(10);
  const [gain, setGainState] = useState(1.0);
  const [contrast, setContrastState] = useState(1.0);
  const [mode, setModeState] = useState('matrix');
  const [charset, setCharsetState] = useState('complex');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  
  const fontSizeRef = useRef(fontSize);
  const gainRef = useRef(gain);
  const contrastRef = useRef(contrast);
  const modeRef = useRef(mode);
  const charsetRef = useRef(charset);
  const colorRef = useRef('#00ff00');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-mode', mode);
    setTimeout(() => {
        colorRef.current = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
    }, 10);
  }, [mode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(stream => {
        video.srcObject = stream;
        video.play();
      })
      .catch(err => console.error("Error accessing camera:", err));
      
    return () => {
        const stream = video.srcObject as MediaStream;
        if(stream) {
            stream.getTracks().forEach(t => t.stop());
        }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId: number;

    const renderAscii = () => {
      animationFrameId = requestAnimationFrame(renderAscii);
      if (video.readyState < 2) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-color').trim() || '#000';
      ctx.fillRect(0, 0, width, height);

      const fSize = fontSizeRef.current;
      let charWidth = fSize * 0.6;
      let charHeight = fSize;

      const cols = Math.floor(width / charWidth);
      const rows = Math.floor(height / charHeight);

      if(cols <= 0 || rows <= 0) return;

      charWidth = width / cols;
      charHeight = height / rows;

      const offCanvas = document.createElement('canvas');
      offCanvas.width = cols;
      offCanvas.height = rows;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      const videoRatio = video.videoWidth / video.videoHeight;
      const canvasRatio = cols / rows;
      let drawWidth = cols;
      let drawHeight = rows;
      let offsetX = 0;
      let offsetY = 0;

      if (videoRatio > canvasRatio) {
        drawWidth = rows * videoRatio;
        offsetX = (drawWidth - cols) / 2;
      } else {
        drawHeight = cols / videoRatio;
        offsetY = (drawHeight - rows) / 2;
      }

      offCtx.translate(cols, 0);
      offCtx.scale(-1, 1);
      offCtx.drawImage(video, -offsetX, -offsetY, drawWidth, drawHeight);
      
      const imageData = offCtx.getImageData(0, 0, cols, rows);
      const data = imageData.data;

      const chars = CHARSETS[charsetRef.current as keyof typeof CHARSETS];
      const charLen = chars.length;

      ctx.font = `${fSize}px "Fira Code", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const currentGain = gainRef.current;
      const currentContrast = contrastRef.current;
      const currentMode = modeRef.current;
      const currentColor = colorRef.current;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const index = (y * cols + x) * 4;
          let r = data[index];
          let g = data[index + 1];
          let b = data[index + 2];
          
          r = Math.min(255, r * currentGain);
          g = Math.min(255, g * currentGain);
          b = Math.min(255, b * currentGain);

          const applyContrast = (val: number) => {
             return Math.min(255, Math.max(0, ((val / 255 - 0.5) * currentContrast + 0.5) * 255));
          };
          
          r = applyContrast(r);
          g = applyContrast(g);
          b = applyContrast(b);

          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const charIndex = Math.max(0, Math.min(charLen - 1, Math.floor(luminance * charLen)));
          const char = chars[charIndex];
          
          // Map darker pixels to earlier characters (like space), brighter to later
          
          if (currentMode === 'color') {
             ctx.fillStyle = `rgb(${r},${g},${b})`;
          } else {
             ctx.fillStyle = currentColor;
          }
          
          ctx.fillText(char, x * charWidth + charWidth/2, y * charHeight + charHeight/2);
        }
      }
    };

    renderAscii();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleCapture = () => {
     if(canvasRef.current) {
        const url = canvasRef.current.toDataURL("image/png");
        const a = document.createElement('a');
        a.href = url;
        a.download = `ascii_era_${Date.now()}.png`;
        a.click();
     }
  };

  const updateFontSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setFontSizeState(val);
    fontSizeRef.current = val;
  };
  const updateGain = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setGainState(val);
    gainRef.current = val;
  };
  const updateContrast = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setContrastState(val);
    contrastRef.current = val;
  };
  const setMode = (m: string) => {
    setModeState(m);
    modeRef.current = m;
  };
  const setCharset = (c: string) => {
    setCharsetState(c);
    charsetRef.current = c;
  };

  return (
    <>
      <div className="header">
        <div>Ascii Era</div>
        <div>SYSTEM: ONLINE CAM_FEED: ACTIVE</div>
      </div>

      <div className="ascii-container">
        <canvas ref={canvasRef} className="ascii-canvas" />
        <video ref={videoRef} playsInline style={{ display: 'none' }} />
      </div>

      <div className="controls-wrapper">
        <div className="action-buttons">
          <button className="action-btn" onClick={handleCapture} title="Screenshot">
            <Camera size={24} />
          </button>
          {/* <button className="action-btn active" title="Scan Feed">
            <Scan size={24} />
          </button> */}
          <button className={`action-btn mobile-cog-btn ${isMobilePanelOpen ? 'active' : ''}`} onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)} title="Settings">
            <Settings size={24} />
          </button>
        </div>

        <div className={`controls-panel-container ${isMobilePanelOpen ? 'open' : 'closed'}`}>
          <div className="controls-panel-inner">
            <div className="controls-panel">
          <div className="control-group">
            <label className="control-label"><Type size={16}/> FONT SIZE: {fontSize}px</label>
            <input type="range" className="slider" min="6" max="24" step="1" value={fontSize} onChange={updateFontSize} />
          </div>

          <div className="control-group">
            <label className="control-label"><SlidersHorizontal size={16}/> GAIN: {gain.toFixed(1)}</label>
            <input type="range" className="slider" min="0.5" max="3" step="0.1" value={gain} onChange={updateGain} />
          </div>

          <div className="control-group">
            <label className="control-label"><Contrast size={16}/> CONTRAST: {contrast.toFixed(1)}</label>
            <input type="range" className="slider" min="0.5" max="3" step="0.1" value={contrast} onChange={updateContrast} />
          </div>

          <div className="control-group">
            <label className="control-label">MODE</label>
            <div className="button-group">
              <button className={`btn ${mode === 'matrix' ? 'active' : ''}`} onClick={() => setMode('matrix')}>MATRIX</button>
              <button className={`btn ${mode === 'bw' ? 'active' : ''}`} onClick={() => setMode('bw')}>BW</button>
              <button className={`btn ${mode === 'retro' ? 'active' : ''}`} onClick={() => setMode('retro')}>RETRO</button>
              <button className={`btn ${mode === 'color' ? 'active' : ''}`} onClick={() => setMode('color')}>COLOR</button>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">CHARSET</label>
            <div className="button-group">
              <button className={`btn ${charset === 'simple' ? 'active' : ''}`} onClick={() => setCharset('simple')}>SIMPLE</button>
              <button className={`btn ${charset === 'complex' ? 'active' : ''}`} onClick={() => setCharset('complex')}>COMPLEX</button>
              <button className={`btn ${charset === 'binary' ? 'active' : ''}`} onClick={() => setCharset('binary')}>BINARY</button>
              <button className={`btn ${charset === 'blocks' ? 'active' : ''}`} onClick={() => setCharset('blocks')}>BLOCKS</button>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
