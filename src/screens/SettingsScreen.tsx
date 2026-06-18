import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import {
  DEFAULT_ALERT_MINUTES,
  MIN_ALERT_MINUTES,
  MAX_ALERT_MINUTES
} from '../constants/config';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const [alertMinutes, setAlertMinutes] = useState(DEFAULT_ALERT_MINUTES);
  const [vibration, setVibration] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('prontivo_alert_minutes');
      if (saved) setAlertMinutes(parseInt(saved));
      const vib = await AsyncStorage.getItem('prontivo_vibration');
      if (vib !== null) setVibration(vib === 'true');
    })();
  }, []);

  const saveAlertMinutes = async (val: number) => {
    setAlertMinutes(val);
    await AsyncStorage.setItem('prontivo_alert_minutes', val.toString());
  };

  const saveVibration = async (val: boolean) => {
    setVibration(val);
    await AsyncStorage.setItem('prontivo_vibration', val.toString());
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16,
      borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    backBtn: { marginRight: 16 },
    backText: { fontSize: 24, color: theme.primary },
    title: { fontSize: 22, fontWeight: 'bold', color: theme.text },
    section: { margin: 16 },
    sectionTitle: {
      fontSize: 12, color: theme.textSecondary,
      letterSpacing: 2, textTransform: 'uppercase',
      marginBottom: 8, marginLeft: 4,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    rowLast: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    rowLabel: { fontSize: 16, color: theme.text },
    rowValue: { fontSize: 16, color: theme.primary, fontWeight: 'bold' },
    minuteControl: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    minuteBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: theme.primary,
      justifyContent: 'center', alignItems: 'center',
    },
    minuteBtnText: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    minuteValue: { fontSize: 20, fontWeight: 'bold', color: theme.text, minWidth: 32, textAlign: 'center' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Beállítások</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Riasztás</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Figyelmeztetés</Text>
            <View style={styles.minuteControl}>
              <TouchableOpacity
                style={styles.minuteBtn}
                onPress={() => alertMinutes > MIN_ALERT_MINUTES && saveAlertMinutes(alertMinutes - 1)}
              >
                <Text style={styles.minuteBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.minuteValue}>{alertMinutes}'</Text>
              <TouchableOpacity
                style={styles.minuteBtn}
                onPress={() => alertMinutes < MAX_ALERT_MINUTES && saveAlertMinutes(alertMinutes + 1)}
              >
                <Text style={styles.minuteBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.rowLast}>
            <Text style={styles.rowLabel}>Rezgés</Text>
            <Switch
              value={vibration}
              onValueChange={saveVibration}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.surface}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Névjegy</Text>
        <View style={styles.card}>
          <View style={styles.rowLast}>
            <Text style={styles.rowLabel}>Verzió</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
