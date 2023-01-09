import {getPassword} from './Utils';
import {getApiUrl} from './Variables';
import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View} from 'react-native';
import * as Location from 'expo-location';
import {
    Card,
    CardItem,
    Text
} from 'native-base';
// import Toast from 'react-native-simple-toast';
// import * as Font from 'expo-font';
import {Ionicons} from '@expo/vector-icons';
import Toast from "react-native-toast-message";

export default class Arrow extends React.Component {
    constructor(props) {
        super(props);
        this.checkArrow = this.checkArrow.bind(this);
        let directionsMessage = '';
        const arrowType = this.props.arrowType;
        const dateInPST = new Date(this.props.checkInTime).toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
        const untilDatePST = new Date(this.props.until).toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
        if (arrowType === 'beSomewhere'){
            directionsMessage = `Be at dest at ${dateInPST} ${this.props.dateType}.\nEnds: ${untilDatePST}`
        }
        else if (arrowType === 'leaveSomewhere'){
            directionsMessage = `Don't be at dest at ${dateInPST} ${this.props.dateType}.\nEnds: ${untilDatePST}`
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
            text1: 'Click registered, loading...', position: 'bottom', visibilityTime: 3000
        });
        let coords;
        try {
            // * BEGIN COORDS CODE *
            let location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});
            const { latitude , longitude } = location.coords
            coords = {latitude, longitude};
            // * END COORDS CODE *
        } catch (e) {
            Toast.show({
                text1: 'Error in getting coords: ' + e, position: 'bottom', visibilityTime: 5000
            });
            return;
        }
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
            console.log('in response');
            console.log(responseJson);
            if (responseJson && responseJson.reason) {
                console.log('response json');
                console.log(responseJson.reason);
                let s = responseJson.reason;
                let middle = Math.floor(s.length / 2);
                let before = s.lastIndexOf(' ', middle);
                let after = s.indexOf(' ', middle + 1);

                if (middle - before < after - middle) {
                    middle = before;
                } else {
                    middle = after;
                }
                const s1 = s.substr(0, middle);
                const s2 = s.substr(middle + 1);
                Toast.show({
                    text1: s1, text2: s2, position: 'bottom', visibilityTime: 4000
                });
            } else {
                Toast.show({
                    text1: 'Error', position: 'bottom', visibilityTime: 4000
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
                <Toast ref={(toast) => this.toast = toast}                 style={{backgroundColor:'red'}}
                       position='bottom'
                       positionValue={200} />
            </Card>
        );
    }
}

Arrow.propTypes = {
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    dateType: PropTypes.oneOf(['once', 'daily', 'weekly', 'weekdays']),
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