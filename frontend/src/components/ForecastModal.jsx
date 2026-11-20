import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { getOccupancyColor } from '../services/lotStatus';

// Occupancy Forecast Modal
// Stays mounted while closed (lot = null) so the chosen interval is remembered.
export default function ForecastModal({ lot, onClose }) {
  const [forecastInterval, setForecastInterval] = useState('hourly');

  if (!lot) return null;

  return (
    <Modal
      title={`Occupancy Forecast: ${lot.name}`}
      subtitle={lot.permitColorName ?? ''}
      onClose={onClose}
    >
      <div className="interval-tabs">
        <button
          className={`chip ${forecastInterval === 'hourly' ? 'active' : ''}`}
          onClick={() => setForecastInterval('hourly')}
        >
          Hourly Interval
        </button>
        <button
          className={`chip ${forecastInterval === 'daily' ? 'active' : ''}`}
          onClick={() => setForecastInterval('daily')}
        >
          Daily Interval
        </button>
      </div>

      {!lot.hasForecastData ? (
        <div className="empty-forecast">
          <AlertTriangle size={32} color="#eab308" />
          <p>
            <strong>Forecast Unavailable:</strong> Insufficient historical parking trend data for {lot.name}.
          </p>
        </div>
      ) : (
        <div className="forecast-list">
          {lot.forecasts[forecastInterval].map((item, idx) => (
            <div key={idx} className="forecast-row">
              <span>{item.label}</span>
              <div className="forecast-bar-wrap">
                <div
                  className="forecast-bar"
                  style={{
                    width: `${item.pctFull}%`,
                    backgroundColor: getOccupancyColor(item.pctFull)
                  }}
                />
              </div>
              <strong>{item.pctFull}% Full</strong>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
