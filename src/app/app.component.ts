import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import {
  DynamicFormControlModel,
  DynamicCheckboxModel,
  DynamicInputModel,
  DynamicRadioGroupModel,
  DynamicSelectModel,
  DynamicFormService
} from "@ng-dynamic-forms/core";
import * as go from "gojs";
import { FormGroup } from "@angular/forms";
import { DiagramEditorComponent } from "./diagram-editor/diagram-editor.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {

  digitMask = [ /[1-9, #, *]/];
  formModel: DynamicFormControlModel[] = [];
  formGroup: FormGroup;

  @ViewChild(DiagramEditorComponent) diagramEditor;
  model = new go.GraphLinksModel(
    [
      {
        key: "1",
        text: "DeviceConnected",
        color: "lightgreen",
        category: "DeviceConnected",
        properties: { Direction: "" },
        description: "Must be first step, fires when device connects",
        outArray: [{portId: "nextStep"}]
      },
      {
        key: "2",
        text: "DisconnectDevice",
        color: "salmon",
        category: "DisconnectDevice",
        properties: { Direction: "", HangUp: "" },
        description: "Ends the call flow",
        inArray: [{portId: "IN"}]
      }
    ]
  );

  data: any;
  node: go.Node;

  constructor(private formService: DynamicFormService) {
    this.model.linkFromPortIdProperty = "fromPort";
    this.model.linkToPortIdProperty = "toPort";
    this.model.makeUniqueKeyFunction = this.keyGenerator;
    this.model.copyNodeDataFunction = function(data, model) {
      let newdata: any = Object.assign({}, data);
      var i = model.nodeDataArray.length * 2 + 1;
      while (model.findNodeDataForKey(i) !== null) i += 2;
      newdata.key = i;
      console.log(newdata);
      return newdata;

    }
  }

  ngOnInit(): void {
    this.formGroup = this.formService.createFormGroup(this.formModel);
  }

  keyGenerator(model, data) {
    // odd numbered keys
    var i = model.nodeDataArray.length * 2 + 1;
    while (model.findNodeDataForKey(i) !== null) i += 2;
    data.key = i;
    return i;
  }
  showDetails(node: go.Node | null) {
    this.node = node;
    if (node) {
      // copy the editable properties into a separate Object
      this.data = {
        properties: node.data.properties,
        outArray: node.data.outArray
      };
      this.buildFormModel();
    } else {
      this.data = null;
    }
  }

  buildFormModel() {
    if (this.data.properties) {
      this.formModel = [];
      for (const key of Object.keys(this.data.properties)) {
        const input = this.createFormInput(key);
        if (input) {
          this.formModel.push(input);
        }
      }
      this.formGroup = this.formService.createFormGroup(this.formModel);
    }
  }
  createFormInput(key) {
    let input;
    switch (key) {
      case "Direction": {
        input = new DynamicSelectModel({
          id: key,
          label: key,
          value: this.data.properties[key],
          options: [
            { label: "INCOMING", value: "INCOMING" },
            { label: "OUTGOING", value: "OUTGOING" },
            { label: "BOTH", value: "BOTH" }
          ]
        });
        break;
      }
      default: {
        input = this.createGenericFormInput(key);
        break;
      }
    }
    return input;
  }
  createGenericFormInput(key) {
    let input;
    switch (typeof this.data.properties[key]) {
      case "string": {
        input = new DynamicInputModel({
          id: key,
          label: key,
          value: this.data.properties[key]
        });
        break;
      }
      case "number": {
        input = new DynamicInputModel({
          id: key,
          label: key,
          value: this.data.properties[key],
          min: 0,
          mask: [/\d/, /\d/, /\d/, /\d/]
        });
        break;
      }
      case "boolean": {
        input = new DynamicCheckboxModel({
          id: key,
          label: key,
          value: this.data.properties[key]
        });
        break;
      }
    }
    return input;
  }

  onCommitDetails() {
    if (this.node) {

      // copy the edited properties back into the node's model data,
      // using object assign to copy none array type elements and omit changes to array elements
      Object.assign(this.data.properties, this.formGroup.value);
      this.model.startTransaction();
      this.model.setDataProperty(this.node.data, "properties", this.data.properties);
      this.model.commitTransaction("modified properties");
      console.log(this.model.toJson());
    }
  }

  onCancelChanges() {
    // wipe out anything the user may have entered
    this.showDetails(this.node);
  }

  onModelChanged(c: go.ChangedEvent) {
    // who knows what might have changed in the selected node and data?
    this.showDetails(this.node);
  }
  // Add a port to the specified side of the selected nodes.
  addPort(name) {
    if(this.node) {
    // this.data.outArray.push({ portId: "test"});
    this.model.startTransaction("addPort");
      // get the Array of port data to be modified
      if (this.node.data["outArray"]) {
        // create a new port data object
        console.log(this.node.data["outArray"])
        const newportdata = {
          portId: name,
        };
        // and add it to the Array of port data

        this.model.insertArrayItem(this.node.data["outArray"], -1, newportdata);
      }
    this.model.commitTransaction("addPort");
    }
  }

  addInputPort(name) {
    if(this.node) {
    // this.data.outArray.push({ portId: "test"});
    this.model.startTransaction("addPort");
      // get the Array of port data to be modified
      if (this.node.data["properties"]["Options"]) {
        // create a new port data object
        console.log(this.node.data["properties"]["Options"])
        const newportdata = {
          portId: name
        };
        // and add it to the Array of port data

        this.model.insertArrayItem(this.node.data["properties"]["Options"], -1, newportdata);
      }
    this.model.commitTransaction("addPort");
    }
  }

  removeInputPort(idx) {
    console.log(idx);
    this.model.removeArrayItem(this.node.data["properties"]["Options"], idx);
  }

  removePort(idx) {
    console.log(idx);
    this.model.removeArrayItem(this.node.data["outArray"], idx);
  }
}
