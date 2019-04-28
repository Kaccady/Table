import React, { Component } from "react";
import axios from "axios";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import arrayMove from "array-move";

const Head = SortableElement(({ item, visibility, sort }) => {
  return (
    <th
      hidden={visibility}
      id={item}
      className={item === sort ? item + " selected-head" : item}
    >
      {item.replace("_", " ")}
    </th>
  );
});
const Heads = SortableContainer(({ heads, visibility, sort }) => (
  <tr>
    {heads.map((item, index) => (
      <Head
        distance={0}
        key={`item-${index}`}
        index={index}
        item={item}
        visibility={visibility[index]}
        sort={sort}
      />
    ))}
  </tr>
));

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
      targets: [],
      search: "",
      heads: [
        "name",
        "gender",
        "birth_year",
        "skin_color",
        "hair_color",
        "eye_color"
      ]
    };
  }
  componentDidMount() {
    this.loadMore();
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("mouseup", this.handleContextDrop);
    window.addEventListener("mousedown", this.handleSort);

    window.addEventListener("click", this.handleClick);
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("keypress", this.handleSumbit);
    window.addEventListener("input", this.handleChange);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("mouseup", this.handleContextDrop);
    window.removeEventListener("click", this.handleClick);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("keypress", this.handleSumbit);
    window.removeEventListener("input", this.handleChange);
  }

  handleSumbit = event => {
    if (event.keyCode === 13 && this.state.target.it.tagName === "TD") {
      this.state.target.it.blur();
      this.targetsCleaner();
    }
  };

  handleBlur = () => {
    let target = this.state.target;
    if (target.it) {
      if (target.it.tagName === "TD") {
        target.it.setAttribute("contentEditable", "false");
        this.updateTablesContent(target);
        if (this.state.targets) {
          let length = this.state.targets.length - 1;
          this.state.targets.forEach((target, i) => {
            if (i !== length) {
              this.updateTablesContent(target);
            }
          });
        }
      }
    }
  };

  handleChange = () => {
    let target = this.state.target.it;
    if (target.tagName === "TD") {
      if (this.state.targets) {
        let length = this.state.targets.length - 1;
        this.state.targets.forEach((item, i) => {
          if (i !== length) {
            item.it.innerHTML = target.innerHTML;
          }
        });
      }
    }
  };

  targetSaver = target => {
    let changedName = target.parentNode.getAttribute("name");
    let indexChangeElem = this.state.heroes
      .slice()
      .findIndex(item => item.name === changedName);
    let changedProperty = target.className.replace(" selected-tab", "");
    let address = this.state.heroes[indexChangeElem];
    return { it: target, address: address, tag: changedProperty };
  };

  updateTablesContent = target => {
    let newValue = target.it.innerHTML;
    target.address[target.tag] = newValue;
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
              item.name === this.state.target.it.parentNode.firstChild.innerHTML
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
              item.name === this.state.target.it.parentNode.firstChild.innerHTML
          );
        let newHeroes = this.state.heroes.slice().concat(getCopy);
        this.setState({
          heroes: newHeroes
        });
        break;
      case "change":
        this.state.target.it.setAttribute("contentEditable", "true");
        this.state.target.it.focus();
        break;
      default:
        break;
    }

    if (event.target.tagName === "TD") {
      event.target.setAttribute("contentEditable", "true");
      event.target.focus();
      if (
        !(event.ctrlKey || event.metaKey) &&
        event.target !== this.state.target.it
      ) {
        this.setState({
          target: this.targetSaver(event.target)
        });
        this.targetsCleaner();
      }
      if (event.ctrlKey || event.metaKey) {
        let newTargets = this.state.targets.concat(
          this.targetSaver(event.target)
        );
        this.setState(
          {
            target: this.targetSaver(event.target),
            targets: newTargets
          },
          () => {
            this.state.targets.forEach(item => {
              if (item) {
                item.it.classList.add("selected-tab");
              }
            });
          }
        );
      }
    } else {if(event.target.tagName==="P")return;
      this.state.target.it.blur();
      this.targetsCleaner();
    }
  };

  targetsCleaner = () => {
    this.state.targets.forEach(item => {
      if (item) {
        item.it.classList.remove("selected-tab");
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
    if (event.target.tagName === "TH") {
      if (event.target.id === this.state.currentSort) {
        this.setState(prevState => ({
          isReverse: !prevState.isReverse
        }));
      }
      this.setState({
        currentSort: event.target.id
      });
    }
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
      target: this.targetSaver(event.target)
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

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState(({ heads }) => ({
      heads: arrayMove(heads, oldIndex, newIndex)
    }));
  };

  render() {
    if (this.state.heroes.length === 0) {
      return <p>Loading...</p>;
    } else {
      return (
        <>
          <h1>StarWars heroes</h1>
          <input
            placeholder="поиск"
            value={this.state.search}
            onChange={event => {
              this.setState({ search: event.target.value });
            }}
          />
          <table>
            <thead onContextMenu={this.handleContext}>
              <Heads
                axis="x"
                onSortEnd={this.onSortEnd}
                heads={this.state.heads}
                visibility={this.state.visibleHeads}
                sort={this.state.currentSort}
              />
            </thead>
            <tbody onBlur={this.handleBlur} onContextMenu={this.handleContext}>
              {this.state.heroes
                .filter(item => {
                  if (this.state.search === "") {
                    return true;
                  }
                  let i = Object.values(item);
                  return (
                    i
                      .toString()
                      .toLowerCase()
                      .search(this.state.search.toLowerCase()) !== -1
                  );
                })
                .sort(this.sorting)
                .map((item, index) => (
                  <tr key={index} name={item.name}>
                    {this.state.heads.map((it, idx) => (
                      <td
                        key={idx}
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
            {this.state.heads.map((item, index) => (
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
