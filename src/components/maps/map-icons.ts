import L from "leaflet";

/**
 * Custom SVG DivIcons for Leaflet markers.
 * Avoids Webpack/Next.js broken marker image path issues and matches the modern UI styling.
 */

export function createOriginIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: #1853DB;
        color: white;
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(24,83,219,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          font-weight: 700;
          font-size: 11px;
          line-height: 1;
        ">A</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function createDestinationIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: #059669;
        color: white;
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(5,150,105,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          font-weight: 700;
          font-size: 11px;
          line-height: 1;
        ">B</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function createPickerIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: #D97706;
        color: white;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 6px 14px rgba(217,119,6,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}
