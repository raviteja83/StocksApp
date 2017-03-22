import React, { Component } from 'react';
import './App.css';
import moment from 'moment';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      data: {}
    }
  }
  componentWillMount() {
    this.ws = new WebSocket("ws://stocks.mnet.website");
    moment.fn.when = function (a) {
      if (Math.abs(moment().diff(this)) > 5000) { //customise format if greater than  5 secs for testing purpose
        if(Math.abs(moment().diff(this, 'days')) > 1) {
          return moment(this).format('DD MMM hh a'); //format if last updated greater than a day
        }
        return moment(this).format('hh:mm a');//format if last updated greater than  5 sec and same day
      }
      return this.fromNow(a);
    }

    // updateTime called every 5 secs to update relative time and format lastUpdated
    setInterval(() => {
        this.updateTime() 
    },5000);
  }

  componentDidMount() {
    this.ws.onmessage = (event) => {
      let data = JSON.parse(event.data);
      let newData = this.state.data;
      data.forEach(([name, price]) => {
        let time = moment().valueOf();
        if(!newData[name]){
          newData[name] = {
            name: name, 
            price: parseFloat(price).toFixed(2),
            lastUpdated: time, 
            formattedTime: moment(time).when(),
            background: ""
          }
        }else{
          let oldPrice = newData[name].price;
          let diff = price - oldPrice;
          let background = diff === 0 ? "" : diff > 0 ? "price-high" : "price-low";
          newData[name] = {
            name: name, 
            price: parseFloat(price).toFixed(2), 
            lastUpdated: time,
            formattedTime : moment(time).when(),
            background: background
           }
        }
      });
      this.setState({
        data : newData
      })
    }
  }

  /** update lastUpdated relative to current time */
  updateTime() {
    let {data} = this.state;
    let keys = Object.keys(data);
    if(keys.length){
        keys.map((key, i) => {
           data[key].formattedTime = moment(data[key].lastUpdated).when();
           return false;
        });

        this.setState({
          data: data
        })
    }
  }
  
  render() {
    let {data} = this.state;
    let keys = Object.keys(data);
    keys.sort();
    return (
      <div className="container">
        <table className="table-bordered table-striped">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Price</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
        {
          keys.map((key, i) => {
            return (
              <tr key={i}>
                <td>{data[key].name}</td>
                <td>
                  <div>
                    {data[key].price}
                    {
                      data[key].background === "price-high"
                      ?
                      <span className={"glyphicon glyphicon-triangle-top "+(data[key].background)}></span>
                      :
                      data[key].background === "price-low"
                      ?
                      <span className={"glyphicon glyphicon-triangle-bottom "+(data[key].background)}></span>
                      :
                      null
                    } 
                  </div>
                </td>
                <td>{data[key].formattedTime}</td>
              </tr>
            )
          })
        }
        </tbody>
        </table>
      </div>
    );
  }
}

export default App;
