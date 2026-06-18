import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from './src/hooks/useTheme';
import HomeScreen from './src/screens/HomeScreen';
import JourneyScreen from './src/screens/JourneyScreen';
import AlarmScreen from './src/screens/AlarmScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  Journey: {
    destination: { name: string; latitude: number; longitude: number };
    alertMinutes: number;
  };
  Alarm: {
    destinationName: string;
    etaMinutes: number | null;
  };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={theme.background === '#F7F4ED' ? 'dark' : 'light'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Journey" component={JourneyScreen} />
        <Stack.Screen
          name="Alarm"
          component={AlarmScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
