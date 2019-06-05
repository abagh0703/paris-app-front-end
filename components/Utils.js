// import DeviceInfo from 'react-native-device-info';

export function getPassword() {
    // TODO fix?
    // return DeviceInfo.getUniqueID();
    return "sdf";
}

export function getCoords() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => reject(error.message),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
        );
    });
}