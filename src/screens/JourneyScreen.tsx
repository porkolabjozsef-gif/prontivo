import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../hooks/useTheme';
import { calculateETA } from '../utils/eta';
import { haversineDistance } from '../utils/haversine';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { searchStops, getStopDepartures } from '../services/transitland';

type Props = NativeStackScreenProps<RootStackParamList, 'Journey'>;

const { height } = Dimensions.get('window');

interface Departure {
  stopName: string;
  routeName: string;
  scheduledTime: string;
}

export default function JourneyScreen({ route, navigation }: Props) {
  const { destination, alertMinutes } = route.params;
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [alerted, setAlerted] = useState(false);

  // TransitLand - tájékoztató menetrend
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 50,
        },
        (location) => {
          const current = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(current);

          const dist = haversineDistance(current, destination);
          setDistance(dist);

          const etaMin = calculateETA(current, destination, location.coords.speed);
          setEta(etaMin);

          mapRef.current?.animateToRegion({
            latitude: current.latitude,
            longitude: current.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 500);

          // GPS az igazság - a riasztás mindig erre épül
          if (!alerted && etaMin !== null && etaMin <= alertMinutes) {
            setAlerted(true);
            navigation.navigate('Alarm', {
              destinationName: destination.name,
              etaMinutes: etaMin,
            });
          }
          if (!alerted && etaMin === null && dist <= 0.5) {
            setAlerted(true);
            navigation.navigate('Alarm', {
              destinationName: destination.name,
              etaMinutes: null,
            });
          }
        }
      );
    })();

    return () => subscription?.remove();
  }, [alerted]);

  // TransitLand - tájékoztató menetrend lekérése a célállomáshoz
  useEffect(() => {
    (async () => {
      setScheduleLoading(true);
      setScheduleError(false);
      try {
        const stops = await searchStops(destination.name);
        if (stops.length === 0) {
          setScheduleError(true);
          setScheduleLoading(false);
          return;
        }

        const stopTimes = await getStopDepartures(stops[0].onestop_id);

        const parsed: Departure[] = stopTimes.slice(0, 5).map((st: any) => ({
          stopName: st.stop?.stop_name || destination.name,
          routeName: st.trip?.route?.route_short_name || st.trip?.route?.route_long_name || '—',
          scheduledTime: st.departure_time || st.arrival_time || '—',
        }));

        setDepartures(parsed);
      } catch (e) {
        setScheduleError(true);
      }
      setScheduleLoading(false);
    })();
  }, []);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    map: { width: '100%', height: height * 0.45 },
    infoPanel: {
      flex: 1,
      backgroundColor: theme.surface,
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      marginTop: -20,
    },
    destination: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    etaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    etaLabel: { fontSize: 14, color: theme.textSecondary },
    etaValue: { fontSize: 36, fontWeight: 'bold', color: theme.primary },
    etaUnit: { fontSize: 16, color: theme.textSecondary },
    distanceText: { fontSize: 14, color: theme.textSecondary, marginTop: 8, marginBottom: 16 },
    scheduleSection: { marginTop: 8 },
    scheduleSectionTitle: {
      fontSize: 12,
      color: theme.textSecondary,
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    scheduleNote: {
      fontSize: 11,
      color: theme.textSecondary,
      fontStyle: 'italic',
      marginBottom: 12,
    },
    departureRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    departureRoute: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      backgroundColor: theme.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      overflow: 'hidden',
    },
    departureStop: { fontSize: 13, color: theme.textSecondary, flex: 1, marginLeft: 10 },
    departureTime: { fontSize: 14, fontWeight: 'bold', color: theme.text },
    emptyText: { fontSize: 13, color: theme.textSecondary, paddingVertical: 8 },
  });

  return (
    <ScrollView style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Te" pinColor={theme.primary} />
        )}
        <Marker coordinate={destination} title={destination.name} pinColor="#E74C3C" />
        {currentLocation && (
          <Polyline
            coordinates={[currentLocation, destination]}
            strokeColor={theme.primary}
            strokeWidth={2}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      <View style={styles.infoPanel}>
        <Text style={styles.destination}>📍 {destination.name}</Text>
        <View style={styles.etaRow}>
          <Text style={styles.etaLabel}>Várható érkezés (GPS)</Text>
          {eta !== null ? (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text style={styles.etaValue}>{eta}</Text>
              <Text style={styles.etaUnit}>perc</Text>
            </View>
          ) : (
            <Text style={styles.etaValue}>—</Text>
          )}
        </View>
        {distance !== null && (
          <Text style={styles.distanceText}>
            Távolság: {distance < 1
              ? `${Math.round(distance * 1000)} m`
              : `${distance.toFixed(1)} km`}
          </Text>
        )}

        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleSectionTitle}>Menetrend (tájékoztató)</Text>
          <Text style={styles.scheduleNote}>
            A riasztás mindig a GPS pozíció alapján történik — a menetrend csak tájékoztató jellegű.
          </Text>

          {scheduleLoading && <ActivityIndicator color={theme.primary} style={{ marginVertical: 12 }} />}

          {!scheduleLoading && scheduleError && (
            <Text style={styles.emptyText}>Menetrend adat jelenleg nem elérhető ehhez az állomáshoz.</Text>
          )}

          {!scheduleLoading && !scheduleError && departures.length === 0 && (
            <Text style={styles.emptyText}>Nincs elérhető járat adat.</Text>
          )}

          {departures.map((d, i) => (
            <View key={i} style={styles.departureRow}>
              <Text style={styles.departureRoute}>{d.routeName}</Text>
              <Text style={styles.departureStop} numberOfLines={1}>{d.stopName}</Text>
              <Text style={styles.departureTime}>{d.scheduledTime}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
