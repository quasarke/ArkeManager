import { OAuthService } from 'angular-oauth2-oidc';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { timer, Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { UtilityService } from './utility.services';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';
import { DataServiceOptions } from './models/data-service-options';
import { Jsend } from './models/jsend';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Define the internal Subject we'll use to push the command count
  public pendingCommandsSubject = new Subject<number>();
  public pendingCommandCount = 0;

  // Provide the *public* Observable that clients can subscribe to
  public pendingCommands$: Observable<number>;

  public ImpersonateAuthToken: string = null;


  constructor(
    public http: HttpClient,
    public us: UtilityService,
    private oauthService: OAuthService,
    private router: Router
  ) {
    this.pendingCommands$ = this.pendingCommandsSubject.asObservable();
  }
  public get(url: string, params?: any, base_url = null, responseType = 'json'): Observable<Response | HttpResponse<Object>> {
    const options = new DataServiceOptions();
    options.method = 'GET';
    options.url = url;
    options.params = params;
    options.base_url = base_url;
    options.responseType = responseType;
    return this.request(options);
  }

  public noCacheGet(url: string, params?: any, base_url = null, responseType = 'json'): Observable<Response | HttpResponse<Object>> {
    const options = new DataServiceOptions();
    options.method = 'GET';
    options.url = url;
    options.params = params;
    options.base_url = base_url;
    options.responseType = responseType;
    options.headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    return this.request(options);
  }


  /**
   * Poll is used to repeatedly call an end-point using a set interval in seconds.
   * use subscribe() to start the polling and unsubscribe() to stop the polling.
   *
   * @param url
   * @param intervalSeconds - Set value using whole seconds.
   * @param params - Optional
   * @param base_url - Optional
   * @param isSuccessFn - Optional (uses basic 200 response status check if not set)
   */
  public poll(url: string, intervalSeconds, params?: any, base_url = null, isSuccessFn = this._genericSuccessCheck): Observable<any> {
    return timer(0, intervalSeconds * 1000).pipe(
      switchMap(() => this.get(url, params, base_url)),
      takeWhile((response) => isSuccessFn(response))
    );
  }
  private _genericSuccessCheck = (response) => response.status === 200;

  public post(url: string, data?: any, params?: any, base_url = null): Observable<Response | HttpResponse<Object>> {
    if (!data) {
      data = params;
      params = {};
    }
    const options = new DataServiceOptions();
    options.method = 'POST';
    options.url = url;
    options.params = params;
    options.data = data;
    options.base_url = base_url;
    return this.request(options);
  }

  public put(url: string, data?: any, params?: any, base_url = null): Observable<Response | HttpResponse<Object>> {
    if (!data) {
      data = params;
      params = {};
    }
    const options = new DataServiceOptions();
    options.method = 'PUT';
    options.url = url;
    options.params = params;
    options.data = data;
    options.base_url = base_url;
    return this.request(options);
  }

  public delete(url: string, base_url = null): Observable<Response | HttpResponse<Object>> {
    const options = new DataServiceOptions();
    options.method = 'DELETE';
    options.url = url;
    options.base_url = base_url;
    return this.request(options);
  }


  public getJsend(url: string, params?: any, base_url = null): Observable<Jsend> {
    const options = new DataServiceOptions();
    options.method = 'GET';
    options.url = url;
    options.params = params;
    options.base_url = base_url;
    return this.jsendRequest(options);
  }


  public postJsend(url: string, data?: any, params?: any, base_url = null): Observable<Jsend> {
    if (!data) {
      data = params;
      params = {};
    }
    const options = new DataServiceOptions();
    options.method = 'POST';
    options.url = url;
    options.params = params;
    options.data = data;
    options.base_url = base_url;
    const response: Subject<Jsend> = new Subject<Jsend>();
    this.request(options).subscribe(
      res => res.body ? response.next(this.jsendConvert(res.body)) : null,
      error => throwError(error)
    );
    return this.jsendRequest(options);
  }
  public putJsend(url: string, data?: any, params?: any, base_url = null): Observable<Jsend> {
    if (!data) {
      data = params;
      params = {};
    }
    const options = new DataServiceOptions();
    options.method = 'PUT';
    options.url = url;
    options.params = params;
    options.data = data;
    options.base_url = base_url;
    return this.jsendRequest(options);
  }

  public deleteJsend(url: string, base_url = null): Observable<Jsend> {
    const options = new DataServiceOptions();
    options.method = 'DELETE';
    options.url = url;
    options.base_url = base_url;
    return this.jsendRequest(options);
  }


  private jsendConvert(res: any): Jsend {
    const jsend = new Jsend(res);
    return jsend;
  }
  private jsendRequest(options): Observable<Jsend> {
    const response: Subject<Jsend> = new Subject<Jsend>();
    this.request(options).subscribe(
      res => res.body ? response.next(this.jsendConvert(res.body)) : null,
      error => throwError(error)
    );
    return response;
  }


  private request(options: DataServiceOptions): Observable<Response | HttpResponse<Object>> {
    console.log(options.headers);
    options.method = (options.method || 'GET');
    options.url = (options.url || '');
    options.headers = (options.headers || {});
    options.params = (options.params || {});
    options.data = (options.data || {});
    this.interpolateUrl(options);
    // this.addXsrfToken(options);
    this.addContentType(options);
    this.addAuthToken(options);
    // this.addCors(options);

    const requestOptions = {
      headers: new HttpHeaders(options.headers),
      params: new HttpParams({ fromObject: options.params })
    };

    // tslint:disable-next-line:max-line-length
    this.pendingCommandsSubject.next(++this.pendingCommandCount);

    return this.http
      .request(options.method, options.base_url ? (options.base_url + options.url) : (environment.API_BASE_URL + options.url), {
        body: JSON.stringify(options.data),
        headers: requestOptions.headers,
        params: requestOptions.params,
        responseType: options.responseType ? options.responseType : 'json',
        observe: 'response'
      })
      .pipe(
        catchError(err => {
          this.handleErrors(err);
          return throwError(err);
        }),
        finalize(() => {
          this.pendingCommandsSubject.next(--this.pendingCommandCount);
          // console.log(this.pendingCommandCount);
        }
        )
      );
  }
  private addContentType(options: DataServiceOptions): DataServiceOptions {
    // if (options.method !== RequestMethod.Get) {
    options.headers['Content-Type'] = 'application/json; charset=UTF-8';
    // }
    return options;
  }

  private addAuthToken(options: DataServiceOptions): DataServiceOptions {

    const authTokens = this.oauthService.getAccessToken();
    if (authTokens || this.ImpersonateAuthToken) {
      options.headers.Authorization = 'Bearer ' + (this.ImpersonateAuthToken ? this.ImpersonateAuthToken : authTokens);
    }

    return options;
  }

  setImpersonateToken(token) {

    this.ImpersonateAuthToken = token;
  }

  private extractValue(collection: any, key: string): any {
    const value = collection[key];
    delete (collection[key]);
    return value;
  }

  private addXsrfToken(options: DataServiceOptions): DataServiceOptions {
    const xsrfToken = this.getXsrfCookie();
    if (xsrfToken) {
      options.headers['X-XSRF-TOKEN'] = xsrfToken;
    }
    return options;
  }

  private getXsrfCookie(): string {
    const matches = document.cookie.match(/\bXSRF-TOKEN=([^\s;]+)/);
    try {
      return matches ? decodeURIComponent(matches[1]) : '';
    } catch (decodeError) {
      return '';
    }
  }

  private addCors(options: DataServiceOptions): DataServiceOptions {
    options.headers['Access-Control-Allow-Origin'] = '*';
    return options;
  }

  private buildUrlSearchParams(params: any): URLSearchParams {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        searchParams.append(key, params[key]);
      }
    }
    return searchParams;
  }

  private interpolateUrl(options: DataServiceOptions): DataServiceOptions {
    options.url = options.url.replace(/:([a-zA-Z]+[\w-]*)/g, ($0, token) => {
      // Try to move matching token from the params collection.
      if (options.params.hasOwnProperty(token)) {
        return (this.extractValue(options.params, token));
      }
      // Try to move matching token from the data collection.
      if (options.data.hasOwnProperty(token)) {
        return (this.extractValue(options.data, token));
      }
      // If a matching value couldn't be found, just replace
      // the token with the empty string.
      return ('');
    });
    // Clean up any repeating slashes.
    options.url = options.url.replace(/\/{2,}/g, '/');
    // Clean up any trailing slashes.
    options.url = options.url.replace(/\/+$/g, '');

    return options;
  }

  private handleErrors(error: any) {
    if (error.status === 401) {
      sessionStorage.clear();
      this.router.navigate(['login']);
    } else if (error.status === 403) {
      // Forbidden
    }
  }
}
