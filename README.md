# BIN-SPA-HELLO
A template project for bin framework. This project describes how to develop a mobile SPA with **BIN**, and how to use some base components. Use `$ bitnow-init name` to generate your own project with this template.

## Description
This project is a simple mobile SPA demo developed with **BIN** framework. The structure is simple.
Each app has a single `Application` instance defined in *client/applicatoin*, app can customize the `init` and `run` work in it.
Each view consists of two files: *html* describes the UI structure and appearence, *js* describes the logic of business. So no new concepts, just do as before. And if you have developed the traditional GUI application like Qt, IOS or Android, you will find it's very similar.
Alwayse follow KISS principle. Easy but Powerful.

### Contents information
* *client* : application source code
* *config* : config for project, for example gulp build and browser sync
* *server* : local proxy server, based on **browser-sync**

## bitnow-cli
**bitnow-cli** is a simple tool to help develop app with **BIN** framework. you can install it by:
``` bash
$ npm install -g bitnow-cli
```

## Use this template project
Just generate your project from this template.
``` bash
$ bitnow init <project-name>
```

## Start project for development
cd to your project directory, and then:
``` bash
$ npm start
```

## Build project for production
The project use **AMD** that is **requireJS** to manage module and load resources, so build step is **not** required for development. Build operation will bundle the framework resources and add version or hash information. The default output path is *client-build*.
``` bash
$ npm run build
```

## Build project and then start project.
``` bash
$ npm run build-start
```

