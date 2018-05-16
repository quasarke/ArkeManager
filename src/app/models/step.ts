export class Step {
  name: string;
  description: string;
  inPorts: Array<string>;
  outPorts: Array<string>;
  properties: Object;
  constructor(json?: Partial<Step>) {
    if (json) {
      Object.assign(this, json);
    }
  }
}
