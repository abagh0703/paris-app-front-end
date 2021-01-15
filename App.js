import React from 'react';
import { ScrollView } from 'react-native';
// import {
//   Root, Container, Header, Left, Body, Right, Title, Content,
// } from 'native-base';
// import { ThemeProvider } from 'react-native-elements';
import Toast from 'react-native-toast-message';
import ArrowView from './routes/ArrowView';


export default class App extends React.Component {
  render() {
    return (
      <ScrollView>
        <ArrowView />
        {/* <Container> */}
        {/*  <Header> */}
        {/*    <Left /> */}
        {/*    <Body> */}
        {/*      <Title>Paris</Title> */}
        {/*    </Body> */}
        {/*    <Right /> */}
        {/*  </Header> */}
        {/*  <Content padder> */}
        {/*    <ArrowView /> */}
        {/*  </Content> */}
        {/* </Container> */}
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </ScrollView>
    );
  }
}
