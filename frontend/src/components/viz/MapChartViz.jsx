import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { getScheme } from '../../utils/colorSchemes';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export function MapChartViz({ vizConfig, isDark = false }) {
  const scheme = getScheme(vizConfig.color_scheme || 'geo');
  const mapData = vizConfig.map_data || [];
  const [tooltipContent, setTooltipContent] = useState(null);

  const dataMap = {};
  mapData.forEach(d => {
    dataMap[d.country_iso3.toUpperCase()] = d;
  });

  const values = mapData.map(d => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 1);

  const colorScale = scaleLinear()
    .domain([minVal, maxVal])
    .range([scheme.colors[5] + '40', scheme.primary]);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: 320, background: isDark ? 'rgba(10,15,26,0.8)' : '#f8fafc' }}>
      {tooltipContent && (
        <div
          className={`absolute top-3 left-1/2 -translate-x-1/2 rounded-lg px-3 py-1.5 text-xs pointer-events-none z-10 whitespace-nowrap shadow-md ${isDark ? 'glass-strong text-slate-300' : 'bg-white text-slate-700 border border-[#e5e0da]'}`}
        >
          {tooltipContent}
        </div>
      )}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140, center: [10, 20] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const iso3 =
                  geo.properties?.['iso_a3'] ||
                  geo.properties?.['ADM0_A3'] ||
                  geo.properties?.['ISO_A3'] || '';
                const entry = dataMap[iso3.toUpperCase()];
                const fill = entry ? colorScale(entry.value) : (isDark ? '#1e2d4a' : '#e2e8f0');

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={isDark ? '#0a0f1a' : '#ffffff'}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none', transition: 'fill 0.2s' },
                      hover: { outline: 'none', fill: entry ? scheme.secondary : (isDark ? '#263555' : '#cbd5e1'), cursor: entry ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={() => {
                      if (entry) setTooltipContent(entry.tooltip);
                    }}
                    onMouseLeave={() => setTooltipContent(null)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className={`absolute bottom-3 right-3 flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
        <span>{minVal.toLocaleString()}</span>
        <div
          className="w-24 h-2 rounded-full"
          style={{ background: `linear-gradient(to right, ${scheme.colors[5]}40, ${scheme.primary})` }}
        />
        <span>{maxVal.toLocaleString()}</span>
      </div>
    </div>
  );
}
