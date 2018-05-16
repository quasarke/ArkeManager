
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { map, retry, catchError, finalize } from 'rxjs/operators';
import { UtilityService } from './utility.services';
import { DataServiceOptions } from './models/data-service-options';
import { Headers } from '@angular/http';
// import { OAuthService } from 'angular-oauth2-oidc';
import { Jsend } from './models/jsend';
import { environment } from "../../../environments/environment";
@Injectable()
export class DataService {

    // Define the internal Subject we'll use to push the command count
    public pendingCommandsSubject = new Subject<number>();
    public pendingCommandCount = 0;

    // Provide the *public* Observable that clients can subscribe to
    public pendingCommands$: Observable<number>;

    constructor(
      public http: HttpClient,
      public us: UtilityService,
      // private oauthService: OAuthService
    ) {
        this.pendingCommands$ = this.pendingCommandsSubject.asObservable();
    }
    public get(url: string, params?: any): Observable<Response | HttpResponse<Object>> {
      const options = new DataServiceOptions();
      options.method = 'GET';
      options.url = url;
      options.params = params;
      return this.request(options);
  }


  public post(url: string, data?: any, params?: any): Observable<Response | HttpResponse<Object>> {
      if (!data) {
          data = params;
          params = {};
      }
      const options = new DataServiceOptions();
      options.method = 'POST';
      options.url = url;
      options.params = params;
      options.data = data;
      return this.request(options);
  }

  public put(url: string, data?: any, params?: any): Observable<Response | HttpResponse<Object>> {
      if (!data) {
          data = params;
          params = {};
      }
      const options = new DataServiceOptions();
      options.method = 'PUT';
      options.url = url;
      options.params = params;
      options.data = data;
      return this.request(options);
  }

  public delete(url: string): Observable<Response | HttpResponse<Object>> {
      const options = new DataServiceOptions();
      options.method = 'DELETE';
      options.url = url;
      return this.request(options);
  }


    public getJsend(url: string, params?: any): Observable<Jsend> {
        const options = new DataServiceOptions();
        options.method = 'GET';
        options.url = url;
        options.params = params;
        return this.jsendRequest(options);
    }


    public postJsend(url: string, data?: any, params?: any): Observable<Jsend> {
        if (!data) {
            data = params;
            params = {};
        }
        const options = new DataServiceOptions();
        options.method = 'POST';
        options.url = url;
        options.params = params;
        options.data = data;
        const response: Subject<Jsend> = new Subject<Jsend>();
        this.request(options).subscribe(
          res => res.body ?  response.next(this.jsendConvert(res.body))  : null,
          error => console.log(error)
        );
        return this.jsendRequest(options);
    }
    public putJsend(url: string, data?: any, params?: any): Observable<Jsend> {
        if (!data) {
            data = params;
            params = {};
        }
        const options = new DataServiceOptions();
        options.method = 'PUT';
        options.url = url;
        options.params = params;
        options.data = data;
        return this.jsendRequest(options);
    }

    public deleteJsend(url: string): Observable<Jsend> {
        const options = new DataServiceOptions();
        options.method = 'DELETE';
        options.url = url;
        return this.jsendRequest(options);
    }



    private jsendConvert(res: any): Jsend {
      const jsend = new Jsend(res);
      return jsend;
    }
    private jsendRequest(options): Observable<Jsend> {
      const response: Subject<Jsend> = new Subject<Jsend>();
      this.request(options).subscribe(
        res => res.body ?  response.next(this.jsendConvert(res.body))  : null,
        error => console.log(error)
      );
      return response;
    }
    private request(options: DataServiceOptions): Observable<Response | HttpResponse<Object>> {
        options.method = (options.method || 'GET');
        options.url = (options.url || '');
        options.headers = (options.headers || {});
        options.params = (options.params || {});
        options.data = (options.data || {});

        // this.interpolateUrl(options);
        // this.addXsrfToken(options);
        this.addContentType(options);
        // this.addAuthToken(options);
        // this.addCors(options);

        const requestOptions = {
         headers: new HttpHeaders(options.headers),
         params: new HttpParams({ fromObject: options.params})
        };

        // tslint:disable-next-line:max-line-length
        this.pendingCommandsSubject.next(++this.pendingCommandCount);

        return this.http
        .request(options.method, environment.API_BASE_URL + options.url, {
          body: JSON.stringify(options.data),
          headers: requestOptions.headers,
          params: requestOptions.params,
          observe: 'response'
        })
        .pipe(
          retry(3),
          catchError(err => {
            this.handleErrors(err);
            return Observable.throw(err);
          }),
          finalize(() =>
            this.pendingCommandsSubject.next(--this.pendingCommandCount)
          )
        );
    }
    // TODO: replace with interceptor
    private addContentType(options: DataServiceOptions): DataServiceOptions {
        // if (options.method !== RequestMethod.Get) {
        options.headers['Content-Type'] = 'application/json; charset=UTF-8';
        // }
        return options;
    }
    // TODO: replace with interceptor
    // private addAuthToken(options: DataServiceOptions): DataServiceOptions {

    //     const authTokens = this.oauthService.getAccessToken();
    //     if (authTokens) {
    //         // tslint:disable-next-line:whitespace
    //         options.headers.Authorization = 'Bearer ' + authTokens;
    //     }

    //     return options;
    // }

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
            throw Error(error);
        } else if (error.status === 403) {
            // Forbidden
            throw Error(error);
        }
    }
}
