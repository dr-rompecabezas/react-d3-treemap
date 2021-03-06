// This Codepen was built using the following sources:
// Core D3 code: https://codepen.io/freeCodeCamp/pen/KaNGNR
// D3 in Observable (reference): https://observablehq.com/@d3/treemap
// Core React & D3: https://codepen.io/paulmichaelxd/pen/GaqRKq
// Other React & D3 code: https://www.pluralsight.com/guides/d3-treemap-in-react
// Mousemove (D3 v6 update): https://observablehq.com/@d3/d3v6-migration-guide#events
const { useState, useEffect, useRef } = React;

const titleLabel = "Video Game Sales";
const subtitleLabel = "Top 100 Most Sold Video Games Grouped by Platform";

const width = 960;
const height = 600;

// Parent Component
const App = () => {
  const data = useData();

  if (!data) {
    return /*#__PURE__*/React.createElement("pre", null, "Loading...");
  }

  return /*#__PURE__*/(
    React.createElement("div", { id: "main" }, /*#__PURE__*/
    React.createElement("div", { id: "title" }, titleLabel), /*#__PURE__*/
    React.createElement("div", { id: "description" }, subtitleLabel), /*#__PURE__*/
    React.createElement(Treemap, { width: width, height: height, data: data })));


};

// Treemap Component
const Treemap = ({ width, height, data }) => {
  const ref = useRef();

  useEffect(() => {
    drawTreemap();
  }, [data]);

  const drawTreemap = () => {
    const container = d3.select(ref.current);

    const tooltip = container.
    append("g").
    attr("class", "tooltip").
    attr("id", "tooltip").
    style("opacity", 0);
    const svg = container.
    append("svg").
    attr("width", width).
    attr("height", height);
    const legend = container.
    append("svg").
    attr("id", "legend").
    attr("width", width).
    attr("height", 200);

    const fader = color => d3.interpolateRgb(color, "#fff")(0.2);
    const color = d3.scaleOrdinal(d3.schemeTableau10.map(fader));
    const format = d3.format(",d");

    const treemap = d3.treemap().size([width, height]).paddingInner(1);

    const root = d3.
    hierarchy(data).
    eachBefore(d => {
      d.data.id = (d.parent ? `${d.parent.data.id}.` : "") + d.data.name;
    }).
    sum(d => d.value).
    sort((a, b) => b.height - a.height || b.value - a.value);

    treemap(root);

    const cell = svg.
    selectAll("g").
    data(root.leaves()).
    enter().
    append("g").
    attr("class", "group").
    attr("transform", d => `translate(${d.x0},${d.y0})`);

    const mousemove = (event, d) => {
      tooltip.style("opacity", 0.9);
      tooltip.
      html(
      `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`).

      attr("data-value", d.data.value).
      style("left", `${event.x + 20}px`).
      style("top", `${event.y - 28}px`);
    };

    const tile = cell.
    append("rect").
    attr("id", d => d.data.id).
    attr("class", "tile").
    attr("width", d => d.x1 - d.x0).
    attr("height", d => d.y1 - d.y0).
    attr("data-name", d => d.data.name).
    attr("data-category", d => d.data.category).
    attr("data-value", d => d.data.value).
    attr("fill", d => color(d.data.category)).
    on("mousemove", mousemove).
    on("mouseleave", () => {
      tooltip.style("opacity", 0);
    });

    cell.
    append("text").
    attr("class", "tile-text").
    selectAll("tspan").
    data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g)).
    enter().
    append("tspan").
    attr("x", 4).
    attr("y", (d, i) => 13 + i * 10).
    text(d => d);

    let categories = root.leaves().map(nodes => nodes.data.category);
    categories = categories.filter(
    (category, index, self) => self.indexOf(category) === index);

    const legendWidth = legend.attr("width");
    const LEGEND_OFFSET = 10;
    const LEGEND_RECT_SIZE = 15;
    const LEGEND_H_SPACING = 150;
    const LEGEND_V_SPACING = 10;
    const LEGEND_TEXT_X_OFFSET = 3;
    const LEGEND_TEXT_Y_OFFSET = -2;
    const legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

    const legendElem = legend.
    append("g").
    attr("transform", `translate(60,${LEGEND_OFFSET})`).
    selectAll("g").
    data(categories).
    enter().
    append("g").
    attr("transform", (d, i) => {
      const x = i % legendElemsPerRow * LEGEND_H_SPACING;
      const y =
      Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
      LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow);

      return `translate(${x},${y})`;
    });

    legendElem.
    append("rect").
    attr("width", LEGEND_RECT_SIZE).
    attr("height", LEGEND_RECT_SIZE).
    attr("class", "legend-item").
    attr("fill", d => color(d));

    legendElem.
    append("text").
    attr("x", LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET).
    attr("y", LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET).
    attr("fill", "#f5f5f5").
    text(d => d);
  };

  return /*#__PURE__*/React.createElement("div", { id: "d3-container", ref: ref });
};

// useData custom Hook
const useData = () => {
  const [data, setData] = useState(null);
  const url =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

  useEffect(() => {
    d3.json(url).then(json => {
      setData(json);
    });
  }, []);

  return data;
};

const rootElement = document.getElementById("root");
ReactDOM.render( /*#__PURE__*/React.createElement(App, null), rootElement);