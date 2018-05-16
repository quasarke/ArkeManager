import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import * as go from "gojs";
import { inject } from '@angular/core/testing';

@Component({
  selector: "app-diagram-editor",
  templateUrl: "./diagram-editor.component.html",
  styleUrls: ["./diagram-editor.component.css"]
})
export class DiagramEditorComponent implements OnInit {
  private diagram: go.Diagram = new go.Diagram();
  private palette: go.Palette = new go.Palette();

  $ = go.GraphObject.make;

  @ViewChild("diagramDiv") private diagramRef: ElementRef;

  @ViewChild("paletteDiv") private paletteRef: ElementRef;

  @Input()
  get model(): go.Model {
    return this.diagram.model;
  }
  set model(val: go.Model) {
    this.diagram.model = val;
  }

  @Output() nodeSelected = new EventEmitter<go.Node | null>();

  @Output() modelChanged = new EventEmitter<go.ChangedEvent>();

  paletteTest = [];

  constructor() {
    this.diagram = new go.Diagram();
    this.diagram.grid.visible = true;
    this.diagram.initialContentAlignment = go.Spot.Center;
    // this.diagram.layout = this.$(go.TreeLayout,
    //   { angle: 90, nodeSpacing: 10, layerSpacing: 30 });
    this.diagram.allowDrop = true; // necessary for dragging from Palette
    this.diagram.undoManager.isEnabled = true; // ctrl z -- need to add actual button

    this.diagram.addDiagramListener("ChangedSelection", e => {
      const node = e.diagram.selection.first();
      this.nodeSelected.emit(node instanceof go.Node ? node : null);
    });


    this.diagram.addModelChangedListener(
      e => e.isTransactionFinished && this.modelChanged.emit(e)
    );

    this.makeStartandEnd();

    this.makeTemplate(
      "ArkeInit",
      "lightblue",
      ["IN"],
      ["FailStep", "NextStep"],
      { DeviceConfigEndpoint: "", Direction: "" },
      "Initialize and Load Settings for device"
    );

    this.makeTemplate(
      "BridgeCall",
      "lightblue",
      ["IN"],
      ["NextStep"],
      { DeviceConfigEndpoint: "", Direction: "BOTH" },
      "Bridges 2 lines together in a conversation"
    );

    this.makeTemplate(
      "StartRecordingLine",
      "lightblue",
      ["IN"],
      ["NextStep"],
      { ItemsToRecord: "", Direction: "" },
      "Starts the recording on a lines"
    );

    this.makeTemplate(
      "PlayPrompt",
      "lightblue",
      ["IN"],
      ["NextStep"],
      { IsInterruptible: false, Direction: "", Prompts: "" },
      "Plays a prompt or series of prompts to a line"
    );

    this.makeTemplate(
      "GetInput",
      "lightblue",
      ["IN"],
      [
        "NextStep",
        "NoAction",
        "Invalid"
      ],
      {
        MaxDigitTimeoutInSeconds: 1,
        Direction: "",
        NumberOfDigitsToWaitForNextStep: 1,
        TerminationDigit: "",
        SetValueAsDestination: "",
        Options: [{ portId: "1" }]
      },
      "Gets input from the phone through DTMF"
    );

    this.makeTemplate(
      "ValidateBillToNumber",
      "lightblue",
      ["IN"],
      ["NextStep", "Invalid"],
      { Direction: "" },
      "Validates the dialed number for billing purposes"
    );

    this.makeTemplate(
      "CallOutbound",
      "lightblue",
      ["IN"],
      [
        "NextStep",
        "SkipCallerPresentation",
        "NoAnswer",
        "Error"
      ],
      { Direction: "" },
      "Dials out of the system to a called party"
    );

    this.makeTemplate(
      "ParallelStart",
      "lightblue",
      ["IN"],
      [
        "IncomingNextStep",
        "OutgoingNextStep"
      ],
      { Direction: "" },
      "Joins two lines together to sync step processing"
    );

    this.makeTemplate(
      "OnHold",
      "lightblue",
      ["IN"],
      [
        "IncomingNextStep",
        "OutgoingNextStep"
      ],
      {
        WaitPrompt: "",
        HoldMusic: "",
        PromptChanges: [{ stepId: "", prompt: "" }],
        Triggers: [{ stepId: "", step: "" }]
      },
      "Places a line on hold for processing steps on another line"
    );

    this.diagram.linkTemplate = this.$(
      go.Link,
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 5,
        relinkableFrom: true,
        relinkableTo: true
      },
      this.$(go.Shape, { stroke: "gray", strokeWidth: 2 }),
      this.$(go.Shape, { stroke: "gray", fill: "gray", toArrow: "Standard" })
    );
    this.palette = this.$(go.Palette, {
      // customize the GridLayout to align the centers of the locationObjects
      layout: this.$(go.GridLayout, { alignment: go.GridLayout.Location })
    });
    this.palette.nodeTemplateMap = this.diagram.nodeTemplateMap;

