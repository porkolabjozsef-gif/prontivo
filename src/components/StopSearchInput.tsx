import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useTheme } from '../hooks/useTheme';

export interface PlaceResult {
  name: string;
  latitude: number;
  longitude: number;
  display_name: string;
}

interface Props {
  label: string;
  placeholder: string;
  onSelect: (place: PlaceResult) => void;
  selected: PlaceResult | null;
}

export default function StopSearchInput({ label, placeholder, onSelect, selected }: Props) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const search = async (text: string) => {
    setQuery(text);
    if (text.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: text, format: 'json', limit: 6, addressdetails: 1 },
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

  const select = (item: PlaceResult) => {
    onSelect(item);
    setQuery(item.name);
    setResults([]);
    setFocused(false);
  };

  const styles = StyleSheet.create({
    container: { marginBottom: 4 },
    label: {
      fontSize: 12, color: theme.textSecondary,
      letterSpacing: 1.5, textTransform: 'uppercase',
      marginBottom: 6, marginLeft: 4,
    },
    searchBox: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12, borderWidth: 1.5,
      borderColor: selected ? theme.primary : theme.border,
      paddingHorizontal: 16,
    },
    input: { flex: 1, height: 50, color: theme.text, fontSize: 16 },
    checkmark: { fontSize: 18, color: theme.primary },
    resultsBox: {
      backgroundColor: theme.surface,
      borderRadius: 12, borderWidth: 1,
      borderColor: theme.border,
      marginTop: 4, maxHeight: 220,
    },
    resultItem: {
      padding: 14,
      borderBottomWidth: 1, borderBottomColor: theme.border,
    },
    resultName: { fontSize: 15, fontWeight: '600', color: theme.text },
    resultDetail: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={search}
          onFocus={() => setFocused(true)}
        />
        {loading && <ActivityIndicator color={theme.primary} size="small" />}
        {selected && !loading && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {focused && results.length > 0 && (
        <View style={styles.resultsBox}>
          <FlatList
            data={results}
            keyExtractor={(_, i) => i.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => select(item)}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultDetail} numberOfLines={1}>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}
