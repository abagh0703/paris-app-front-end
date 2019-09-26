import {getPassword, getCoords} from './Utils';
import {getApiUrl} from './Variables';
import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';
import {
    Card,
    CardItem,
    Text,
    Body,
    Toast,
} from 'native-base';
// import * as Font from 'expo-font';
import {Ionicons} from '@expo/vector-icons';

export default class Arrow extends React.Component {
    constructor(props) {
        super(props);
        this.checkArrow = this.checkArrow.bind(this);
        let directionsMessage = '';
        const arrowType = this.props.arrowType;
        const dateInEST = new Date(this.props.checkInTime).toLocaleString("en-US", {timeZone: "America/New_York"});
        const untilDateEST = new Date(this.props.until).toLocaleString("en-US", {timeZone: "America/New_York"});
        if (arrowType === 'beSomewhere'){
            directionsMessage = `Be at dest at ${dateInEST} ${this.props.dateType}.\nEnds: ${untilDateEST}`
        }
        else if (arrowType === 'leaveSomewhere'){
            directionsMessage = `Don't be at dest at ${dateInEST} ${this.props.dateType}.\nEnds: ${untilDateEST}`
        }
        else {
            directionsMessage = `${arrowType} is an unsupported arrow type`;
        }
        this.state = {shouldShow: true, 'directionsMessage': directionsMessage};
    }

    async componentDidMount() {
        // await Font.loadAsync({
        //     'Roboto': require('native-base/Fonts/Roboto.ttf'),
        //     'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        //     ...Ionicons.font,
        // });
    }

    checkArrow = async (arrowId) => {
        Toast.show({
            text: 'Click registered, loading...',
            buttonText: 'Okay',
            duration: 3000,
        });
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
        console.log('coords');
        console.log(coords);
        const password = getPassword();
        fetch(`${getApiUrl()}/arrows/` + this.props.arrowId, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                checkInPassword: password,
                latitude: coords.latitude,
                longitude: coords.longitude,
            }),
        }).then((response) => response.json()).then((responseJson) => {
            console.log('in respons');
            console.log(responseJson);
            if (responseJson && responseJson.reason) {
                console.log('response json');
                console.log(responseJson.reason);
                Toast.show({
                    text: responseJson.reason,
                    buttonText: 'Okay',
                    duration: 4000,
                });
            } else {
                Toast.show({
                    text: 'Error',
                    buttonText: 'Okay',
                    duration: 4000,
                });
            }
        }).catch((error) => {
            console.log('Error in attempting DELETE /arrows!');
            console.log(error);
        });
    };

    render() {
        return (
            <Card>
                <CardItem button onPress={this.checkArrow}>
                    <Text>
                        {this.props.label}
                        {'\n'}
                        {this.state.directionsMessage}
                        {'\n\n'}
                        {'Dest: ' + this.props.latitude + ', ' + this.props.longitude}
                    </Text>
                </CardItem>
            </Card>
        );
    }
}

Arrow.propTypes = {
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    dateType: PropTypes.oneOf(['once', 'daily', 'weekly']),
    checkInTime: PropTypes.number,
    label: PropTypes.string,
    arrowType: PropTypes.string,
    until: PropTypes.number,
    arrowId: PropTypes.string,
};

const styles = StyleSheet.create({
    // showCard: {},
    // hideCard: {
    //     display: 'none',
    // },
});