import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface LatLng {
  latitude: number;
  longitude: number;
}

interface Props {
  initialRegion: LatLng;
  destination: LatLng & { name: string };
  isDark: boolean;
}

export interface LeafletMapHandle {
  updatePosition: (current: LatLng) => void;
}

const buildHtml = (center: LatLng, destination: LatLng & { name: string }, isDark: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: ${isDark ? '#0A0E1A' : '#F7F4ED'}; }
    .leaflet-control-attribution { font-size: 9px; ${isDark ? 'background: rgba(10,14,26,0.7); color: #888;' : ''} }
    .user-dot {
      width: 16px; height: 16px; border-radius: 50%;
      background: #F5A623; border: 3px solid #fff;
      box-shadow: 0 0 0 4px rgba(245,166,35,0.3);
    }
    .dest-pin {
      width: 14px; height: 14px; border-radius: 50%;
      background: #E74C3C; border: 3px solid #fff;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { zoomControl: false, attributionControl: true })
      .setView([${center.latitude}, ${center.longitude}], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const destIcon = L.divIcon({ className: 'dest-pin', iconSize: [14, 14] });
    L.marker([${destination.latitude}, ${destination.longitude}], { icon: destIcon })
      .addTo(map)
      .bindPopup(${JSON.stringify(destination.name)});

    const userIcon = L.divIcon({ className: 'user-dot', iconSize: [16, 16] });
    let userMarker = null;
    let routeLine = null;

    window.updatePosition = function(lat, lng) {
      const pos = [lat, lng];
      if (!userMarker) {
        userMarker = L.marker(pos, { icon: userIcon }).addTo(map);
      } else {
        userMarker.setLatLng(pos);
      }

      if (routeLine) map.removeLayer(routeLine);
      routeLine = L.polyline([pos, [${destination.latitude}, ${destination.longitude}]], {
        color: '#F5A623', weight: 2, dashArray: '8, 6'
      }).addTo(map);

      map.setView(pos, map.getZoom(), { animate: true });
    };

    true;
  </script>
</body>
</html>
`;

const LeafletMap = forwardRef<LeafletMapHandle, Props>(
  ({ initialRegion, destination, isDark }, ref) => {
    const webviewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      updatePosition: (current: LatLng) => {
        webviewRef.current?.injectJavaScript(
          `window.updatePosition(${current.latitude}, ${current.longitude}); true;`
        );
      },
    }));

    return (
      <WebView
        ref={webviewRef}
        style={styles.webview}
        source={{ html: buildHtml(initialRegion, destination, isDark) }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
      />
    );
  }
);

export default LeafletMap;

const styles = StyleSheet.create({
  webview: { flex: 1 },
});
