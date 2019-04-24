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
      contextMenuisible: ["collapse", "collapse"],
      coordinates: [0, 0],
      target: {},
      visibleHeads: new Array(6).fill(false),
      dragNDropOrder: [0, 1, 2, 3, 4, 5, 6],
      dragMovingStart: 0,
      dragMovingStop: 0
    };
  }
  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("mouseup", this.handleContextDrop);
    window.addEventListener("click", this.handleClick);
    window.addEventListener("blur", this.hadleBlur);
    window.addEventListener("dragstart", this.handleDragStart);
    window.addEventListener("dragenter", this.handleDragDropMove);
    //window.addEventListener("dragend", this.handleDragDrop);

    this.loadMore();
  }


  handleDragStart = event => {
    if (event.target.tagName === "TH") {
      this.setState({ dragMovingStart: +event.target.getAttribute("number") });
      console.log(this.state.dragMovingStart);
    }
  };

  upduteTableOrders = () => {
    let newOrder = this.state.dragNDropOrder.slice();
    let start = this.state.dragNDropOrder[this.state.dragMovingStart];
    let stop = this.state.dragNDropOrder[this.state.dragMovingStop];
    [newOrder[start],newOrder[stop]]=[newOrder[stop],newOrder[start]];
    this.setState({
      dragNDropOrder: newOrder,
    },()=>this.setState({dragMovingStart:stop})
    );
  };

  handleDragDropMove = event => {
    if (event.target.tagName === "TH") {
      this.setState(
        { dragMovingStop: +event.target.getAttribute("number") },
        () => {
          console.log(this.state.dragMovingStop);
          this.upduteTableOrders();
        }
      );
    }
  };

  hadleBlur = event => {
    if (event.target.tagName === "TD") {
      console.log(event.target.innerHTML, " добавить запись в объект");
      event.target.setAttribute("contentEditable", "false");
    }
  };

  handleContextDrop = event => {
    if (event) {
      if (event.target.tagName === "LABEL" || event.target.tagName === "INPUT")
        return;
    }
    this.setState({
      contextMenuisible: ["collapse", "collapse"]
    });
  };

  handleClick = event => {
    switch (event.target.id) {
      case "delete":
        let deleteIndex = this.state.heroes
          .slice()
          .findIndex(
            item =>
              item.name === this.state.target.parentNode.firstChild.innerHTML
          );
        let filtered = this.state.heroes.slice();
        filtered.splice(deleteIndex, 1);
        this.setState({
          heroes: filtered
        });
        break;
      case "copy":
        let getCopy = this.state.heroes
          .slice()
          .filter(
            item =>
              item.name === this.state.target.parentNode.firstChild.innerHTML
          );
        let newHeroes = this.state.heroes.slice().concat(getCopy);
        this.setState({
          heroes: newHeroes
        });
        break;
      case "change":
        this.state.target.setAttribute("contentEditable", "true");
        this.state.target.focus();
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
    console.log("поправить коорд.появления");
    let newVisibleHeads = this.state.contextMenuisible.slice();
    if (event.target.parentNode.parentNode.tagName === "TBODY") {
      newVisibleHeads.splice(0, 1, "visible");
    }
    if (event.target.parentNode.parentNode.tagName === "THEAD") {
      newVisibleHeads.splice(1, 1, "visible");
    }
    event.preventDefault();
    this.setState({
      coordinates: [event.clientY, event.clientX],
      contextMenuisible: newVisibleHeads,
      target: event.target
    });
  };
  handleVisibleHeads = event => {
    let newVisibleHeads = this.state.visibleHeads.slice();
    newVisibleHeads.splice(
      event.target.id,
      1,
      !newVisibleHeads[event.target.id]
    );
    this.setState({ visibleHeads: newVisibleHeads });
  };
  render() {
    if (this.state.heroes === undefined) {
      return <p>Loading...</p>;
    } else {
      return (
        <>
          <h1>Герои StarWars</h1>
          <table>
            <thead onContextMenu={this.handleContext}>
              <tr>
                <th
                  number="0"
                  style={{ order: this.state.dragNDropOrder[0] }}
                  draggable="true"
                  hidden={this.state.visibleHeads[0]}
                  onClick={this.handleSort}
                  id="name"
                  className="name"
                >
                  name
                </th>
                <th
                  number="1"
                  style={{ order: this.state.dragNDropOrder[1] }}
                  draggable="true"
                  hidden={this.state.visibleHeads[1]}
                  onClick={this.handleSort}
                  id="birth_year"
                  className="birth_year"
                >
                  birth year
                </th>
                <th
                  number="2"
                  style={{ order: this.state.dragNDropOrder[2] }}
                  draggable="true"
                  hidden={this.state.visibleHeads[2]}
                  onClick={this.handleSort}
                  id="eye_color"
                  className="eye_color"
                >
                  eye color
                </th>
                <th
                  number="3"
                  style={{ order: this.state.dragNDropOrder[3] }}
                  draggable="true"
                  hidden={this.state.visibleHeads[3]}
                  onClick={this.handleSort}
                  id="gender"
                  className="gender"
                >
                  gender
                </th>
                <th
                  number="4"
                  style={{ order: this.state.dragNDropOrder[4] }}
                  draggable="true"
                  hidden={this.state.visibleHeads[4]}
                  onClick={this.handleSort}
                  id="hair_color"
                  className="hair_color"
                >
                  hair color
                </th>
                <th
                  number="5"
                  style={{ order: this.state.dragNDropOrder[5] }}
                  draggable="true"
                  hidden={this.state.visibleHeads[5]}
                  onClick={this.handleSort}
                  id="height"
                  className="height"
                >
                  height
                </th>
                <th
                  number="6"
                  style={{ order: this.state.dragNDropOrder[6] }}
                  draggable="true"
                  hidden={this.state.visibleHeads[6]}
                  onClick={this.handleSort}
                  id="skin_color"
                  className="skin_color"
                >
                  skin color
                </th>
              </tr>
            </thead>
            <tbody onContextMenu={this.handleContext} onBlur={this.hadleBlur}>
              {this.state.heroes.sort(this.sorting).map((item, index) => (
                <tr key={index}>
                  <td
                    style={{ order: this.state.dragNDropOrder[0] }}
                    className="name"
                    hidden={this.state.visibleHeads[0]}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{ order: this.state.dragNDropOrder[1] }}
                    className="birth_year"
                    hidden={this.state.visibleHeads[1]}
                  >
                    {item.birth_year}
                  </td>
                  <td
                    style={{ order: this.state.dragNDropOrder[2] }}
                    className="eye_color"
                    hidden={this.state.visibleHeads[2]}
                  >
                    {item.eye_color}
                  </td>
                  <td
                    style={{ order: this.state.dragNDropOrder[3] }}
                    className="gender"
                    hidden={this.state.visibleHeads[3]}
                  >
                    {item.gender}
                  </td>
                  <td
                    style={{ order: this.state.dragNDropOrder[4] }}
                    className="hair_color"
                    hidden={this.state.visibleHeads[4]}
                  >
                    {item.hair_color}
                  </td>
                  <td
                    style={{ order: this.state.dragNDropOrder[5] }}
                    className="height"
                    hidden={this.state.visibleHeads[5]}
                  >
                    {item.height}
                  </td>
                  <td
                    style={{ order: this.state.dragNDropOrder[6] }}
                    className="skin_color"
                    hidden={this.state.visibleHeads[6]}
                  >
                    {item.skin_color}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="context-menu body-context"
            style={{
              visibility: this.state.contextMenuisible[0],
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
          <div
            style={{
              visibility: this.state.contextMenuisible[1],
              top: this.state.coordinates[0],
              left: this.state.coordinates[1]
            }}
            className="context-menu"
          >
            <label className="context-menu-button">
              <input
                onChange={this.handleVisibleHeads}
                checked={!this.state.visibleHeads[0]}
                id="0"
                type="checkbox"
              />
              name
            </label>
            <label className="context-menu-button">
              <input
                onChange={this.handleVisibleHeads}
                checked={!this.state.visibleHeads[1]}
                id="1"
                type="checkbox"
              />
              birth year
            </label>
            <label className="context-menu-button">
              <input
                onChange={this.handleVisibleHeads}
                checked={!this.state.visibleHeads[2]}
                id="2"
                type="checkbox"
              />
              eye color
            </label>
            <label className="context-menu-button">
              <input
                onChange={this.handleVisibleHeads}
                checked={!this.state.visibleHeads[3]}
                id="3"
                type="checkbox"
              />
              gender
            </label>
            <label className="context-menu-button">
              <input
                onChange={this.handleVisibleHeads}
                checked={!this.state.visibleHeads[4]}
                id="4"
                type="checkbox"
              />
              hair color
            </label>
            <label className="context-menu-button">
              <input
                onChange={this.handleVisibleHeads}
                checked={!this.state.visibleHeads[5]}
                id="5"
                type="checkbox"
              />
              height
            </label>
            <label className="context-menu-button">
              <input
                onChange={this.handleVisibleHeads}
                checked={!this.state.visibleHeads[6]}
                id="6"
                type="checkbox"
              />
              skin color
            </label>
          </div>
        </>
      );
    }
  }
}
