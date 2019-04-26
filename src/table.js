import React, { Component } from "react";
import axios from "axios";

const heads = [
  "name",
  "gender",
  "birth_year",
  "skin_color",
  "hair_color",
  "eye_color"
];

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
      dragNDropOrder: [0, 1, 2, 3, 4, 5],
      dragMovingStart: [],
      dragMovingStop: [],
      isCorrectDrag: true,
      targets: []
    };
  }
  componentDidMount() {
    this.loadMore();
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("mouseup", this.handleContextDrop);
    window.addEventListener("click", this.handleClick);
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("dragstart", this.handleDragStart);
    window.addEventListener("dragenter", this.handleDragDropMove);
    window.addEventListener("dragend", this.handleDragDrop);
    window.addEventListener("keypress", this.handleSumbit);
    window.addEventListener("input", this.handleChange);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("mouseup", this.handleContextDrop);
    window.removeEventListener("click", this.handleClick);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("dragstart", this.handleDragStart);
    window.removeEventListener("dragenter", this.handleDragDropMove);
    window.removeEventListener("dragend", this.handleDragDrop);
    window.removeEventListener("keypress", this.handleSumbit);
    window.removeEventListener("input", this.handleChange);
  }

  handleSumbit = event => {
    if (event.keyCode === 13 && this.state.target.tagName === "TD") {
      this.state.target.blur();
      this.targetsCleaner();
    }
  };

  handleDragStart = event => {
    if (event.target.tagName === "TH") {
      let start = +event.target.style.order;
      this.setState({
        dragMovingStart: [start, +this.state.dragNDropOrder[start]]
      });
    } else {
      this.setState({ isCorrectDrag: false });
    }
  };

  handleDragDropMove = event => {
    if (event.target.tagName === "TH" && this.state.isCorrectDrag) {
      let stop = +event.target.style.order;
      this.setState({
        dragMovingStop: [stop, +this.state.dragNDropOrder[stop]]
      });
    }
  };

  handleDragDrop = event => {
    if (event.target.tagName === "TH" && this.state.isCorrectDrag) {
      this.upduteTableOrders();
    }
    this.setState({ isCorrectDrag: true });
  };

  upduteTableOrders = () => {
    let newOrder = this.state.dragNDropOrder.slice();
    let start = this.state.dragMovingStart.slice();
    let stop = this.state.dragMovingStop.slice();
    if (start[0] !== stop[0]) {
      [newOrder[start[1]], newOrder[stop[1]]] = [
        newOrder[stop[1]],
        newOrder[start[1]]
      ];
      this.setState({
        dragNDropOrder: newOrder
      });
    }
  };

  handleBlur = () => {
    let target = this.state.target;
    if (target.tagName === "TD") {
      target.setAttribute("contentEditable", "false");
      this.upduteTablesContent(target);
      if (this.state.targets) {
        let length = this.state.targets.length - 1;
        this.state.targets.forEach((item, i) => {
          if (i !== length) {
            this.upduteTablesContent(item);
          }
        });
      }
    }
  };

  handleChange = () => {
    let target = this.state.target;
    if (target.tagName === "TD") {
      if (this.state.targets) {
        let length = this.state.targets.length - 1;
        this.state.targets.forEach((item, i) => {
          if (i !== length) {
            item.innerHTML = target.innerHTML;
          }
        });
      }
    }
  };

  upduteTablesContent = target => {
    let changedName = target.parentNode.getAttribute("name");
    let indexChangeElem = this.state.heroes
      .slice()
      .findIndex(item => item.name === changedName);
    let changedProperty = target.className;
    let newValue = target.innerHTML;
    // eslint-disable-next-line
    this.state.heroes[indexChangeElem][changedProperty] = newValue;
    this.setState(prevState => ({
      heroes: prevState.heroes
    }));
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
          .find(
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
    if (event.target.tagName === "TD") {
      event.target.setAttribute("contentEditable", "true");
      event.target.focus();
      if (!(event.ctrlKey || event.metaKey)&&event.target!==this.state.target){this.targetsCleaner()}
      if (event.ctrlKey || event.metaKey) {
        let newTargets = this.state.targets.concat(event.target);
        this.setState(
          {
            target: event.target,
            targets: newTargets
          },
          () =>
            this.state.targets.forEach(item => {
              if (item) {
                item.classList.add("selected-tab");
              }
            })
        );
      }
    }
  };

  targetsCleaner = () => {
    this.state.targets.forEach(item => {
      if (item) {
        item.classList.remove("selected-tab");
      }
    });
    this.setState({ targets: [] });
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
    let newVisibleHeads = this.state.contextMenuisible.slice();
    if (event.target.parentNode.parentNode.tagName === "TBODY") {
      newVisibleHeads.splice(0, 1, "visible");
    }
    if (event.target.parentNode.parentNode.tagName === "THEAD") {
      newVisibleHeads.splice(1, 1, "visible");
    }
    event.preventDefault();
    let newHeight =
      event.clientY + 131 < document.documentElement.clientHeight
        ? event.clientY
        : document.documentElement.clientHeight - 133;
    let newWidth =
      event.clientX + 117 < document.documentElement.clientWidth
        ? event.clientX
        : document.documentElement.clientWidth - 119;
    this.setState({
      coordinates: [newHeight, newWidth],
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
          <h1>StarWars heroes</h1>
          <table>
            <thead onContextMenu={this.handleContext}>
              <tr>
                {heads.map((item, index) => (
                  <th
                    key={item}
                    onDragOver={event => {
                      event.preventDefault();
                    }}
                    style={{ order: this.state.dragNDropOrder[index] }}
                    draggable="true"
                    hidden={this.state.visibleHeads[index]}
                    onClick={this.handleSort}
                    id={item}
                    className={
                      item === this.state.currentSort
                        ? item + " selected-head"
                        : item
                    }
                  >
                    {item.replace("_", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody onBlur={this.handleBlur} onContextMenu={this.handleContext}>
              {this.state.heroes.sort(this.sorting).map((item, index) => (
                <tr key={index} name={item.name}>
                  {heads.map((it, idx) => (
                    <td
                      key={idx}
                      style={{ order: this.state.dragNDropOrder[idx] }}
                      className={it}
                      hidden={this.state.visibleHeads[idx]}
                    >
                      {item[it]}
                    </td>
                  ))}
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
            {heads.map((item, index) => (
              <label className="context-menu-button" key={index}>
                <input
                  onChange={this.handleVisibleHeads}
                  checked={!this.state.visibleHeads[index]}
                  id={index}
                  type="checkbox"
                />
                {item.replace("_", " ")}
              </label>
            ))}
          </div>
        </>
      );
    }
  }
}
