import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
  StyleSheet,
  View,
  Text,
  Button,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import notifee from '@notifee/react-native';

const baseUrl = "https://staging.afrik.sportaabe.com";

// Function to get permission for location
const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Geolocation Permission',
        message: 'Can we access your location?',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    console.log('granted', granted);
    if (granted === 'granted') {
      console.log('You can use Geolocation');
      return true;
    } else {
      console.log('You cannot use Geolocation');
      return false;
    }
  } catch (err) {
    return false;
  }
};
const App = () => {
  // state to hold location
  const [location, setLocation] = useState(false);
  // function to check permissions and get Location
  const getLocation = () => {
    const result = requestLocationPermission();
    result.then(res => {
      console.log('res is:', res);
      if (res) {
        Geolocation.getCurrentPosition(
          position => {
            console.log(position);
            setLocation(position);
          },
          error => {
            // See error code charts below.
            console.log(error.code, error.message);
            setLocation(false);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    });
    console.log(location);
  };
  // Function to Send Location to twitter
  const sendLocation = async () => {
    try {
      const url_auth = `${baseUrl}/v1/authentication/send-activation-code`
      const response_auth = await axios.post(url_auth, {
        phone: "+237690112440",
        device_id: "sdsdvvfvsdvsdvsdvsdsdssv",
        app_version: 1
      });
      console.log(response_auth.data);
      const url_login = `${baseUrl}/v1/authentication/start-session`
      const response_login = await axios.post(url_login, {
        phone: "+237690112440",
        code: "12345"
      });
      console.log(response_login.data);
      const token = response_login.data.data.token
      var comp = "test";
      const url_act = `${baseUrl}/v1/instants/?date=2022-01-19T13:20:30+01:00&categoryIds=[]&companyIds=[]&cities=[]&price=all&page=1&limit=1&lat=`+location.coords.latitude+`&lng=`+location.coords.longitude+`&radius=10000000000`;
      const response_act = await axios.get(url_act,{headers: {"Authorization" : `${token}`}});
      console.log(response_act.data.data.data);
      if(response_act.data.data.data.length != 0){
        var k=0;
        for(let i=0; i < response_act.data.data.data.length; i++){
          const index = response_act.data.data.data[i].categoryId;
          const temp = response_act.data.data.data[k].companyId;
          const url_resert = `${baseUrl}/v1/instants/userreservations/`+temp+`?email=kongnuyvictorien@gmail.com`;
          //console.log(url_resert);
          const response_resert = await axios.get(url_resert,{headers: {"Authorization" : `${token}`}});
          console.log(response_resert.data);
          for(let j=0; j < response_resert.data.data.length ; j++){
              if(index == response_resert.data.data[j].categoryId){
                comp = response_resert.data.data[j].activityName
              }
          }
          if(i == response_act.data.data.data.length - 1){
            k=k+1;
            i = -1;
          }
          if(k >= response_act.data.data.data.length - 1){
            break;
          }
        }
      }else{
        comp = "la liste des activités proches est vide"
      }
      //console.log(index);
      //console.log(comp);
      //integration notification
      // Request permissions (required for iOS)
      await notifee.requestPermission()
      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });
      // Display a notification
      await notifee.displayNotification({
        title: 'Activities',
        body: 'Vous avez la possibilité de faire: '+comp,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  setInterval(sendLocation, 86400000);
  return (
    <View style={styles.container}>
      <Text>Welcome!</Text>
      <View
        style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
        <Button title="Get Location" onPress={getLocation} />
      </View>
      <Text>Latitude: {location ? location.coords.latitude : null}</Text>
      <Text>Longitude: {location ? location.coords.longitude : null}</Text>
      <View
        style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
        <Button title="Recommendation" onPress={sendLocation} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default App;