    // initialize contents of Palette
    this.palette.model.nodeDataArray = this.paletteTest;

    console.log(this.palette.model.nodeDataArray);
  }

  ngOnInit() {
    this.diagram.div = this.diagramRef.nativeElement;
    this.palette.div = this.paletteRef.nativeElement;
  }
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
        new go.Binding("itemArray", "outArray"),{
        itemTemplate: this.makePort(false)
        }
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
        new go.Binding("itemArray", "inArray"),{
          itemTemplate: this.makePort(true)
          }
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
    const node: go.Node = this.$(
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
        },new go.Binding("itemArray", "inArray"),{
          itemTemplate: this.makePort(true)
          }
      ),
      this.$(
        go.Panel,
        "Horizontal",
        new go.Binding("itemArray", "outArray"),
        {
          alignment: go.Spot.Bottom,
          alignmentFocus: new go.Spot(0.5, 1, 0, 8),
        },{
        itemTemplate: this.makePort(false)
        }
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
    if (properties.Options) {
      node.add(this.makeInputPort())
    }
    this.diagram.nodeTemplateMap.add(typename, node);
    let inArray: Array<Object> = inports.map(x => ({ portId: x }));
    let outArray: Array<Object> = outports.map(x => ({ portId: x }));
    this.paletteTest.push({
      text: typename,
      color: background,
      category: typename,
      properties: properties,
      description: description,
      inArray: inArray,
      outArray: outArray
    });
  }
  makeports(ports: Array<string>, top: boolean) {
    const panels = [];
    ports.forEach(port => {
      panels.push(this.makePort(top));
    });
    return panels;
  }
  makePort(top: boolean, align = "Vertical") {
    const port: go.Shape = this.$(go.Shape, "Circle", {
      fill: "gray",
      stroke: null,
      desiredSize: new go.Size(8, 8),
      portId: "", // declare this object to be a "port"
      toMaxLinks: 1, // don't allow more than one link into a port
      cursor: "pointer" // show a different cursor to indicate potential link point

    }, new go.Binding("portId", "portId"));

    const lab = this.$(
      go.TextBlock,
      { font: "7pt sans-serif" },
      new go.Binding("text", "portId")
    );

    const panel = this.$(go.Panel, align,  { margin: new go.Margin(0, 2) },

  );

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

  makeInputPort() {

   const panel = this.$(
        go.Panel,
        "Vertical",
        this.makeSubBinding("itemArray", "Options"),
        {
          alignment: go.Spot.Right,
          alignmentFocus: new go.Spot(0.5, 1, 0, 8),
        },{
        itemTemplate: this.makePort(false, "Horizontal")
        }
      );
    return panel;
  }

  makeSubBinding(targetname, sourcename, conversion?) {
    let bind = new go.Binding(targetname, "properties");
    bind.converter = function(properties, target) {
      const value = properties[sourcename];
      if (value === undefined) return target[targetname];
      return (typeof conversion === "function") ? conversion(value) : value;
    };
    return bind;
  }

}
