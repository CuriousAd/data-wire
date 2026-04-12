import { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { getScheme } from '../../utils/colorSchemes';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO-3166-1 alpha-3 to numeric mapping (key countries)
// react-simple-maps uses numeric IDs; we match by NAME via properties.name
// For simplicity, we'll match by ISO3 in properties if available, else skip

export function MapChartViz({ vizConfig }) {
  const scheme = getScheme(vizConfig.color_scheme || 'geo');
  const mapData = vizConfig.map_data || [];
  const [tooltipContent, setTooltipContent] = useState(null);

  // Build lookup: ISO3 → value+tooltip
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
    <div className="relative rounded-xl overflow-hidden" style={{ height: 320, background: 'rgba(10,15,26,0.8)' }}>
      {tooltipContent && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 glass-strong rounded-lg px-3 py-1.5 text-xs text-slate-300 pointer-events-none z-10 whitespace-nowrap"
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
                // Try to match by ISO3 if available in properties
                const iso3 =
                  geo.properties?.['iso_a3'] ||
                  geo.properties?.['ADM0_A3'] ||
                  geo.properties?.['ISO_A3'] || '';
                const entry = dataMap[iso3.toUpperCase()];
                const fill = entry ? colorScale(entry.value) : '#1e2d4a';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#0a0f1a"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none', transition: 'fill 0.2s' },
                      hover: { outline: 'none', fill: entry ? scheme.secondary : '#263555', cursor: entry ? 'pointer' : 'default' },
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
      <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-slate-500">
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
