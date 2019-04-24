import React, { Component } from "react";
import axios from "axios";

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      heroes: [],
      next: "https://api.myjson.com/bins/w4ggo",
      currentSort: "name",
      isLoading: false,
      isReverse: false,
      contextMenuisible: "collapse",
      coordinates: [0, 0],
      target: {}
    };
  }
  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("mouseup", this.handleContextDrop);
    window.addEventListener("click", this.handleClick);
    this.loadMore();
  }

  handleContextDrop = () => {
    this.setState({
      contextMenuisible: "collapse"
    });
  };

  handleClick = event => {
    switch (event.target.id) {
      case "delete":
        let filtered = this.state.heroes.slice().filter(
          item => item.name !== this.state.target.parentNode.firstChild.innerHTML
        );
        this.setState({
          heroes: filtered
        });
        break;
      case "copy":
      let getCopy = this.state.heroes.slice().filter(
        item => item.name === this.state.target.parentNode.firstChild.innerHTML
      );
      let newHeroes= this.state.heroes.slice().concat(getCopy);
      this.setState({
        heroes: newHeroes
      });
        break;
      case "change":
        alert("change");
        break;
        default:
        break;
    }
  };

  handleScroll = () => {
    this.handleContextDrop();
    var scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
    if (
      scrollHeight - document.documentElement.clientHeight - 200 <
      window.scrollY
    ) {
      this.loadMore();
    }
  };

  sorting = (a, b) => {
    let currentSort = this.state.currentSort;
    if (this.state.isReverse) {
      if (a[currentSort] > b[currentSort]) return -1;
      if (a[currentSort] < b[currentSort]) return 1;
    } else {
      if (a[currentSort] < b[currentSort]) return -1;
      if (a[currentSort] > b[currentSort]) return 1;
    }
    return 0;
  };

  loadMore = () => {
    if (!this.state.isLoading && this.state.next) {
      this.setState({ isLoading: true });
      axios.get(this.state.next).then(res => {
        this.setState(prevState => ({
          heroes: prevState.heroes.concat(res.data.results),
          next: res.data.next,
          isLoading: false
        }));
      });
    }
  };

  handleSort = event => {
    if (event.target.id === this.state.currentSort) {
      this.setState(prevState => ({
        isReverse: !prevState.isReverse
      }));
    }
    this.setState({
      currentSort: event.target.id
    });
  };

  handleContext = event => {
    event.preventDefault();
    this.setState({
      coordinates: [event.clientY, event.clientX],
      contextMenuisible: "visible",
      target: event.target
    });
  };

  render() {
    if (this.state.heroes === undefined) {
      return <p>Loading...</p>;
    } else {
      return (
        <>
          <h1>Герои StarWars</h1>
          <table>
            <thead>
              <tr>
                <th onClick={this.handleSort} id="name">
                  name
                </th>
                <th onClick={this.handleSort} id="birth_year">
                  birth year
                </th>
                <th onClick={this.handleSort} id="eye_color">
                  eye color
                </th>
                <th onClick={this.handleSort} id="gender">
                  gender
                </th>
                <th onClick={this.handleSort} id="hair_color">
                  hair color
                </th>
                <th onClick={this.handleSort} id="height">
                  height
                </th>
                <th onClick={this.handleSort} id="skin_color">
                  skin color
                </th>
              </tr>
            </thead>
            <tbody onContextMenu={this.handleContext}>
              {this.state.heroes.sort(this.sorting).map(item => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.birth_year}</td>
                  <td>{item.eye_color}</td>
                  <td>{item.gender}</td>
                  <td>{item.hair_color}</td>
                  <td>{item.height}</td>
                  <td>{item.skin_color}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="context-menu"
            style={{
              visibility: this.state.contextMenuisible,
              top: this.state.coordinates[0],
              left: this.state.coordinates[1]
            }}
          >
            <p id="copy" className="context-menu-button">
              дублировать
            </p>
            <p id="change" className="context-menu-button">
              изменить
            </p>
            <p id="delete" className="context-menu-button">
              удалить
            </p>
          </div>
        </>
      );
    }
  }
}
