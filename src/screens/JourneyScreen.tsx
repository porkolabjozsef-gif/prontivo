import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, UrlTile, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../hooks/useTheme';
import { calculateETA } from '../utils/eta';
import { haversineDistance } from '../utils/haversine';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Journey'>;

const { height } = Dimensions.get('window');

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

          // Térkép középre igazítása
          mapRef.current?.animateToRegion({
            latitude: current.latitude,
            longitude: current.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 500);

          // Riasztás triggerelése
          if (!alerted && etaMin !== null && etaMin <= alertMinutes) {
            setAlerted(true);
            navigation.navigate('Alarm', {
              destinationName: destination.name,
              etaMinutes: etaMin,
            });
          }
          // Fallback: 500m
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

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    map: { width: '100%', height: height * 0.6 },
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
    distanceText: { fontSize: 14, color: theme.textSecondary, marginTop: 8 },
  });

  return (
    <View style={styles.container}>
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
          <Text style={styles.etaLabel}>Várható érkezés (ETA)</Text>
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
      </View>
    </View>
  );
}
