import { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Vibration, Dimensions, Animated
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '../hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Alarm'>;

const { width } = Dimensions.get('window');
const isDayTime = () => new Date().getHours() >= 6 && new Date().getHours() < 18;

const daySound = require('../../assets/sounds/u_will_shortly_arrived.mp3');
const nightSound = require('../../assets/sounds/night_shift.mp3');

export default function AlarmScreen({ route, navigation }: Props) {
  const { destinationName, etaMinutes } = route.params;
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const player = useAudioPlayer(isDayTime() ? daySound : nightSound);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    player.loop = true;
    player.play();
    Vibration.vibrate([500, 500], true);

    return () => {
      player.pause();
      Vibration.cancel();
    };
  }, []);

  const dismiss = () => {
    player.pause();
    Vibration.cancel();
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.flipBoard,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    label: {
      fontSize: 16,
      color: theme.textSecondary,
      letterSpacing: 4,
      textTransform: 'uppercase',
      marginBottom: 16,
    },
    destination: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.flipText,
      textAlign: 'center',
      marginBottom: 32,
      letterSpacing: 1,
    },
    etaContainer: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingHorizontal: 32,
      paddingVertical: 16,
      marginBottom: 48,
      alignItems: 'center',
    },
    etaLabel: { fontSize: 12, color: '#000', letterSpacing: 2, textTransform: 'uppercase' },
    etaValue: { fontSize: 56, fontWeight: 'bold', color: '#000', lineHeight: 64 },
    etaUnit: { fontSize: 16, color: '#000' },
    dismissButton: {
      width: width * 0.7,
      backgroundColor: theme.flipText,
      borderRadius: 50,
      paddingVertical: 20,
      alignItems: 'center',
    },
    dismissText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.flipBoard,
      letterSpacing: 1,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Közeledik az állomás</Text>
      <Animated.Text style={[styles.destination, { transform: [{ scale: pulseAnim }] }]}>
        {destinationName}
      </Animated.Text>
      <View style={styles.etaContainer}>
        <Text style={styles.etaLabel}>ETA</Text>
        {etaMinutes !== null ? (
          <>
            <Text style={styles.etaValue}>{etaMinutes}</Text>
            <Text style={styles.etaUnit}>perc</Text>
          </>
        ) : (
          <Text style={styles.etaValue}>~1'</Text>
        )}
      </View>
      <TouchableOpacity style={styles.dismissButton} onPress={dismiss}>
        <Text style={styles.dismissText}>ÉRTEM</Text>
      </TouchableOpacity>
    </View>
  );
}
