import { createStackNavigator } from '@react-navigation/stack'; 
import Register from './screens/Register';
import Main from './screens/Main';
import Login from './screens/Login';
import Home from './screens/Home';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Saldo from './screens/Saldo';
import Carona from './screens/Carona';
import Entrega from './screens/Entrega';

import {PasswordRecovery} from './screens/PasswordRecovery';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function Routes(){
    return(
        <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PasswordRecovery" component={PasswordRecovery} />
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
    )
}

function BottomRoutes(){
    return(
        <Tab.Navigator>
            <Tab.Screen name='Saldo' component={Saldo}/>
            <Tab.Screen name='Carona' component={Carona}/>
            <Tab.Screen name='Entrega' component={Entrega}/>
        </Tab.Navigator>
    )
}

export {Routes, BottomRoutes};