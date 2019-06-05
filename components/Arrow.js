import {getPassword, getCoords} from './Utils';
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
import {Font} from 'expo';
import {Ionicons} from '@expo/vector-icons';

export default class Arrow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {shouldShow: true};
        this.checkArrow = this.checkArrow.bind(this);
    }

    async componentDidMount() {
        await Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
            ...Ionicons.font,
        });
    }

    checkArrow = async (arrowId) => {
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
        console.log(getPassword());
        //TODO change to your website
        fetch('https://mywebsite.com/api/arrows/' + arrowId, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: getPassword(),
                latitude: coords.latitude,
                longitude: coords.longitude,
            }),
        }).then((response) => response.json()).then((responseJson) => {
            if (responseJson.status === 200) {
                Toast.show({
                    text: 'Checked in today! ' + responseJson.message,
                    buttonText: 'Okay',
                    duration: 3000,
                });
                this.setState({
                    shouldShow: false,
                });
            } else {
                Toast.show({
                    text: 'Not 200: ' + responseJson.message,
                    buttonText: 'Okay',
                    duration: 3000,
                });
            }
        }).catch((error) => {
            console.log('Error!');
            console.log(error);
            /**
            error.text().then(errorMessage => {
                Toast.show({
                    text: 'Error: ' + errorMessage,
                    buttonText: 'Okay',
                    duration: 5000,
                });
            });
             */
        });
    };

    render() {
        return (
            <Card style={this.state.shouldShow ?
                styles.showCard :
                styles.hideCard}>
                <CardItem button onPress={this.checkArrow}>
                    <Text>Be at {this.props.latitude},{this.props.longitude}
                        by {this.props.checkInTime} {this.props.dateType} </Text>
                </CardItem>
            </Card>
        );
    }
}

Arrow.propTypes = {
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    dateType: PropTypes.string,
    checkInTime: PropTypes.number,
};

const styles = StyleSheet.create({
    showCard: {},
    hideCard: {
        display: 'none',
    },
});