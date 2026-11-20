import CampusMapBase from './CampusMapBase';
import { getLotLabelLayout } from '../services/lotLabelLayout';
import { isLotUpdating, getMapPolygonColor } from '../services/lotStatus';

// Interactive lot polygon with its code and status labels
function MapLot({ lot, onSelectLot }) {
  const polyColor = getMapPolygonColor(lot);
  const isUpdating = isLotUpdating(lot);
  const { points, label } = lot.coordinates;
  const layout = getLotLabelLayout(lot.coordinates);
  const statusText = isUpdating ? 'Updating...' : `${lot.percentFull}% Full`;
  const codeLength = layout.fitLength(lot.code, layout.codeSize, layout.codeDy);
  const statusLength = layout.fitLength(statusText, layout.statusSize, layout.statusDy);

  return (
    <g className="map-lot-group" onClick={() => onSelectLot(lot)}>
      <polygon
        points={points.map(([px, py]) => `${px},${py}`).join(' ')}
        fill={polyColor}
        fillOpacity="0.42"
        stroke={polyColor}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <g transform={layout.transform}>
        <text
          x={label.x + layout.codeDx}
          y={label.y + layout.codeDy}
          textAnchor={layout.codeAnchor}
          fontSize={layout.codeSize}
          fontWeight="800"
          fill="#f8fafc"
          textLength={codeLength}
          lengthAdjust={codeLength ? 'spacingAndGlyphs' : undefined}
        >
          {lot.code}
        </text>
        <text
          x={label.x + layout.statusDx}
          y={label.y + layout.statusDy}
          textAnchor={layout.statusAnchor}
          fontSize={layout.statusSize}
          fontWeight="600"
          fill="#e2e8f0"
          textLength={statusLength}
          lengthAdjust={statusLength ? 'spacingAndGlyphs' : undefined}
        >
          {statusText}
        </text>
      </g>
    </g>
  );
}

// Right Column: Customized Fresno State Static Parking Map
export default function CampusMap({ lots, onSelectLot }) {
  return (
    <section className="panel map-panel">
      <div className="panel-header">
        <div>
          <h2>Fresno State Campus Parking Map</h2>
          <p className="muted">
            Click any highlighted lot on the map to view hourly and daily occupancy forecasts
          </p>
        </div>
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <span><strong>Permit Legend:</strong></span>
        <span className="legend-item">
          <i className="dot" style={{ background: '#16a34a' }} /> Green Student Permit
        </span>
        <span className="legend-item">
          <i className="dot" style={{ background: '#eab308' }} /> Yellow Staff Permit
        </span>
        <span className="legend-item">
          <i className="dot" style={{ background: '#64748b' }} /> Still Updating
        </span>
      </div>

      {/* Customized Fresno State Campus SVG Map */}
      <div className="static-map-canvas">
        <svg viewBox="0 0 1000 612" preserveAspectRatio="xMidYMid meet" className="campus-svg">
          <rect x="0" y="0" width="1000" height="612" fill="#0b1120" />

          <CampusMapBase />

          {/* Interactive Fresno State Demo Parking Lot Polygons */}
          {lots.map((lot) => {
            if (!lot.coordinates) return null;
            return <MapLot key={lot.id} lot={lot} onSelectLot={onSelectLot} />;
          })}
        </svg>
      </div>
    </section>
  );
}
