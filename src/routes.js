import { createStackNavigator } from '@react-navigation/stack'; 
import Register from './screens/Register';
import Main from './screens/Main';
import Login from './screens/Login';
import Home from './screens/Home';


const Stack = createStackNavigator();

function Routes(){
    return(
        <Stack.Navigator initialRouteName="Main">
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
    )
}

export default Routes;