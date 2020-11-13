# Web workers install and usage

Web workers are supported by Angular, but numerous problems have been seen during dev. Errors have been  thrown at compiling and at runtime, that were hard to debug. It seems they are due to bad version combinations of node/angular packages.

Here is a list of actions that allows to generate a web worker without trouble.

## Check package versions

Run `ng version`. As far as possible, version of angular package should match. Sometimes the version format changes: it is either `x.y.z` or `0.x0y.z`. A working combination for Angular 8 can be:

```sh
Angular CLI: 8.3.25
Node: 10.19.0
OS: linux x64
Angular: 8.2.14
... animations, common, compiler, compiler-cli, core, forms
... platform-browser, platform-browser-dynamic, platform-server
... router

Package                           Version
-----------------------------------------------------------
@angular-devkit/architect         0.803.25
@angular-devkit/build-angular     0.803.25
@angular-devkit/build-optimizer   0.803.25
@angular-devkit/build-webpack     0.803.25
@angular-devkit/core              8.3.25
@angular-devkit/schematics        8.3.25
@angular/cdk                      8.2.3
@angular/cli                      8.3.25
@ngtools/webpack                  8.3.25
@schematics/angular               8.3.25
@schematics/update                0.803.25
rxjs                              6.5.4
typescript                        3.5.3
webpack                           4.39.2
```

## Generate a web worker

Go to the desired location and run `ng g webWorker <name>`. This should creates a file `<name>.worker.ts`. Alternatively, the command `ng g webWorker <location>` can be run from the project root directory. If this is the first web worker of the project, `tsconfig.worker.ts` should also be created, `angular.json` and `src/tsconfig.json`.

### tsconfig.worker.ts content

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/worker",
    "lib": [
      "es2018",
      "webworker"
    ],
    "types": []
  },
  "include": [
    "src/**/*.worker.ts"
  ]
}
```

### angular.json content

In project:glowing.bear:architect:build:options, the field `"webWorkerTsConfig": "tsconfig.worker.json"` should have appeared.

In lint:options:tsConfig, the field `tsconfig.worker.json` should have appeared.

## Test the newly created worker

If the worker has the same name as an existing component, Angular should have add a test function into the component code. If not, the test function can be manually added and can be found in [Angular documentation](https://v8.angular.io/guide/web-worker). This can be done in `ngOnInit` implementation for instance.

With the test snippet from Angular's documentation, the browser's console should print `page got message: worker response to hello` when it is executed.

## Test imports

It also happened that the simple worker worked fine, but started to be produce runtime error when using imports.

In the provided test worker `gb-explore.worker`, import from models and node modules are used and tested. The browser's console output should be `page got message: worker response to hello that feature thatName`.
