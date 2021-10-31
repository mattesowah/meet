// src/App.js

import React, { Component } from 'react';
import './App.css';
import EventList from './EventList';
import CitySearch from './CitySearch';
import NumberOfEvents from "./NumberOfEvents";
import { getEvents, extractLocations } from './api';
import './nprogress.css';
import Welcomescreen from './Welcomescreen';
import {  checkToken, getAccessToken } from
'./api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,} from 'recharts';



class App extends Component {
  state = {
    events: [],
    locations: [],
    showWelcomeScreen: undefined
    }

    getData = () => {
      const {locations, events} = this.state;
      const data = locations.map((location)=>{
        const number = events.filter((event) => event.location === location).length
        const city = location.split(', ').shift()
        return {city, number};
      })
      return data;
    };

    async componentDidMount() {
          this.mounted = true;
          const accessToken = localStorage.getItem('access_token');
          const isTokenValid = (await checkToken(accessToken)).error ? false :
          true;
          const searchParams = new URLSearchParams(window.location.search);
          const code = searchParams.get("code");
          this.setState({ showWelcomeScreen: !(code || isTokenValid) });
        if ((code || isTokenValid) && this.mounted) {
          getEvents().then((events) => {
        if (this.mounted) {
          this.setState({ events, locations: extractLocations(events) });
         }
      });
    }
  }
      

  componentWillUnmount(){
    this.mounted = false;
  }

  updateEvents = (location) => {
    getEvents().then((events) => {
      const locationEvents = (location === 'all') ?
        events :
        events.filter((event) => event.location === location);
      this.setState({
        events: locationEvents
      });
    });
  }

  
  
  render() {
  const { locations, numberOfEvents } = this.state;
      if (this.state.showWelcomeScreen === undefined) return <div
  className="App" />
    return (
      <div className="App">
        <h1>meet</h1>
        <h4>Choose your nearest city</h4>
        <CitySearch updateEvents={this.updateEvents} locations={locations} />
        <NumberOfEvents
          updateEvents={this.updateEvents}
          numberOfEvents={numberOfEvents}
        />       
         <h4>Events in each city</h4>
        <ResponsiveContainer height={400} >
         <ScatterChart
          margin={{
            top: 20, right: 20, bottom: 20, left: 20,
          }}
        >
            <CartesianGrid />
            <XAxis type="category" dataKey="city" name="city" />
            <YAxis type="number" dataKey="number" name="number of events" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={this.getData()} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
        <EventList events={this.state.events} />
        <Welcomescreen showWelcomeScreen={this.state.showWelcomeScreen}
    getAccessToken={() => { getAccessToken() }} />
    </div>
    );
  }
}

export default App;