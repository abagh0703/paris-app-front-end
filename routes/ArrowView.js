/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  Content, Text, Button, Left, Toast,
} from 'native-base';
// import { Col, Row, Grid } from 'react-native-easy-grid';
import { getApiUrl } from '../components/Variables';
import Arrow from '../components/Arrow';

export default class ArrowView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arrows: [],
      wakeUpTimes: [],
    };
  }

  componentDidMount() {
    const wakeUpTimes = [0.25, 0.5, .75, 1, 5, 6, 6.25, 6.75, 7, 7.25, 7.75, 8, 8.25, 8.75, 9].map(numHours => (
      <Button key={`${numHours}a`} light large onPress={() => this.createArrowHoursAhead(numHours)}>
        <Text>
          {numHours}
        </Text>
      </Button>
    ));
    this.setState({ wakeUpTimes });
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
    }, 10000);
  }

  createArrowHoursAhead(numHoursAhead) {
    const currentMsTime = ((new Date()).getTime());
    const numHoursInMs = this.convertHoursToMs(numHoursAhead);
    this.createNewBeHomeArrow(currentMsTime + numHoursInMs);
    Toast.show({
      text: `Arrow for ${numHoursAhead} created.`,
      buttonText: 'Okay',
      duration: 1500,
    });
  }

  convertHoursToMs(hours) {
    return (hours * 60 * 60 * 1000);
  }

  createNewBeHomeArrow(checkInTime) {
    const DRYDEN_LAT = 42.442136;
    const DRYDEN_LONG = -76.484368;
    let roundedCheckInTime = this.roundTimeHalfHour(checkInTime);
    roundedCheckInTime = roundedCheckInTime.getTime();
    fetch(`${getApiUrl()}/arrows/`, {
      method: 'post',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: DRYDEN_LAT,
        longitude: DRYDEN_LONG,
        checkInTime: roundedCheckInTime,
        dateType: 'once',
        arrowType: 'leaveSomewhere',
        label: 'Don\'t be home',
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

  roundTimeHalfHour(time) {
    const timeToReturn = new Date(time);
    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 30) * 30);
    return timeToReturn;
  }

  render() {
    return (
      <Content>
        <Text>Quick-Select How Long You Want To Sleep:</Text>
        {this.state.wakeUpTimes}
        <Text>Arrows</Text>
        {this.state.arrows}
      </Content>
    );
  }
}
