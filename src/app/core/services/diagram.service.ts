import { Injectable } from '@angular/core';
import * as go from "gojs";
import { Store } from '@ngrx/store';
import { appState } from '../store/app.store';
import { diagramActions } from '../store/diagram/diagram.actions';

@Injectable({
  providedIn: 'root'
})
export class DiagramService {
  private diagram: go.Diagram;
  private palette: go.Palette;

  paletteObj = [];
  $ = go.GraphObject.make;
  constructor(private store: Store<appState>, private diagramActions: diagramActions,) { }

  makeStartandEnd() {
    // start DeviceConnected
    const DeviceConnected = this.$(
      go.Node,
      "Auto",
      this.$(
        go.Shape,
        "RoundedRectangle",
        { fill: "white", strokeWidth: 1, minSize: new go.Size(150, 100) },
        new go.Binding("fill", "color")
      ),
      this.$(
        go.TextBlock,
        { margin: 8, editable: false },
        new go.Binding("text").makeTwoWay()
      ),
      this.$(
        go.Panel,
        "Horizontal",
        {
          alignment: go.Spot.Bottom,
          alignmentFocus: new go.Spot(0.5, 1, 0, 8)
        },
        [this.makePort("NextStep", false)]
      )
    );
    this.diagram.nodeTemplateMap.add("DeviceConnected", DeviceConnected);


    // end disconnect
    const DisconnectDevice = this.$(
      go.Node,
      "Auto",
      this.$(
        go.Shape,
        "RoundedRectangle",
        { fill: "white", strokeWidth: 1, minSize: new go.Size(150, 100) },
        new go.Binding("fill", "color")
      ),
      this.$(
        go.TextBlock,
        { margin: 8, editable: false },
        new go.Binding("text").makeTwoWay()
      ),

      this.$(
        go.Panel,
        "Horizontal",
        {
          alignment: go.Spot.Top,
          alignmentFocus: new go.Spot(0.5, 0, 0, -8)
        },
        [this.makePort("IN", true)]
      )
    );
    this.diagram.nodeTemplateMap.add("DisconnectDevice", DisconnectDevice);

  }

  makeTemplate(
    typename,
    background,
    inports,
    outports,
    properties,
    description?
  ) {
    const node = this.$(
      go.Node,
      "Auto",
      this.$(
        go.Shape,
        "RoundedRectangle",
        { fill: "white", strokeWidth: 1, minSize: new go.Size(150, 100) },
        new go.Binding("fill", "color")
      ),
      this.$(
        go.TextBlock,
        { margin: 8, editable: false },
        new go.Binding("text").makeTwoWay()
      ),

      this.$(
        go.Panel,
        "Horizontal",
        {
          alignment: go.Spot.Top,
          alignmentFocus: new go.Spot(0.5, 0, 0, -8)
        },
        this.makeports(inports, true)
      ),
      this.$(
        go.Panel,
        "Horizontal",
        new go.Binding("itemArray", "outArray"),
        {
          alignment: go.Spot.Bottom,
          alignmentFocus: new go.Spot(0.5, 1, 0, 8)
        },
        this.makeports(outports, false)
      ),
      {
        // define a tooltip for each node that displays the color as text
        toolTip: this.$(
          go.Adornment,
          "Auto",
          this.$(go.Shape, { fill: "#FFFFCC" }),
          this.$(go.TextBlock, { margin: 4 }, description)
        )
        // end of Adornment
      }
    );
    this.diagram.nodeTemplateMap.add(typename, node);
    this.paletteObj.push({
      text: typename,
      color: background,
      category: typename,
      properties: properties,
      description: description
    });
  }
  makeports(ports: Array<string>, top: boolean) {
    const panels = [];
    ports.forEach(port => {
      panels.push(this.makePort(port, top));
    });
    return panels;
  }
  makePort(name: string, top: boolean) {
    const port: go.Shape = this.$(go.Shape, "Circle", {
      fill: "gray",
      stroke: null,
      desiredSize: new go.Size(8, 8),
      portId: name, // declare this object to be a "port"
      toMaxLinks: 1, // don't allow more than one link into a port
      cursor: "pointer" // show a different cursor to indicate potential link point
    });

    const lab = this.$(
      go.TextBlock,
      name, // the name of the port
      { font: "7pt sans-serif" }
    );

    const panel = this.$(go.Panel, "Vertical", { margin: new go.Margin(0, 2) });

    if (top) {
      port.toSpot = go.Spot.Top;
      port.toMaxLinks = 100;
      port.toLinkable = true;
      port.toLinkableSelfNode = true;
      lab.margin = new go.Margin(1, 0, 0, 1);
      panel.alignment = go.Spot.TopLeft;
      panel.add(port);
      panel.add(lab);
    } else {
      port.fromSpot = go.Spot.Bottom;
      port.toMaxLinks = 1;
      port.fromMaxLinks = 1;
      port.fromLinkable = true;
      port.fromLinkableSelfNode = true;
      lab.margin = new go.Margin(1, 1, 0, 0);
      panel.alignment = go.Spot.TopRight;
      panel.add(lab);
      panel.add(port);
    }
    return panel;
  }

  addPort(name) {
    this.diagram.startTransaction("addPort");
    this.diagram.selection.each(function(node) {
      // skip any selected Links
      if (!(node instanceof go.Node)) { return; }
      // compute the next available index number for the side
      let i = 0;
      while (node.findPort(i.toString()) !== node) { i++; }
      // now this new port name is unique within the whole Node because of the side prefix
      // get the Array of port data to be modified
      const arr = node.data["outArray"];
      if (arr) {
        // create a new port data object
        const newportdata = this.makePort(name, false);
        // and add it to the Array of port data
        this.diagram.model.insertArrayItem(arr, -1, newportdata);
      }
    });
    this.diagram.commitTransaction("addPort");
  }
}
