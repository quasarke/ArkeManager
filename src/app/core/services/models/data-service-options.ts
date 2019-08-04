export class DataServiceOptions {
  public method: string;
  public url: string;
  public headers: any = {};
  public params = {};
  public data = {};
  public base_url: string = null;
  public responseType?;
}
