<!--
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
-->

# Fusionfrontend

## Docker build
docker build -t fusionfrontend .

## Execute the docker image from the docker daemon
```
docker run -it fusionfrontend
```

or in windows

```
docker run -p 8080:8080 -it fusionfrontend
```

## Design and project structure

The fusion frontend is based on Angular (i.e. with Typescript).

It uses the familiar Flux state management pattern with the concrete lightweight [akita](https://netbasal.gitbook.io/akita/) implementation which enables an architecture based on an observable data store model.

It also uses the angular router and makes heavy use of resolvers to load data associated with parts of the route.

The components are arranged into 3 groups:
* pages 
* content (data store aware components)
* ui (pure ui components)

## Angular CLI

The project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.17. Angular CLI should be installed to work with the project: `npm install -g @angular/cli@8.3.17`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

This also automatically proxies api calls `http://localhost:4200/api`. to `http://localhost:8080/` where the fusion backend application should be running.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Browser plugins
The standard angular browser extension (Augury)[https://augury.rangle.io/] should be installed.
The (redux devtools)[https://netbasal.gitbook.io/akita/enhancers/devtools] can be used with the application / akita 
