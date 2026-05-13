// App.js
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';

const Stack = createNativeStackNavigator();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000',     // high-contrast default
    text: '#fff',
    primary: '#FFD700'      // MTN-inspired yellow for key actions
  }
};

export default function App() {
  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
