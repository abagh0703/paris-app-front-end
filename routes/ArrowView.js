/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Content, Text, Button, Left, Toast,
} from 'native-base';
// import { Col, Row, Grid } from 'react-native-easy-grid';
import { getApiUrl } from '../components/Variables';
import Arrow from '../components/Arrow';
import {getCoords} from '../components/Utils';

export default class ArrowView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arrows: [],
      wakeUpTimes: [],
      beAtTimes: [],
    };
  }

  componentDidMount() {
    const wakeUpTimes = [0.25, 0.5, 0.75, 1, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75, 8, 8.25, 8.5, 8.75, 9].map(numHours => (
      <Button key={`${numHours}a`} light large onPress={() => this.createArrowHoursAhead(numHours, 'Current Location')}>
        <Text>
          {numHours}
        </Text>
      </Button>
    ));
    const beAtTimes = [0.25, 0.5, 0.75, 1, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.25, 6.5, 6.75, 7, 7.25, 7.5, 7.75, 8, 8.25, 8.5, 8.75, 9].map(numHours => (
      <Button key={`${numHours}a`} light large onPress={() => this.createArrowHoursAhead(numHours, 'upson')}>
        <Text>
          {numHours}
        </Text>
      </Button>
    ));
    this.setState({ wakeUpTimes, beAtTimes });
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

  createArrowHoursAhead = async(numHoursAhead, location) => {
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
        coords = await getCoords();
      } catch (e) {
        Toast.show({
          text: 'Error in getting coords: ' + e,
          buttonText: 'Okay',
          duration: 5000,
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
    this.createNewQuickArrow(checkIn, lat, long, arrowType);
    Toast.show({
      text: `Arrow for ${numHoursAhead} created.`,
      buttonText: 'Okay',
      duration: 1500,
    });
  }

  convertHoursToMs(hours) {
    return (hours * 60 * 60 * 1000);
  }

  // PHILLIPS 42.445040, -76.479821

  createNewQuickArrow(checkInTime, lat, long, arrowType) {
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
      <Content>
        <Text>Quick-Select Leaving Current Location In:</Text>
        {this.state.wakeUpTimes}
        <Text>Quick-Select Being At A Location In:</Text>
        {this.state.beAtTimes}
        <Text>Arrows</Text>
        {this.state.arrows}
      </Content>
    );
  }
}
