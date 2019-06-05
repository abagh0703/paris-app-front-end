import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Arrow from '../components/Arrow';

export default class ArrowView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            arrows: [
                <Arrow longitude={190525} latitude={1959025} dateType={'weekly'}
                       checkInTime={9062319251}/>,
            ],
        };
    }

    componentDidMount() {
        //TODO replace with your actual url
        fetch('https://mywebsite.com/api/arrows/').
            then((response) => response.json()).
            then((arrowsArray) => {
                //TODO make sure it's an array
                const arrows = arrowsArray.map((arrowObj) => {
                    return <Arrow
                        latitude={arrowObj.latitude}
                        longitude={arrowObj.longitude}
                        dateType={arrowObj.dateType}
                        checkInTime={arrowObj.checkInTime}
                        key={arrowObj.latitude + arrowObj.longitude + arrowObj.checkInTime}
                    />;
                });
                this.setState(arrows);
            }).
            catch((error) => {
                console.error(error);
            });
    }

    render() {
        return this.state.arrows;
    }
}