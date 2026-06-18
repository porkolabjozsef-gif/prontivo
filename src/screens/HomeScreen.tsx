import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import axios from 'axios';
import { DEFAULT_ALERT_MINUTES } from '../constants/config';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface SearchResult {
  name: string;
  latitude: number;
  longitude: number;
  display_name: string;
}

export default function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (text: string) => {
    setQuery(text);
    if (text.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: text, format: 'json', limit: 8, addressdetails: 1 },
        headers: { 'User-Agent': 'Prontivo/1.0' },
      });
      setResults(response.data.map((item: any) => ({
        name: item.name || item.display_name.split(',')[0],
        display_name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      })));
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  };

  const selectDestination = (item: SearchResult) => {
    navigation.navigate('Journey', {
      destination: {
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
      },
      alertMinutes: DEFAULT_ALERT_MINUTES,
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.primary, marginBottom: 4 },
    subtitle: { fontSize: 14, color: theme.textSecondary },
    searchBox: {
      margin: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
    },
    input: { flex: 1, height: 48, color: theme.text, fontSize: 16 },
    resultItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface,
      marginHorizontal: 16,
    },
    resultName: { fontSize: 16, fontWeight: '600', color: theme.text },
    resultDetail: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Prontivo</Text>
        <Text style={styles.subtitle}>Hová utazol ma?</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Célállomás keresése..."
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={search}
          autoFocus
        />
        {loading && <ActivityIndicator color={theme.primary} />}
      </View>

      <FlatList
        data={results}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => selectDestination(item)}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultDetail} numberOfLines={1}>{item.display_name}</Text>
          </TouchableOpacity>
        )}
      />
    </KeyboardAvoidingView>
  );
}
