import React from 'react';
import {Container, Header, Left, Body, Right, Title, Content} from 'native-base';
import ArrowView from './routes/ArrowView';

export default class App extends React.Component {
    render() {
        return (
            <Container>
                <Header>
                    <Left/>
                    <Body>
                    <Title>Paris</Title>
                    </Body>
                    <Right/>
                </Header>
                <Content padder>
                    <ArrowView/>
                </Content>
            </Container>
        );
    }
}