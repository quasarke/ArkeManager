import { Step } from "../models/step";

export const mockSTeps: Array<Step> = [
  new Step({
    name: "ArkeInit",
    inPorts: ["IN"],
    outPorts: ["FailStep", "NextStep"],
    properties: { DeviceConfigEndpoint: "", Direction: "" },
    description: "Initialize and Load Settings for device"
  }),

  new Step({
    name: "BridgeCall",
    inPorts: ["IN"],
    outPorts: ["NextStep"],
    properties: { DeviceConfigEndpoint: "", Direction: "BOTH" },
    description: "Bridges 2 lines together in a conversation"
  }),

  new Step({
    name: "StartRecordingLine",
    inPorts: ["IN"],
    outPorts: ["NextStep"],
    properties: { ItemsToRecord: "", Direction: "" },
    description: "Starts the recording on a lines"
  }),

  new Step({
    name: "PlayPrompt",
    inPorts: ["IN"],
    outPorts: ["NextStep"],
    properties: { IsInterruptible: false, Direction: "", Prompts: "" },
    description: "Plays a prompt or series of prompts to a line"
  }),

  new Step({
    name: "GetInput",
    inPorts: ["IN"],
    outPorts: ["NextStep", "NoAction", "Invalid"],
    properties: {
      MaxDigitTimeoutInSeconds: 1,
      Direction: "",
      NumberOfDigitsToWaitForNextStep: 1,
      TerminationDigit: "",
      SetValueAsDestination: true,
      Options: [{ portId: "1" }]
    },
    description: "Gets input from the phone through DTMF"
  }),

  new Step({
    name: "ValidateBillToNumber",
    inPorts: ["IN"],
    outPorts: ["NextStep", "Invalid"],
    properties: { Direction: "" },
    description: "Validates the dialed number for billing purposes"
  }),

  new Step({
    name: "CallOutbound",
    inPorts: ["IN"],
    outPorts: ["NextStep", "SkipCallerPresentation", "NoAnswer", "Error"],
    properties: { Direction: "" },
    description: "Dials out of the system to a called party"
  }),

  new Step({
    name: "ParallelStart",
    inPorts: ["IN"],
    outPorts: ["IncomingNextStep", "OutgoingNextStep"],
    properties: { Direction: "" },
    description: "Joins two lines together to sync step processing"
  }),

  new Step({
    name: "OnHold",
    inPorts: ["IN"],
    outPorts: [],
    properties: {
      Direction: "",
      WaitPrompt: "",
      HoldMusic: "",
      PromptChanges: [],
      Triggers: []
    },
    description: "Places a line on hold for processing steps on another line"
  })
];
