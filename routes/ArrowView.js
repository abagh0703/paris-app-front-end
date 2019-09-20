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
    };
  }

  componentDidMount() {
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
    fetch(`${getApiUrl()}/arrows/`, {
      method: 'post',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: DRYDEN_LAT,
        longitude: DRYDEN_LONG,
        checkInTime,
        dateType: 'once',
        arrowType: 'leaveSomewhere',
        label: 'Don\'t be home',
      }),
    }).then(response => response.json())
      .then((res) => {
        this.setState(prevState => (
          {
            arrows: [...prevState.arrows, res],
          }
        ));
      })
      .catch((error) => {
        console.error(error);
      });
  }


  render() {
    return (
      <Content>
        <Text>Quick-Select How Long You Want To Sleep:</Text>
        <Left>
          {[6, 6.25, 6.75, 7, 7.25, 7.75, 8, 8.25, 8.75, 9].map(numHours => (
            <Button light onPress={() => this.createArrowHoursAhead(numHours)}>
              <Text>
                {numHours}
              </Text>
            </Button>
          ))}
        </Left>
        <Text>Arrows</Text>
        {this.state.arrows}
      </Content>
    );
  }
}
