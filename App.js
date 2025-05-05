import * as React from 'react'; 
import { NavigationContainer } from '@react-navigation/native'; 
import {Routes} from './src/routes';
import Home from './src/screens/Home';

export default function App() {
  return (
    <NavigationContainer>
      <Routes/>
    </NavigationContainer>
  );
}
