
import { getLotHeatZone } from '../services/lotHeatZone';

export default function LotHeatZone({ lot }) {
  const heat = getLotHeatZone(lot);

  return (
    <div className="lot-heat-zone">
      <svg viewBox="0 0 220 220" width="220">
        {[100, 78, 55, 32].map((radius, index) => (
          <circle
            key={radius}
            cx="110"
            cy="110"
            r={radius}
            fill={heat.color}
            fillOpacity={0.08 + index * 0.12}
            stroke={heat.color}
            strokeOpacity={0.5}
          />
        ))}

        <text
          x="110"
          y="115"
          textAnchor="middle"
          fill="currentColor"
          fontSize="20"
          fontWeight="bold"
        >
          {heat.percentage === null
            ? 'N/A'
            : `${heat.percentage}%`}
        </text>
      </svg>

      <h3>{lot.lot_name ?? lot.name}</h3>
      <p>{heat.level} Occupancy</p>
    </div>
  );
}
