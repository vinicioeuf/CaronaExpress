import { createStackNavigator } from '@react-navigation/stack'; 
import Register from './screens/Register';
import Main from './screens/Main';
import Login from './screens/Login';
import Home from './screens/Home';
import AuthLoading from './screens/AuthLoading';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Saldo from './screens/Saldo';
import Entrega from './screens/Entrega';
import MinhasCorridas from './screens/MinhasCorridas';
import OferecerCorrida from './screens/OferecerCorrida';
import BuscarCorrida from './screens/BuscarCorrida';





import {PasswordRecovery} from './screens/PasswordRecovery';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function Routes(){
    return(
        <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AuthLoading" component={AuthLoading} />
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="MinhasCorridas" component={MinhasCorridas} />
            <Stack.Screen name="OferecerCorrida" component={OferecerCorrida} />
            <Stack.Screen name="BuscarCorrida" component={BuscarCorrida} />
            <Stack.Screen name="Saldo" component={Saldo} />


        </Stack.Navigator>
    )
}

function BottomRoutes(){
    return(
        <Tab.Navigator>
            <Tab.Screen name='Saldo' component={Saldo}/>
            <Tab.Screen name='Entrega' component={Entrega}/>
        </Tab.Navigator>
    )
}

export {Routes, BottomRoutes};