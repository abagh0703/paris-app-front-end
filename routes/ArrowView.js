/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { View } from "react-native";
// import Toast from 'react-native-simple-toast';
import { Text, Button } from 'react-native-elements';
// import { Col, Row, Grid } from 'react-native-easy-grid';
import { getApiUrl } from '../components/Variables';
import Arrow from '../components/Arrow';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Toast from 'react-native-toast-message';

export default class ArrowView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arrows: [],
      wakeUpCloseTimes: [],
      wakeUpFarTimes: [],
      beAtTimes: [],
      nearHomeDistance: 45,
      farFromHomeDistance: 300,
      beNearCampusDistance: 250,
    };
  }

  componentDidMount() {
    //[0.25, 0.5, 0.75, 1, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75, 8, 8.25, 8.5, 8.75, 9]
    const wakeUpCloseTimes = [3, 9, 11].map(numHours => (
      <Button key={`${numHours}a`} size={15} onPress={() => this.createArrowHoursAhead(numHours, 'Current Location', this.state.nearHomeDistance)} title={numHours + ''} />
    ));
    //[0.25, 0.5, 1, 7, 7.5, 8, 8.25, 8.5, 8.75, 9]
    const wakeUpFarTimes = [3, 9, 11].map(numHours => (
      <Button key={`${numHours}a`} size={15} onPress={() => this.createArrowHoursAhead(numHours, 'Current Location', this.state.farFromHomeDistance)} title={numHours + ''} />
    ));
    //[0.25, 0.5, 0.75, 1, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75, 8, 8.25, 8.5, 8.75, 9]
    const beAtTimes = [3, 9, 11].map(numHours => (
      <Button key={`${numHours}a`} size={15} onPress={() => this.createArrowHoursAhead(numHours, 'upson', this.state.beNearCampusDistance)} title={numHours + ''} />
    ));
    this.setState({ wakeUpCloseTimes, wakeUpFarTimes, beAtTimes });
    setInterval(() => {
      fetch(`${getApiUrl()}/arrows/`)
        .then(response => response.json())
        .then((arrowsArray) => {
          const arrows = arrowsArray.map(arrowObj => (
            <Arrow
              latitude={arrowObj.latitude}
              longitude={arrowObj.longitude}
              dateType={arrowObj.dateType}
              checkInTime={arrowObj.checkInTime}
              label={arrowObj.label}
              arrowType={arrowObj.arrowType}
              until={arrowObj.until}
              arrowId={arrowObj._id}
              key={arrowObj.latitude + arrowObj.longitude
                            + arrowObj.checkInTime}
            />
          ));
          this.setState({ arrows });
        })
        .catch((error) => {
          console.error(error);
        });
    }, 5000);
  }

  createArrowHoursAhead = async(numHoursAhead, location, distanceOverride) => {
    const currentMsTime = ((new Date()).getTime());
    const numHoursInMs = this.convertHoursToMs(numHoursAhead);
    let lat = 0;
    let long = 0;
    let arrowType = 'leaveSomewhere';
    if (location === 'Current Location') {
      // previously was hardcoded Cornell home, now is current location
      // lat = 42.442136;
      // long = -76.484368;
      let coords;
      try {
        // * BEGIN COORDS CODE *
        await Permissions.askAsync(Permissions.LOCATION);
        let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
        const { latitude , longitude } = location.coords
        coords = {latitude, longitude};
        // * END COORDS CODE *
        // coords = await getCoords();
      } catch (e) {
        Toast.show({
          text1: 'Error in getting coords: ' + e, position: 'bottom', visibilityTime: 5000
        });
        return;
      }
      lat = coords.latitude;
      long = coords.longitude;
    } else if (location === 'upson') {
      lat = 42.445155;
      long = -76.483463;
      arrowType = 'beSomewhere';
    } else {
      return;
    }
    let checkIn = currentMsTime + numHoursInMs;
    // don't round to the nearest half hour if the time is low
    if (numHoursAhead > 1) {
      checkIn = this.roundTimeQuarterHour(checkIn);
      checkIn = checkIn.getTime();
    }
    this.createNewQuickArrow(checkIn, lat, long, arrowType, distanceOverride);
    Toast.show({
      text1: `Arrow for ${numHoursAhead} created.`, position: 'bottom', visibilityTime: 1500
    });
  }

  convertHoursToMs(hours) {
    return (hours * 60 * 60 * 1000);
  }

  // PHILLIPS 42.445040, -76.479821

  createNewQuickArrow(checkInTime, lat, long, arrowType, distanceOverride) {
    let label = 'Don\'t be home';
    if (arrowType === 'beSomewhere') {
      label = 'Be at Upson';
    }
    fetch(`${getApiUrl()}/arrows/`, {
      method: 'post',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: lat,
        longitude: long,
        checkInTime,
        dateType: 'once',
        arrowType,
        label,
        distanceOverride
      }),
    }).then(response => response.json())
      .then((res) => {
        const newArrow = (
          <Arrow
            latitude={res.latitude}
            longitude={res.longitude}
            dateType={res.dateType}
            checkInTime={res.checkInTime}
            label={res.label}
            arrowType={res.arrowType}
            until={res.until}
            arrowId={res._id}
            key={res.latitude + res.longitude
            + res.checkInTime}
          />
        );
        this.setState(prevState => (
          {
            arrows: [...prevState.arrows, newArrow],
          }
        ));
      })
      .catch((error) => {
        console.log('error in creating arrow!');
        console.error(error);
      });
  }

  roundTimeQuarterHour(time) {
    const timeToReturn = new Date(time);
    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
    /**
     * 12 AM --> 7:30
     * 12:01 AM --> 7:30
     * 12:05 AM --> 7:30
     * 12:06 AM --> 7:30
     * 12:08 --> 7:45
     * 12:14 AM --> 8
     * 12:16 AM --> 8
     */
    return timeToReturn;
  }

  render() {
    return (
      <View>
        <Text>You'll go back to sleep if you don't have a far alarm!</Text>
        <Text>(Getting Out of Bed) Be {this.state.nearHomeDistance}M From Current Location In:</Text>
        {this.state.wakeUpCloseTimes}
        <Text>Be within {this.state.beNearCampusDistance}M of Campus In:</Text>
        {this.state.beAtTimes}
        <Text>Be {this.state.farFromHomeDistance} Meters From Current Location In:</Text>
        {this.state.wakeUpFarTimes}
        <Text>Arrows</Text>
        {this.state.arrows}
        {/*<Toast ref={(toast) => this.toast = toast}                 style={{backgroundColor:'red'}}*/}
        {/*       position='top'*/}
        {/*       positionValue={200} />*/}
      </View>
    );
  }
}
