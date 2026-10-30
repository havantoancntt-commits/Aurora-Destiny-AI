// ==========================================
// CELESTIAL PLANETARY MAP & COORDINATES COMPONENT
// Bản Đồ Thiên Cầu & Tọa Độ Thiên Văn 10 Hành Tinh Bản Mệnh
// Chuẩn xác Kinh độ (λ), Vĩ độ hoàng đạo (β), Xích kinh (α), Xích vĩ (δ) & Góc Chiếu
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Compass,
  Sparkles,
  Info,
  Maximize2,
  Eye,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Orbit,
  Table,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { BirthData } from '../types/destiny';
import {
  calculateCelestialBirthChart,
  CelestialCoordinate,
  CelestialAspect,
  CelestialBodyId,
  ZODIAC_SIGNS
} from '../engine/celestialEphemeris';

interface Props {
  birthData: BirthData;
  userName?: string;
  onOpenGlossaryModal?: () => void;
}

export const CelestialPlanetaryMap: React.FC<Props> = ({
  birthData,
  userName = 'Đương Số',
  onOpenGlossaryModal
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'table' | 'aspects'>('radar');
  const [selectedPlanetId, setSelectedPlanetId] = useState<CelestialBodyId | null>('sun');
  const [filterCategory, setFilterCategory] = useState<'all' | 'luminary' | 'inner' | 'social' | 'outer' | 'node' | 'retrograde'>('all');
  const [showCoordinateGuide, setShowCoordinateGuide] = useState<boolean>(false);

  // Compute astronomical birth chart with high-precision ephemeris
  const chart = useMemo(() => {
    return calculateCelestialBirthChart(birthData);
  }, [birthData]);

  // Selected planet details
  const selectedPlanet = useMemo(() => {
    return chart.bodies.find(b => b.id === selectedPlanetId) || chart.bodies[0];
  }, [chart, selectedPlanetId]);

  // Filtered bodies for display
  const filteredBodies = useMemo(() => {
    if (filterCategory === 'all') return chart.bodies;
    if (filterCategory === 'retrograde') return chart.bodies.filter(b => b.isRetrograde);
    return chart.bodies.filter(b => b.category === filterCategory);
  }, [chart.bodies, filterCategory]);

  // Aspects related to the selected planet
  const selectedPlanetAspects = useMemo(() => {
    if (!selectedPlanetId) return chart.aspects;
    return chart.aspects.filter(a => a.planet1 === selectedPlanetId || a.planet2 === selectedPlanetId);
  }, [chart.aspects, selectedPlanetId]);

  // Dimensions for Celestial Sphere Radar SVG
  const size = 520;
  const center = size / 2;
  const outerRadius = 220;
  const zodiacInnerRadius = 180;
  const orbitMaxRadius = 170;
  const orbitMinRadius = 70;

  // Function to convert ecliptic longitude & latitude to radar (r, theta) coordinates
  const getCoordinatesOnRadar = (longitude: number, latitude: number) => {
    // 0° Aries starts at 90° (Top) or 180° (Left). Classical horoscope: Ascendant (Left 180°), Aries counter-clockwise
    // Here we map 0° Aries to 180° (East/Ascendant) counter-clockwise for astrological convention
    const angleRad = (180 - longitude) * (Math.PI / 180);
    
    // Map latitude (-7° to +7°) into radial offset around middle orbit
    // Middle orbit radius = (orbitMaxRadius + orbitMinRadius) / 2 = 120
    const baseRadius = 125;
    const latOffset = Math.max(-45, Math.min(45, latitude * 6)); // 1 deg lat = 6px
    const radius = baseRadius + latOffset;

    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);
    return { x, y, angleRad, radius };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-3xl bg-gradient-to-b from-[#130d22]/95 via-[#0e091b]/95 to-[#070510]/95 border border-amber-500/35 p-4 sm:p-6 shadow-[0_12px_45px_rgba(0,0,0,0.6)] space-y-5 backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background starlight ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Orbit className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '24s' }} />
              THIÊN VĂN BẢN MỆNH • EPHEMERIS J2000
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Kinh Độ &amp; Vĩ Độ Thiên Cầu (λ, β)
            </span>
            {chart.retrogradeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {chart.retrogradeCount} Hành Tinh Nghịch Hành ℞
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
            <span>Bản Đồ Vị Trí Các Hành Tinh Tại Thời Khắc Sinh</span>
            <span className="text-amber-300 font-normal text-sm font-sans">({userName})</span>
          </h3>
          <p className="text-xs text-slate-300 font-light mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Sinh: <strong className="text-slate-100">{birthData.solarHour}:{String(birthData.solarMinute).padStart(2, '0')} ngày {birthData.solarDay}/{birthData.solarMonth}/{birthData.solarYear}</strong></span>
            <span>•</span>
            <span>Tọa độ địa lý: <strong className="text-amber-200">{chart.geographicLocation.city} ({chart.geographicLocation.latitude}°N, {chart.geographicLocation.longitude}°E)</strong></span>
            <span>•</span>
            <span>Cung Mọc (Ascendant): <strong className="text-teal-300">{chart.ascendantSign.nameVi} {chart.ascendantSign.symbol} ({chart.ascendantDegree}°)</strong></span>
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Thiên Cầu 360°</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'table'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tọa Độ Chi Tiết (λ, β)</span>
          </button>
          <button
            onClick={() => setActiveTab('aspects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'aspects'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Góc Chiếu ({chart.aspects.length})</span>
          </button>
        </div>
      </div>

      {/* QUICK EXPLAINER ACCORDION */}
      <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 text-xs">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCoordinateGuide(!showCoordinateGuide)}
            className="flex items-center gap-2 text-amber-300/90 hover:text-amber-200 transition-colors cursor-pointer font-medium text-left"
          >
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Kinh độ &amp; Vĩ độ thiên văn là gì? Tại sao quan trọng đối với bản mệnh?
            </span>
            {showCoordinateGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {onOpenGlossaryModal && (
            <button
              onClick={onOpenGlossaryModal}
              className="text-[11px] text-amber-400 hover:underline shrink-0 ml-2 cursor-pointer"
            >
              Cẩm nang tra cứu
            </button>
          )}
        </div>

        {showCoordinateGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2.5 mt-2 border-t border-white/10 text-slate-300 space-y-2 text-[11px] leading-relaxed"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="font-semibold text-amber-300 block mb-1">
                  1. Kinh độ Hoàng đạo (Ecliptic Longitude - λ):
                </span>
                Góc đo từ 0° đến 360° tính từ điểm Xuân Phân dọc theo mặt phẳng quỹ đạo Trái Đất, chia đều thành 12 Cung Hoàng Đạo (mỗi cung 30°). Cho biết vị trí chính xác của hành tinh tại thời điểm sinh.
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="font-semibold text-cyan-300 block mb-1">
                  2. Vĩ độ Hoàng đạo (Ecliptic Latitude - β):
                </span>
                Góc nghiêng đo độ lệch của hành tinh lên phía Bắc (+) hoặc xuống phía Nam (-) so với mặt phẳng Hoàng Đạo. Mặt Trời luôn có vĩ độ bằng 0.00°. Các hành tinh có vĩ độ lệch thể hiện năng lượng đột biến và các chu kỳ che khuất (Nhật/Nguyệt thực).
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="font-semibold text-teal-300 block mb-1">
                  3. Xích kinh (RA - α) &amp; Xích vĩ (Dec - δ):
                </span>
                Hệ tọa độ xích đạo thiên cầu hướng tâm Trái Đất, biểu thị điểm thiên đỉnh mà hành tinh đang chiếu rọi tại vĩ độ địa lý nơi bạn cất tiếng khóc chào đời.
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                <span className="font-semibold text-rose-300 block mb-1">
                  4. Hiện tượng Nghịch hành (Retrograde ℞):
                </span>
                Khi Trái Đất vượt qua hành tinh trên quỹ đạo, tạo ảo ảnh hành tinh đi lùi trên bầu trời. Là thời điểm năng lượng của hành tinh quay vào bên trong, rèn giũa bài học tâm thức và trực giác vượt trội.
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* FILTER BAR FOR CELESTIAL BODIES */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-amber-400" /> Lọc:
        </span>
        {[
          { key: 'all', label: 'Tất cả (12)' },
          { key: 'luminary', label: 'Nhật Nguyệt (☉ ☽)' },
          { key: 'inner', label: 'Hành Tinh Trong (☿ ♀ ♂)' },
          { key: 'social', label: 'Xã Hội (♃ ♄)' },
          { key: 'outer', label: 'Tâm Thức Vũ Trụ (♅ ♆ ♇)' },
          { key: 'node', label: 'Điểm Nút (☊ ☋)' },
          { key: 'retrograde', label: `Nghịch Hành (${chart.retrogradeCount})` }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilterCategory(item.key as any)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              filterCategory === item.key
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RADAR / CELESTIAL SPHERE WHEEL */}
      {activeTab === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* LEFT: INTERACTIVE SVG RADAR */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-2 relative">
            <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full h-full select-none"
              >
                <defs>
                  {/* Gradients for central disk and cosmic atmosphere */}
                  <radialGradient id="celestialCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#1e1035" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0b0816" stopOpacity="0.95" />
                  </radialGradient>

                  <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Central Celestial Background Disk */}
                <circle
                  cx={center}
                  cy={center}
                  r={outerRadius}
                  fill="url(#celestialCenterGlow)"
                  stroke="#332244"
                  strokeWidth="1.5"
                />

                {/* Concentric Ecliptic Latitude Latitude Bands (-5°, 0°, +5°) */}
                <circle
                  cx={center}
                  cy={center}
                  r={orbitMaxRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={center}
                  cy={center}
                  r={125}
                  fill="none"
                  stroke="rgba(245,158,11,0.25)"
                  strokeWidth="1.5"
                />
                <circle
                  cx={center}
                  cy={center}
                  r={orbitMinRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Ecliptic Plane Label in center ring */}
                <text
                  x={center}
                  y={center + 125 - 6}
                  fill="rgba(245,158,11,0.4)"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  MẶT PHẲNG HOÀNG ĐẠO (β = 0°)
                </text>

                {/* Outer 12 Zodiac Sign Ring Sectors */}
                {ZODIAC_SIGNS.map((sign, idx) => {
                  const startAngle = (180 - sign.startDegree) * (Math.PI / 180);
                  const endAngle = (180 - sign.endDegree) * (Math.PI / 180);
                  const midAngle = (180 - (sign.startDegree + 15)) * (Math.PI / 180);

                  const x1 = center + outerRadius * Math.cos(startAngle);
                  const y1 = center + outerRadius * Math.sin(startAngle);
                  const x2 = center + zodiacInnerRadius * Math.cos(startAngle);
                  const y2 = center + zodiacInnerRadius * Math.sin(startAngle);

                  const symbolX = center + ((outerRadius + zodiacInnerRadius) / 2) * Math.cos(midAngle);
                  const symbolY = center + ((outerRadius + zodiacInnerRadius) / 2) * Math.sin(midAngle) + 4;

                  const isFire = sign.element === 'Hỏa';
                  const isEarth = sign.element === 'Thổ';
                  const isAir = sign.element === 'Khí';
                  const elementColor = isFire ? '#fb923c' : isEarth ? '#34d399' : isAir ? '#38bdf8' : '#818cf8';

                  return (
                    <g key={sign.id}>
                      {/* Boundary Line */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                      />
                      {/* Zodiac Symbol */}
                      <text
                        x={symbolX}
                        y={symbolY}
                        fill={elementColor}
                        fontSize="13"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="cursor-pointer transition-transform hover:scale-125"
                      >
                        {sign.symbol}
                      </text>
                    </g>
                  );
                })}

                {/* Outer Ring Border */}
                <circle
                  cx={center}
                  cy={center}
                  r={outerRadius}
                  fill="none"
                  stroke="url(#goldRingGrad)"
                  strokeWidth="2"
                />
                <circle
                  cx={center}
                  cy={center}
                  r={zodiacInnerRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1"
                />

                {/* Center Core: Earth & Sun Axis */}
                <circle
                  cx={center}
                  cy={center}
                  r="18"
                  fill="#0e0a1b"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                />
                <text
                  x={center}
                  y={center + 3.5}
                  fill="#fbbf24"
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  ĐỊA CẦU
                </text>

                {/* ASPECT LINES BETWEEN PLANETS */}
                {chart.aspects.map((asp, idx) => {
                  const p1 = chart.bodies.find(b => b.id === asp.planet1);
                  const p2 = chart.bodies.find(b => b.id === asp.planet2);
                  if (!p1 || !p2) return null;

                  const c1 = getCoordinatesOnRadar(p1.longitude, p1.latitude);
                  const c2 = getCoordinatesOnRadar(p2.longitude, p2.latitude);

                  const isHighlighted = selectedPlanetId === asp.planet1 || selectedPlanetId === asp.planet2;
                  const strokeOpacity = isHighlighted ? 0.9 : 0.18;
                  const strokeWidth = isHighlighted ? 2.0 : 1.0;

                  return (
                    <line
                      key={`aspect-${idx}`}
                      x1={c1.x}
                      y1={c1.y}
                      x2={c2.x}
                      y2={c2.y}
                      stroke={asp.color}
                      strokeWidth={strokeWidth}
                      strokeOpacity={strokeOpacity}
                      strokeDasharray={asp.type === 'square' || asp.type === 'opposition' ? '4 2' : 'none'}
                    />
                  );
                })}

                {/* PLANETARY BODIES PLACED ON CELESTIAL RADAR */}
                {filteredBodies.map((body) => {
                  const pos = getCoordinatesOnRadar(body.longitude, body.latitude);
                  const isSelected = selectedPlanetId === body.id;

                  return (
                    <g
                      key={body.id}
                      onClick={() => setSelectedPlanetId(body.id)}
                      className="cursor-pointer group"
                    >
                      {/* Selection Pulse Ring */}
                      {isSelected && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="18"
                          fill="none"
                          stroke={body.color}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          className="animate-spin"
                          style={{ animationDuration: '6s' }}
                        />
                      )}

                      {/* Planet Node Circle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 12 : 9.5}
                        fill="#0c0717"
                        stroke={body.color}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="transition-all duration-200 group-hover:scale-125"
                      />

                      {/* Planet Astrological Glyph */}
                      <text
                        x={pos.x}
                        y={pos.y + (isSelected ? 4.5 : 3.5)}
                        fill={body.color}
                        fontSize={isSelected ? 13 : 10.5}
                        fontWeight="bold"
                        textAnchor="middle"
                        className="pointer-events-none select-none"
                      >
                        {body.glyph}
                      </text>

                      {/* Retrograde Symbol Badge (℞) if applicable */}
                      {body.isRetrograde && (
                        <text
                          x={pos.x + 8}
                          y={pos.y - 7}
                          fill="#f43f5e"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="start"
                          className="select-none"
                        >
                          ℞
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Radar Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-2 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Trùng Tụ (0°)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Tam Hợp (120°)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Lục Hợp (60°)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Vuông Góc (90°)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                <span>Đối Đỉnh (180°)</span>
              </span>
            </div>
          </div>

          {/* RIGHT: DETAILED FOCAL CARD FOR SELECTED PLANET */}
          <div className="lg:col-span-5 space-y-3">
            {selectedPlanet && (
              <motion.div
                key={selectedPlanet.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-500/35 space-y-4 shadow-xl backdrop-blur-md relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg border"
                      style={{
                        backgroundColor: `${selectedPlanet.color}15`,
                        borderColor: selectedPlanet.color,
                        color: selectedPlanet.color
                      }}
                    >
                      {selectedPlanet.glyph}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">
                          {selectedPlanet.nameVi}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">({selectedPlanet.nameEn})</span>
                        {selectedPlanet.isRetrograde && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Nghịch Hành ℞
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-300 font-medium mt-0.5">
                        {selectedPlanet.formattedSign}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-semibold bg-white/5 border border-white/10 text-teal-300">
                    {selectedPlanet.dignity}
                  </span>
                </div>

                {/* EXACT COORDINATES 4-BOX GRID */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Ecliptic Longitude */}
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-amber-300 uppercase font-semibold">
                      Kinh Độ Hoàng Đạo (λ)
                    </div>
                    <div className="text-base font-mono font-bold text-white mt-0.5">
                      {selectedPlanet.longitude}°
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {selectedPlanet.formattedDMS}
                    </div>
                  </div>

                  {/* Ecliptic Latitude */}
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-cyan-300 uppercase font-semibold">
                      Vĩ Độ Hoàng Đạo (β)
                    </div>
                    <div className="text-base font-mono font-bold text-white mt-0.5">
                      {selectedPlanet.latitude >= 0 ? `+${selectedPlanet.latitude}°` : `${selectedPlanet.latitude}°`}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {selectedPlanet.latitude === 0 ? 'Trên hoàng đạo (0°00\')' : selectedPlanet.latitude > 0 ? 'Bắc hoàng đạo' : 'Nam hoàng đạo'}
                    </div>
                  </div>

                  {/* Right Ascension */}
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-purple-300 uppercase font-semibold">
                      Xích Kinh (RA - α)
                    </div>
                    <div className="text-base font-mono font-bold text-white mt-0.5">
                      {selectedPlanet.rightAscension}°
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {Math.floor(selectedPlanet.rightAscension / 15)}h {Math.round(((selectedPlanet.rightAscension / 15) % 1) * 60)}m
                    </div>
                  </div>

                  {/* Declination */}
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="text-[10px] text-emerald-300 uppercase font-semibold">
                      Xích Vĩ (Dec - δ)
                    </div>
                    <div className="text-base font-mono font-bold text-white mt-0.5">
                      {selectedPlanet.declination >= 0 ? `+${selectedPlanet.declination}°` : `${selectedPlanet.declination}°`}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {selectedPlanet.declination >= 0 ? 'Bắc xích đạo' : 'Nam xích đạo'}
                    </div>
                  </div>
                </div>

                {/* Motion speed & Distance */}
                <div className="flex items-center justify-between text-[11px] text-slate-300 p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <span>Vận tốc: <strong className="text-white font-mono">{selectedPlanet.speed}°/ngày</strong></span>
                  <span>Khoảng cách: <strong className="text-amber-300 font-mono">{selectedPlanet.distanceAU} AU</strong></span>
                  <span>Hệ Ngũ Hành: <strong className="text-teal-300">{selectedPlanet.elementVi}</strong></span>
                </div>

                {/* Destiny Significance Interpretation */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/20 text-xs leading-relaxed text-slate-200">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Luận Giải Năng Lượng Bản Mệnh:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedPlanet.destinyMeaning}
                  </p>
                </div>

                {/* Aspects list of selected planet */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                    Góc Chiếu Liên Kết ({selectedPlanetAspects.length}):
                  </span>
                  {selectedPlanetAspects.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Hành tinh không tạo góc chiếu chính với các thiên thể khác.</p>
                  ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {selectedPlanetAspects.map((asp, i) => {
                        const otherPlanetId = asp.planet1 === selectedPlanet.id ? asp.planet2 : asp.planet1;
                        const otherPlanet = chart.bodies.find(b => b.id === otherPlanetId);
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px]"
                          >
                            <span className="flex items-center gap-1.5 text-slate-200">
                              <span style={{ color: asp.color }}>{asp.symbol}</span>
                              <span className="font-medium">{asp.nameVi}</span>
                              <span className="text-slate-400">với</span>
                              <strong className="text-amber-200">{otherPlanet?.nameVi} ({otherPlanet?.glyph})</strong>
                            </span>
                            <span className="font-mono text-slate-400 text-[10px]">
                              Orb: {asp.orb}°
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED PLANETARY EPHEMERIS COORDINATE TABLE */}
      {activeTab === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] uppercase font-mono tracking-wider text-slate-400">
                <th className="py-3 px-3.5">Hành Tinh</th>
                <th className="py-3 px-3.5 text-amber-300">Kinh Độ Hoàng Đạo (λ)</th>
                <th className="py-3 px-3.5 text-cyan-300">Vĩ Độ Hoàng Đạo (β)</th>
                <th className="py-3 px-3.5 text-purple-300">Xích Kinh (α)</th>
                <th className="py-3 px-3.5 text-emerald-300">Xích Vĩ (δ)</th>
                <th className="py-3 px-3.5">Cung Hoàng Đạo</th>
                <th className="py-3 px-3.5">Trạng Thái</th>
                <th className="py-3 px-3.5">Khoảng Cách</th>
                <th className="py-3 px-3.5">Phẩm Vị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {filteredBodies.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => {
                    setSelectedPlanetId(b.id);
                    setActiveTab('radar');
                  }}
                  className={`hover:bg-white/[0.04] transition-colors cursor-pointer ${
                    selectedPlanetId === b.id ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-3.5 flex items-center gap-2 font-sans font-semibold text-white">
                    <span className="text-base" style={{ color: b.color }}>{b.glyph}</span>
                    <span>{b.nameVi}</span>
                  </td>
                  <td className="py-2.5 px-3.5 text-amber-300 font-bold">
                    {b.longitude.toFixed(2)}°
                    <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({b.formattedDMS})</span>
                  </td>
                  <td className="py-2.5 px-3.5 text-cyan-300 font-bold">
                    {b.latitude >= 0 ? `+${b.latitude.toFixed(2)}°` : `${b.latitude.toFixed(2)}°`}
                  </td>
                  <td className="py-2.5 px-3.5 text-purple-300">
                    {b.rightAscension.toFixed(2)}°
                  </td>
                  <td className="py-2.5 px-3.5 text-emerald-300">
                    {b.declination >= 0 ? `+${b.declination.toFixed(2)}°` : `${b.declination.toFixed(2)}°`}
                  </td>
                  <td className="py-2.5 px-3.5 font-sans text-slate-200">
                    {b.formattedSign}
                  </td>
                  <td className="py-2.5 px-3.5">
                    {b.isRetrograde ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Nghịch Hành ℞
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                        Thuận Hành
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-300">
                    {b.distanceAU} AU
                  </td>
                  <td className="py-2.5 px-3.5 font-sans text-slate-300 text-[10px]">
                    {b.dignity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ASPECTS MATRIX & INTERPRETATION */}
      {activeTab === 'aspects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {chart.aspects.map((asp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 hover:border-amber-500/30 transition-all text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ color: asp.color }}>
                      {asp.symbol}
                    </span>
                    <span className="font-semibold text-white">
                      {asp.planet1NameVi} {asp.nameVi} {asp.planet2NameVi}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                    Orb: {asp.orb}°
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Góc chính xác: <strong className="text-slate-200 font-mono">{asp.actualAngle}°</strong></span>
                  <span className={`font-semibold ${asp.nature === 'harmonious' ? 'text-emerald-400' : asp.nature === 'challenging' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {asp.nature === 'harmonious' ? 'Cát Lợi' : asp.nature === 'challenging' ? 'Thử Thách' : 'Đồng Quy'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-white/5">
                  {asp.interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
