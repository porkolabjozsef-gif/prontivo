import { Component, ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Props { children: ReactNode; }
interface State { error: Error | null; errorInfo: string | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ errorInfo: errorInfo?.componentStack || '' });
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={styles.title}>⚠️ Hiba történt</Text>
          <Text style={styles.message}>{this.state.error.toString()}</Text>
          <Text style={styles.stack}>{this.state.error.stack}</Text>
          {this.state.errorInfo && (
            <>
              <Text style={styles.title}>Component Stack:</Text>
              <Text style={styles.stack}>{this.state.errorInfo}</Text>
            </>
          )}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000' },
  title: { color: '#ff6b6b', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  message: { color: '#fff', fontSize: 14, marginBottom: 16 },
  stack: { color: '#aaa', fontSize: 11, fontFamily: 'monospace' },
});
