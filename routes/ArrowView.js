/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { Content, Text } from 'native-base';
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
    console.log('getting');
    console.log(`${getApiUrl()}/arrows/`);
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
        this.setState({arrows: arrows});
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <Content>
          {this.state.arrows}
      </Content>
    );
  }
}
