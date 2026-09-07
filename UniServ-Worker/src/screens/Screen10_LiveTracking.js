import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useJob } from '../context/JobContext';
import { useWorker } from '../context/WorkerContext';

// ── Utility: S-curve road interpolation fallback ──────────────────────────────
const generateRoadRoutePoints = (oLat, oLng, dLat, dLng, n = 60) => {
  const pts = [];
  const dLt = dLat - oLat;
  const dLn = dLng - oLng;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push({
      lat: oLat + dLt * t + Math.sin(t * Math.PI) * 0.0035,
      lng: oLng + dLn * t + Math.sin(t * 3 * Math.PI) * 0.0015,
    });
  }
  return pts;
};

// ── Utility: bearing angle between two coords ─────────────────────────────────
const calcBearing = (lat1, lng1, lat2, lng2) => {
  const r = Math.PI / 180;
  const φ1 = lat1 * r, φ2 = lat2 * r;
  const Δλ = (lng2 - lng1) * r;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

// ── Utility: extract city/locality from address string ────────────────────────
const parseAddr = (addr) => {
  const parts = (addr || '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    city: parts[parts.length - 1] || 'New Delhi',
    locality: parts.length > 2 ? parts[parts.length - 2] : (parts[0] || 'New Delhi'),
    state: 'Delhi',
  };
};

// ── Determine vehicle emoji from service type ─────────────────────────────────
const vehicleEmoji = (serviceType) => {
  if (['driver', 'caregiver'].includes(serviceType)) return '🚗';
  return '🛵';
};

// ─────────────────────────────────────────────────────────────────────────────
const DURATION_SECS = 20; // animation duration for demo run

export const Screen10_LiveTracking = ({ navigation }) => {
  const { activeJob, updateJobStatus } = useJob();
  const { t } = useWorker();

  // Customer destination from job data
  const destCoords = useMemo(() => ({
    lat: activeJob?.coords?.lat ?? 28.5665,
    lng: activeJob?.coords?.lng ?? 77.2431,
  }), [activeJob]);

  const addrInfo = useMemo(
    () => parseAddr(activeJob?.customerAddress || activeJob?.customerArea || ''),
    [activeJob]
  );

  // Worker origin: live GPS → fallback ~1.5 km offset from customer
  const [originCoords, setOriginCoords] = useState(() => ({
    lat: destCoords.lat + 0.0095,
    lng: destCoords.lng - 0.0115,
  }));

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          // Clamp to within 20 km of customer — prevents sim GPS (e.g. Tamil Nadu) routing to Delhi
          const dLat = Math.abs(latitude - destCoords.lat);
          const dLng = Math.abs(longitude - destCoords.lng);
          const approxKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
          if (approxKm > 20) return; // too far — keep the simulated offset origin
          setOriginCoords({ lat: latitude, lng: longitude });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // ── OSRM real driving route ─────────────────────────────────────────────────
  const [osrmPoints, setOsrmPoints] = useState(null);

  useEffect(() => {
    // The demo route is generated locally on web. It is reliable offline and
    // avoids a third-party OSRM request resetting/flickering the web map.
    if (Platform.OS === 'web') return undefined;
    let cancelled = false;
    (async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}` +
          `?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const raw = data?.routes?.[0]?.geometry?.coordinates;
          if (raw && raw.length > 5 && !cancelled) {
            setOsrmPoints(raw.map(([lng, lat]) => ({ lat, lng })));
          }
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [originCoords, destCoords]);

  const routePoints = useMemo(
    () =>
      osrmPoints && osrmPoints.length > 5
        ? osrmPoints
        : generateRoadRoutePoints(
            originCoords.lat, originCoords.lng,
            destCoords.lat, destCoords.lng, 80
          ),
    [osrmPoints, originCoords, destCoords]
  );

  // ── Animation progress ──────────────────────────────────────────────────────
  const [progress, setProgress] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);
  const [speedKmh, setSpeedKmh] = useState(32);
  const [turnNotice, setTurnNotice] = useState('Acquiring GPS road link...');
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / (DURATION_SECS * 1000), 1.0);
      setProgress(p);

      const base = p > 0.85 ? 14 : p > 0.4 ? 36 : 28;
      setSpeedKmh(Math.max(0, base + Math.floor(Math.sin(elapsed / 800) * 4)));

      if (p < 0.2)       setTurnNotice(`Departed • Moving towards Main Road`);
      else if (p < 0.45) setTurnNotice(`Navigating to ${addrInfo.locality} • Arterial Avenue`);
      else if (p < 0.7)  setTurnNotice(`Approaching ${addrInfo.locality} Junction • 32 km/h`);
      else if (p < 0.9)  setTurnNotice(`Entering street • 150m to customer`);
      else               setTurnNotice(`Arrived at customer in ${addrInfo.city}! 🎉`);

      if (p >= 1.0) {
        clearInterval(id);
        setHasArrived(true);
        setSpeedKmh(0);
      }
    }, 100);
    return () => clearInterval(id);
  }, [addrInfo]);

  // Current vehicle position + bearing
  const currentIdx = Math.min(
    Math.floor(progress * (routePoints.length - 1)),
    routePoints.length - 1
  );
  const currentPt = routePoints[currentIdx] || originCoords;
  const nextPt = routePoints[Math.min(currentIdx + 1, routePoints.length - 1)] || currentPt;
  const bearing = useMemo(
    () => calcBearing(currentPt.lat, currentPt.lng, nextPt.lat, nextPt.lng),
    [currentPt, nextPt]
  );

  const remainingKm = Math.max(0, 1.8 * (1 - progress)).toFixed(1);
  const remainingEta = Math.max(0, Math.ceil(8 * (1 - progress)));
  const emoji = vehicleEmoji(activeJob?.serviceType);

  // ── Map layer state ─────────────────────────────────────────────────────────
  const [mapLayer, setMapLayer] = useState('streets');
  const [zoomLevel, setZoomLevel] = useState(15);
  const iframeRef = useRef(null);

  // ── Leaflet HTML payload (Static template - does not rebuild on every tick) ──
  const mapHtml = useMemo(() => {
    const tileUrl = mapLayer === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileAttr = mapLayer === 'satellite' ? '&copy; Esri' : '&copy; OpenStreetMap';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #e5e7eb; }
    .worker-marker {
      font-size: 24px; text-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transition: transform 0.2s linear;
      display: flex; align-items: center; justify-content: center;
    }
    .dest-pulse {
      width: 22px; height: 22px; border-radius: 50%;
      background: #EF4444; border: 3px solid #fff;
      box-shadow: 0 0 0 4px rgba(239,68,68,0.35);
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
      70% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
      100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }
    .leaflet-control-attribution { font-size: 8px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([${destCoords.lat}, ${destCoords.lng}], 15);
    L.tileLayer('${tileUrl}', { attribution: '${tileAttr}', maxZoom: 19 }).addTo(map);

    // Route polyline
    const routePts = ${JSON.stringify(routePoints.map((p) => [p.lat, p.lng]))};
    const polyline = L.polyline(routePts, {
      color: '#2563EB', weight: 5, opacity: 0.85, dashArray: '8, 6', lineCap: 'round'
    }).addTo(map);
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // Destination marker
    const destIcon = L.divIcon({
      className: '', html: '<div class="dest-pulse"></div>',
      iconSize: [22, 22], iconAnchor: [11, 11]
    });
    L.marker([${destCoords.lat}, ${destCoords.lng}], { icon: destIcon })
      .addTo(map)
      .bindPopup('<b>Customer Destination</b><br>${addrInfo.locality || addrInfo.city}');

    // Worker moving marker
    const workerIcon = L.divIcon({
      className: 'worker-marker',
      html: '<div id="wEmoji" style="transform: rotate(${bearing}deg)">${emoji}</div>',
      iconSize: [30, 30], iconAnchor: [15, 15]
    });
    const workerMarker = L.marker([${originCoords.lat}, ${originCoords.lng}], { icon: workerIcon }).addTo(map);

    // Live update listener
    window.addEventListener('message', (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === 'POS') {
          workerMarker.setLatLng([d.lat, d.lng]);
          const el = document.getElementById('wEmoji');
          if (el) el.style.transform = 'rotate(' + d.bearing + 'deg)';
          if (d.pan) map.panTo([d.lat, d.lng], { animate: true, duration: 0.3 });
        }
      } catch(_) {}
    });
  </script>
</body>
</html>`;
  }, [mapLayer, originCoords, destCoords, routePoints, addrInfo, emoji, bearing]);

  // Post live vehicle position into iframe
  useEffect(() => {
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      const msg = JSON.stringify({
        type: 'POS',
        lat: currentPt.lat,
        lng: currentPt.lng,
        bearing,
        pan: false,
      });
      iframeRef.current.contentWindow.postMessage(msg, '*');
    }
  }, [currentPt, bearing]);

  // Animated progress bar width
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: progress,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleArrived = () => {
    updateJobStatus('arrived');
    navigation.navigate('ActiveJob');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('liveNavigation', 'Live Navigation')}</Text>
        <View style={styles.etaBadge}>
          <Text style={styles.etaText}>{remainingEta} {t('min', 'min')}</Text>
        </View>
      </View>

      {/* ── Turn-by-Turn Navigation Header ── */}
      <View style={styles.navHeader}>
        <View style={[styles.navIconBox, hasArrived && { backgroundColor: colors.success }]}>
          <Ionicons name={hasArrived ? 'checkmark-circle' : 'navigate'} size={18} color="#fff" />
        </View>
        <View style={styles.navTextCol}>
          <Text style={styles.navTurn} numberOfLines={1}>{turnNotice}</Text>
          <View style={styles.navMeta}>
            <Text style={styles.navSpeed}>⚡ {speedKmh} km/h</Text>
            <Text style={styles.navDot}> • </Text>
            <Text style={styles.navCity}>{addrInfo.city}, {addrInfo.state}</Text>
          </View>
        </View>
        {!hasArrived && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => { setProgress(1); setHasArrived(true); setSpeedKmh(0); }}
          >
            <Ionicons name="play-forward" size={13} color={colors.primary} />
            <Text style={styles.skipTxt}>{t('skip', 'Skip')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Map Viewport ── */}
      <View style={styles.mapViewport}>
        {Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef}
            title="Worker Live Navigation"
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
            frameBorder="0"
          />
        ) : (
          /* Native animated visual fallback — no WebView needed */
          <View style={styles.nativeMapBox}>
            <View style={styles.nativeBg}>
              <View style={styles.gridH} />
              <View style={styles.gridV} />
              {/* Destination pin */}
              <View style={styles.destPin}>
                <View style={styles.destPulse} />
                <View style={styles.destBadge}>
                  <Ionicons name="home" size={13} color="#fff" />
                </View>
                <Text style={styles.destLabel}>{addrInfo.locality || addrInfo.city}</Text>
              </View>
              {/* Moving vehicle */}
              <View
                style={[
                  styles.vehicleMarker,
                  {
                    left: `${Math.max(8, Math.min(80, progress * 72 + 8))}%`,
                    top: `${Math.max(20, Math.min(70, Math.sin(progress * Math.PI) * 45 + 22))}%`,
                    transform: [{ rotate: `${bearing}deg` }],
                  },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{emoji}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Layer toggle + Zoom */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={[styles.layerBtn, mapLayer === 'satellite' && styles.layerBtnActive]}
            onPress={() => setMapLayer((l) => (l === 'streets' ? 'satellite' : 'streets'))}
            activeOpacity={0.85}
          >
            <Ionicons
              name={mapLayer === 'satellite' ? 'map' : 'globe-outline'}
              size={13}
              color={mapLayer === 'satellite' ? '#fff' : colors.textPrimary}
            />
            <Text style={[styles.layerTxt, mapLayer === 'satellite' && { color: '#fff' }]}>
              {mapLayer === 'satellite' ? t('street', 'Street') : t('satellite', 'Satellite')}
            </Text>
          </TouchableOpacity>

          <View style={styles.zoomBox}>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setZoomLevel((z) => Math.min(z + 1, 18))}>
              <Ionicons name="add" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setZoomLevel((z) => Math.max(z - 1, 12))}>
              <Ionicons name="remove" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Live GPS pill */}
        <View style={styles.gpsPill}>
          <View style={[styles.gpsDot, hasArrived && { backgroundColor: colors.success }]} />
          <Text style={styles.gpsText}>
            {hasArrived
              ? `${t('arrived', 'ARRIVED').toUpperCase()} · ${addrInfo.city.toUpperCase()}`
              : `LIVE GPS · ${addrInfo.locality || addrInfo.city}, ${addrInfo.state}`}
          </Text>
        </View>

        {/* Distance badge */}
        <View style={styles.distBadge}>
          <Ionicons name="navigate" size={11} color="#fff" />
          <Text style={styles.distText}>{remainingKm} km</Text>
        </View>
      </View>

      {/* ── Telemetry Footer ── */}
      <View style={styles.telemetry}>
        <View style={styles.metCol}>
          <Text style={styles.metLabel}>{t('distance', 'DISTANCE')}</Text>
          <Text style={styles.metVal}>{hasArrived ? '0.0' : remainingKm}<Text style={styles.metUnit}> km</Text></Text>
        </View>
        <View style={styles.metDivider} />
        <View style={styles.metCol}>
          <Text style={styles.metLabel}>{t('liveEta', 'LIVE ETA')}</Text>
          <Text style={[styles.metVal, { color: hasArrived ? colors.success : colors.primary }]}>
            {hasArrived ? '0' : remainingEta}<Text style={styles.metUnit}> min</Text>
          </Text>
        </View>
        <View style={styles.metDivider} />
        <View style={styles.metCol}>
          <Text style={styles.metLabel}>{t('destination', 'DESTINATION')}</Text>
          <Text style={[styles.metVal, { fontSize: 11, color: colors.primary }]} numberOfLines={1}>
            {addrInfo.locality || addrInfo.city}
          </Text>
        </View>
      </View>

      {/* ── Bottom Sheet ── */}
      <View style={styles.bottomSheet}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.jobRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobService}>{activeJob?.service || 'Service Job'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.locationTxt}>
                {activeJob?.customerArea || addrInfo.locality}, New Delhi
              </Text>
            </View>
          </View>
          <View style={styles.etaCard}>
            <Text style={styles.etaMins}>{remainingEta}</Text>
            <Text style={styles.etaMin}>{t('min', 'min')}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.callTxt}>{t('callCustomer', 'Call Customer')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrivedBtn} onPress={handleArrived} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.arrivedTxt}>{t('arrivedDoorstep', "I've Arrived")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  back: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  etaBadge: {
    backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  etaText: { fontSize: 14, fontWeight: '800', color: colors.textInverse },

  // Nav header
  navHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1E293B',
  },
  navIconBox: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  navTextCol: { flex: 1 },
  navTurn: { fontSize: 12, fontWeight: '800', color: '#F8FAFC' },
  navMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  navSpeed: { fontSize: 10, fontWeight: '700', color: '#38BDF8' },
  navDot: { fontSize: 10, color: '#64748B' },
  navCity: { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  skipBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primarySubtle, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: colors.primaryLight, marginLeft: 6,
  },
  skipTxt: { fontSize: 10, fontWeight: '800', color: colors.primary, marginLeft: 3 },

  // Map
  mapViewport: { flex: 1, position: 'relative', backgroundColor: '#E2E8F0' },

  // Native visual fallback
  nativeMapBox: { width: '100%', height: '100%', overflow: 'hidden' },
  nativeBg: { flex: 1, backgroundColor: '#F1F5F9', position: 'relative' },
  gridH: { position: 'absolute', top: '50%', left: 0, right: 0, height: 3, backgroundColor: '#CBD5E1' },
  gridV: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, backgroundColor: '#CBD5E1' },
  destPin: { position: 'absolute', right: 28, top: 36, alignItems: 'center' },
  destPulse: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16,185,129,.25)',
    position: 'absolute', top: -8, left: -8,
  },
  destBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  destLabel: { fontSize: 9, fontWeight: '800', color: '#047857', marginTop: 2 },
  vehicleMarker: { position: 'absolute', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // Map controls
  mapControls: {
    position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  layerBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,.92)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  layerBtnActive: { backgroundColor: '#0F172A', borderColor: '#334155' },
  layerTxt: { fontSize: 10, fontWeight: '800', color: colors.textPrimary, marginLeft: 4 },
  zoomBox: {
    backgroundColor: 'rgba(255,255,255,.92)', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  zoomBtn: { paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center', justifyContent: 'center' },
  zoomDivider: { height: 1, backgroundColor: '#E2E8F0' },

  // GPS pill
  gpsPill: {
    position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,.88)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  gpsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', marginRight: 6 },
  gpsText: { fontSize: 9.5, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },

  // Distance badge
  distBadge: {
    position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 4,
    elevation: 4,
  },
  distText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Telemetry footer
  telemetry: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  metCol: { flex: 1, alignItems: 'center' },
  metLabel: { fontSize: 8.5, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.5 },
  metVal: { fontSize: 15, fontWeight: '900', color: colors.textPrimary, marginTop: 2 },
  metUnit: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },
  metDivider: { width: 1, height: 26, backgroundColor: colors.border },

  // Bottom sheet
  bottomSheet: {
    backgroundColor: colors.surface, paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'android' ? 24 : 20,
    borderTopWidth: 1, borderTopColor: colors.border,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  progressTrack: {
    height: 4, backgroundColor: colors.surfaceTertiary, borderRadius: 2, marginBottom: 14, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  jobRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  jobService: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationTxt: { fontSize: 12, color: colors.textSecondary, marginLeft: 4 },
  etaCard: {
    backgroundColor: colors.primarySubtle, borderRadius: 14, padding: 12, alignItems: 'center', minWidth: 60,
  },
  etaMins: { fontSize: 24, fontWeight: '900', color: colors.primary },
  etaMin: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 12 },
  callBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primarySubtle, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: colors.primary, gap: 8,
  },
  callTxt: { fontSize: 14, fontWeight: '700', color: colors.primary },
  arrivedBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.success, borderRadius: 14, paddingVertical: 14, gap: 8,
  },
  arrivedTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default Screen10_LiveTracking;
