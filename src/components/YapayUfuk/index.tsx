import type {ReactNode} from 'react';

/*
 * Yapay ufuk göstergesi (attitude indicator) — klasik analog göstergenin
 * işaretlemeleri: düz uçuş (0° yatış, 0° yunuslama). Site logosuyla aynı çizim.
 * Merkez (100, 100); yunuslama ölçeği 2,5 birim/derece.
 */
const PITCH_SCALE = 2.5;
// Yunuslama merdiveni: 5° ve 15° kısa, 10° ve 20° uzun ve numaralı.
const pitchRungs = [5, 10, 15, 20].flatMap((deg) => [deg, -deg]);
// Yatış skalası: 10° ve 20° kısa, 30° ve 60° uzun çizgi; 45° üçgen.
const bankTicks = [
  {angle: 10, inner: 72.5, width: 1.8},
  {angle: 20, inner: 72.5, width: 1.8},
  {angle: 30, inner: 67.5, width: 2.8},
  {angle: 60, inner: 67.5, width: 2.8},
].flatMap((tick) => [tick, {...tick, angle: -tick.angle}]);
// Çerçeve vidaları: 45° köşegenlerde, vida yarıklarının açıları farklı.
const bezelScrews = [
  {x: 35.12, y: 35.12, slot: 20},
  {x: 164.88, y: 35.12, slot: -25},
  {x: 164.88, y: 164.88, slot: 65},
  {x: 35.12, y: 164.88, slot: 5},
];

type Props = {
  className?: string;
};

export default function YapayUfuk({className}: Props): ReactNode {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false">
      <defs>
        <clipPath id="aiFace">
          <circle cx="100" cy="100" r="82" />
        </clipPath>
        <clipPath id="aiCard">
          <circle cx="100" cy="100" r="66" />
        </clipPath>
        <linearGradient id="aiBezel" x1="100" y1="2" x2="100" y2="198" gradientUnits="userSpaceOnUse">
          <stop stopColor="#454B54" />
          <stop offset="0.5" stopColor="#262A30" />
          <stop offset="1" stopColor="#121417" />
        </linearGradient>
        <linearGradient id="aiLip" x1="100" y1="14" x2="100" y2="186" gradientUnits="userSpaceOnUse">
          <stop stopColor="#07090B" />
          <stop offset="1" stopColor="#30363E" />
        </linearGradient>
        <linearGradient id="aiSky" x1="100" y1="34" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A7BCF" />
          <stop offset="1" stopColor="#3D93E2" />
        </linearGradient>
        <linearGradient id="aiGround" x1="100" y1="100" x2="100" y2="166" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93602F" />
          <stop offset="1" stopColor="#6A421F" />
        </linearGradient>
        <linearGradient id="aiBar" x1="0" y1="98" x2="0" y2="102" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD978" />
          <stop offset="1" stopColor="#E9A832" />
        </linearGradient>
        <radialGradient id="aiScrew" cx="0.38" cy="0.32" r="0.8">
          <stop stopColor="#6A717B" />
          <stop offset="1" stopColor="#1A1D21" />
        </radialGradient>
        <radialGradient id="aiVignette" cx="100" cy="100" r="82" gradientUnits="userSpaceOnUse">
          <stop offset="0.82" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
        <linearGradient id="aiGlare" x1="100" y1="18" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="aiShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.3" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Gösterge gövdesi: çerçeve (bezel), iç dudak ve vidalar */}
      <circle cx="100" cy="100" r="98" fill="url(#aiBezel)" />
      <circle cx="100" cy="100" r="97.2" stroke="#fff" strokeOpacity="0.1" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="85.5" fill="url(#aiLip)" />
      {bezelScrews.map(({x, y, slot}) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${slot})`}>
          <circle r="4.2" fill="url(#aiScrew)" stroke="#0A0B0D" strokeWidth="0.8" />
          <path d="M-2.6 0 H2.6 M0 -2.6 V2.6" stroke="#0A0B0D" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      ))}

      <g clipPath="url(#aiFace)">
        {/* Yatış halkası: üst yarı gökyüzü, alt yarı yer */}
        <rect width="200" height="100" fill="#1B5AA6" />
        <rect y="100" width="200" height="100" fill="#583619" />

        {/* Ufuk kartı ve yunuslama merdiveni */}
        <g clipPath="url(#aiCard)">
          <rect width="200" height="100" fill="url(#aiSky)" />
          <rect y="100" width="200" height="100" fill="url(#aiGround)" />
          {pitchRungs.map((deg) => {
            const y = 100 - deg * PITCH_SCALE;
            const major = deg % 10 === 0;
            const half = major ? 17 : 8.5;
            return (
              <g key={deg}>
                <path
                  d={`M${100 - half} ${y} H${100 + half}`}
                  stroke="#F4F8FC"
                  strokeWidth={major ? 1.6 : 1.3}
                  strokeLinecap="round"
                />
                {major &&
                  [75, 125].map((x) => (
                    <text
                      key={x}
                      x={x}
                      y={y}
                      fill="#F4F8FC"
                      fontSize="8"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="central">
                      {Math.abs(deg)}
                    </text>
                  ))}
              </g>
            );
          })}
        </g>
        <circle cx="100" cy="100" r="66" stroke="#000" strokeOpacity="0.3" strokeWidth="1.2" />

        {/* Ufuk çizgisi */}
        <path d="M0 100 H200" stroke="#F4F8FC" strokeWidth="2.2" />

        {/* Yatış skalası */}
        {bankTicks.map(({angle, inner, width}) => (
          <path
            key={angle}
            d={`M100 ${100 - inner} V19`}
            transform={`rotate(${angle} 100 100)`}
            stroke="#F4F8FC"
            strokeWidth={width}
          />
        ))}
        {[45, -45].map((angle) => (
          <path key={angle} d="M97.2 19.5 H102.8 L100 26 Z" transform={`rotate(${angle} 100 100)`} fill="#F4F8FC" />
        ))}

        {/* Kenar gölgesi ve cam yansıması */}
        <circle cx="100" cy="100" r="82" fill="url(#aiVignette)" />
        <path d="M18 100 A82 82 0 0 1 182 100 Z" fill="url(#aiGlare)" />
      </g>

      {/* Sabit semboller: yatış göstergesi üçgeni, ufuk referans çubukları, minyatür uçak */}
      <g filter="url(#aiShadow)">
        <path d="M94 18.5 H106 L100 32 Z" fill="#F4F8FC" />
        <rect x="49" y="98.2" width="29" height="3.6" rx="0.9" fill="url(#aiBar)" stroke="#1E1404" strokeWidth="0.8" />
        <rect x="122" y="98.2" width="29" height="3.6" rx="0.9" fill="url(#aiBar)" stroke="#1E1404" strokeWidth="0.8" />
        <path d="M78 100 L95 98.4 H105 L122 100 L105 101.6 H95 Z" fill="#FFFFFF" />
        <rect x="98.9" y="90" width="2.2" height="10" rx="1.1" fill="#FFFFFF" />
        <path d="M96.6 101.5 L100 110 L103.4 101.5 Z" fill="#FFFFFF" />
        <circle cx="100" cy="100" r="4.4" fill="#FFFFFF" />
      </g>
      <circle cx="100" cy="100" r="82" stroke="#05070A" strokeWidth="1.6" />
    </svg>
  );
}
