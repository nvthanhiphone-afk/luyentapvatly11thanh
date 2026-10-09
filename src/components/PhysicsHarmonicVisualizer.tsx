import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, Waves, Sliders } from 'lucide-react';

export const PhysicsHarmonicVisualizer: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [amplitude, setAmplitude] = useState(5); // cm (2 to 8)
  const [frequency, setFrequency] = useState(1.0); // Hz (0.5 to 2.5)
  const [mode, setMode] = useState<'OSCILLATION' | 'WAVE'>('OSCILLATION');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isRunning) {
        timeRef.current += dt;
      }

      const t = timeRef.current;
      const omega = 2 * Math.PI * frequency;
      const A = amplitude; // amplitude in cm
      const x = A * Math.cos(omega * t); // current displacement
      const v = -omega * A * Math.sin(omega * t); // velocity
      const a = -omega * omega * x; // acceleration

      const width = canvas.width;
      const height = canvas.height;

      // Clear with clean scientific grid
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#0f172a'; // Deep slate scientific canvas
      ctx.fillRect(0, 0, width, height);

      // Subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let px = 0; px < width; px += gridSize) {
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();
      }
      for (let py = 0; py < height; py += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }

      if (mode === 'OSCILLATION') {
        // --- ZONE 1: SPRING PENDULUM (Top half) ---
        const springBaseY = 70;
        const centerX = 160;
        const scalePx = 14; // pixels per cm
        const bobX = centerX + x * scalePx;

        // Draw ceiling / fixed wall
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(30, springBaseY - 30);
        ctx.lineTo(30, springBaseY + 30);
        ctx.stroke();

        // Draw spring from wall (x=30) to bobX
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const coils = 16;
        const startX = 30;
        const totalLen = bobX - startX;
        ctx.moveTo(startX, springBaseY);
        for (let i = 0; i < coils; i++) {
          const cx = startX + (totalLen / coils) * (i + 0.5);
          const cy = springBaseY + (i % 2 === 0 ? -12 : 12);
          ctx.lineTo(cx, cy);
        }
        ctx.lineTo(bobX, springBaseY);
        ctx.stroke();

        // Draw Mass Bob
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(bobX, springBaseY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Bob outline
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Equilibrium line O
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(centerX, 25);
        ctx.lineTo(centerX, 115);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('x = 0 (VTCB)', centerX - 24, 20);

        // Velocity arrow
        if (Math.abs(v) > 0.5) {
          ctx.strokeStyle = '#34d399';
          ctx.fillStyle = '#34d399';
          ctx.lineWidth = 2;
          const arrowLen = (v / (2 * Math.PI * 2.5 * 8)) * 40;
          ctx.beginPath();
          ctx.moveTo(bobX, springBaseY + 22);
          ctx.lineTo(bobX + arrowLen, springBaseY + 22);
          ctx.stroke();
          // arrow head
          ctx.beginPath();
          ctx.moveTo(bobX + arrowLen, springBaseY + 22);
          ctx.lineTo(bobX + arrowLen - Math.sign(arrowLen) * 5, springBaseY + 18);
          ctx.lineTo(bobX + arrowLen - Math.sign(arrowLen) * 5, springBaseY + 26);
          ctx.fill();

          ctx.fillStyle = '#34d399';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText('v', bobX + arrowLen / 2 - 4, springBaseY + 36);
        }

        // --- ZONE 2: LIVE SINE WAVE GRAPH x(t) (Bottom half) ---
        const graphStartY = 190;
        const graphStartX = 60;
        const graphWidth = width - 80;

        // Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        // horizontal t axis
        ctx.beginPath();
        ctx.moveTo(graphStartX, graphStartY);
        ctx.lineTo(graphStartX + graphWidth, graphStartY);
        ctx.stroke();
        // vertical x axis
        ctx.beginPath();
        ctx.moveTo(graphStartX, graphStartY - 55);
        ctx.lineTo(graphStartX, graphStartY + 55);
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('x (cm)', graphStartX - 35, graphStartY - 45);
        ctx.fillText('t (s)', graphStartX + graphWidth - 10, graphStartY + 16);

        // Draw Sine Wave
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const pts = 120;
        for (let i = 0; i <= pts; i++) {
          const ptRatio = i / pts;
          const simTime = t - (1 - ptRatio) * 3; // past 3 seconds
          const simX = A * Math.cos(omega * simTime);
          const px = graphStartX + ptRatio * graphWidth;
          const py = graphStartY - simX * 6;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Current point marker on graph
        const currentPy = graphStartY - x * 6;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(graphStartX + graphWidth, currentPy, 5, 0, Math.PI * 2);
        ctx.fill();

        // Connecting dashed line between pendulum and graph point
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.moveTo(bobX, springBaseY);
        ctx.lineTo(graphStartX + graphWidth, currentPy);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // --- WAVE MODE (Sóng hình sin truyền đi theo phương Ox) ---
        const waveBaseY = height / 2;
        const waveStartX = 50;
        const waveLen = width - 80;

        // Horizontal axis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(waveStartX, waveBaseY);
        ctx.lineTo(waveStartX + waveLen, waveBaseY);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Phương truyền sóng Ox →', waveStartX + 20, waveBaseY + 60);

        // Sinusoidal wave profile: u(x,t) = A * cos(omega * t - 2*pi*x / lambda)
        const lambda = 180; // px
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let px = 0; px <= waveLen; px += 3) {
          const u = A * 6 * Math.cos(omega * t - (2 * Math.PI * px) / lambda);
          const py = waveBaseY - u;
          if (px === 0) ctx.moveTo(waveStartX + px, py);
          else ctx.lineTo(waveStartX + px, py);
        }
        ctx.stroke();

        // Particle nodes along the wave
        for (let px = 0; px <= waveLen; px += 36) {
          const u = A * 6 * Math.cos(omega * t - (2 * Math.PI * px) / lambda);
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(waveStartX + px, waveBaseY - u, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, amplitude, frequency, mode]);

  const omegaVal = (2 * Math.PI * frequency).toFixed(1);
  const periodVal = (1 / frequency).toFixed(2);

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 text-white flex flex-col justify-between overflow-hidden">
      {/* Simulation Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>Mô Phỏng Trực Quan Vật Lý 11</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              x(t) = {amplitude}·cos({omegaVal}t) (cm)
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('OSCILLATION')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              mode === 'OSCILLATION' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dao động
          </button>
          <button
            type="button"
            onClick={() => setMode('WAVE')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              mode === 'WAVE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sóng cơ
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="my-3 flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={480}
          height={260}
          className="w-full h-auto max-w-full block"
        />
      </div>

      {/* Physics Values Telemetry (Natural unboxed metadata with tabular numerals) */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono py-2 bg-slate-800/40 rounded-xl border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block">Biên độ A</span>
          <span className="font-bold text-sky-400 tabular-nums">{amplitude} cm</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Tần số f</span>
          <span className="font-bold text-emerald-400 tabular-nums">{frequency.toFixed(1)} Hz</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Tần số góc ω</span>
          <span className="font-bold text-indigo-400 tabular-nums">{omegaVal} rad/s</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Chu kì T</span>
          <span className="font-bold text-amber-400 tabular-nums">{periodVal} s</span>
        </div>
      </div>

      {/* Interactive Controls & Sliders */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Sliders */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-slate-400 font-medium whitespace-nowrap">A:</span>
            <input
              type="range"
              min="2"
              max="8"
              step="0.5"
              value={amplitude}
              onChange={e => setAmplitude(parseFloat(e.target.value))}
              className="w-20 accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-slate-400 font-medium whitespace-nowrap">f:</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={frequency}
              onChange={e => setFrequency(parseFloat(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Play/Pause & Reset buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isRunning ? 'Tạm dừng' : 'Chạy tiếp'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              timeRef.current = 0;
              setAmplitude(5);
              setFrequency(1.0);
            }}
            title="Đặt lại thông số mặc định"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
