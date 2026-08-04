import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '../src/auth/SessionContext';
import { LoadingView } from '../src/components';

const queryClient = new QueryClient();

function RootNavigator() {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={user?.role === 'guest'}>
        <Stack.Screen name="(guest)" />
      </Stack.Protected>

      <Stack.Protected guard={user?.role === 'tour_guide'}>
        <Stack.Screen name="(guide)" />
      </Stack.Protected>

      <Stack.Protected guard={user?.role === 'renter'}>
        <Stack.Screen name="(renter)" />
      </Stack.Protected>

      <Stack.Protected guard={user?.role === 'admin'}>
        <Stack.Screen name="(admin)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
