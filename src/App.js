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
  }

  componentDidMount() {
    this.ws.onmessage = (event) =>{
      let data = JSON.parse(event.data);
      let newData = this.state.data;
      data.forEach(([name, price]) => {
        if(!newData[name]){
          newData[name] = {
            name: name, 
            price: parseFloat(price).toFixed(2), 
            lastUpdated: moment(),
            background: "price-first"
          }
        }else{
          let oldPrice = newData[name].price;
          let diff = price - oldPrice;
          let background = "";
          if(diff > 0) {
            background = "price-high";
          } else if(diff === 0) {
            background = "price-first";
          } else {
            background = "price-low";
          }
          newData[name] = {
            name: name, 
            price: parseFloat(price).toFixed(2), 
            lastUpdated: moment(),
            background: background
           }
        }
      });
      this.setState({
        data : newData
      })
    }
  }
  
  render() {
    let {data} = this.state;
    let keys = Object.keys(data);
    return (
      <div className="container">
        <table className="table-bordered">
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
                      <span className={"glyphicon glyphicon-arrow-up "+(data[key].background)}></span>
                      :
                      data[key].background === "price-low"
                      ?
                      <span className={"glyphicon glyphicon-arrow-down "+(data[key].background)}></span>
                      :
                      null
                    } 
                  </div>
                </td>
                <td>{moment(data[key].lastUpdated).startOf('minute').fromNow()}</td>
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
