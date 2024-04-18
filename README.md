# Do not use this project

- 🌍 Printing Jira tickets to have a real life board is a bad idea. You shouldn't waste resources to duplicate something which already works well on a screen, the Earth don't need that.
- ☠️  This project is untested, unmaintained, undocumented and was written a long time ago by someone who didn't know how to write Javascript, chances are that the app is at best bugged at worst pretty dangerous (I don't remember about it but this readme says in the TODO section `Don't save password in plain text` that should be enough to make you not use this app)
- ✨ I keep this code on Github only to remember what I have done in my dev journey, don't reuse this code.

# JiraPrinter
[![CodeFactor](https://www.codefactor.io/repository/github/statox/jiraprinterelectron/badge)](https://www.codefactor.io/repository/github/statox/jiraprinterelectron)
[![Build Status](https://travis-ci.org/statox/jiraPrinterElectron.svg?branch=master)](https://travis-ci.org/statox/jiraPrinterElectron)
[![Issues](https://img.shields.io/github/issues/statox/jiraprinterelectron.svg)](https://github.com/statox/jiraPrinterElectron/issues)

Print your Jira issues for your Agile Scrum board!

This application gets a list of issues from a
[Jira](https://www.atlassian.com/software/jira) issue tracker and prints them in
a formatted PDF file. This way you can then print your issues and use them on
your real life Agile Scrum board.

## Getting Started

These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes. See deployment for notes on
how to deploy the project on a live system.

### Prerequisites

This is an [electron](https://electronjs.org/) app so all you need is to have
[npm](https://www.npmjs.com/) installed on your machine.

### Installing

To get started clone this repo on your machine

    git clone https://github.com/statox/jiraPrinterElectron

Then install the dependencies with

    npm install

You can then start the application with

    npm start

## Running the application

The first time you start the application you will have to setup the login
information to be able to make request to your Jira instance API.

Note that the OAuth protocol is not supported yet. All requests are authenticated
via Basic Auth HTTP headers. Support of https and OAuth are in the roadmap.

You can then input the Jira keys of the issues you want to print. Once you input
all the issues you want to print you can use the "Download issues" and "Print
issues" buttons.

## Deployment

You can generate an application with

    grunt build

The build parameters are in [Gruntfile.js](Gruntfile.js) there you can define for which
platform you want to build your application.

## Built With

* [Electron](https://electronjs.org/) - To make the application cross platform
* [GruntJS](https://gruntjs.com/) - To run tasks as building the application
* [AngularJS](https://angularjs.org/)- As the MVC framework
* [Bootstrap](https://getbootstrap.com/) - As the front end library
* [angular-electron](https://github.com/ozsay/angular-electron) - A javascript library to wrap Electron object as Angular services
* [node-html-pdf](https://github.com/marcbachmann/node-html-pdf/) - A node module to generate PDF files from HTML

## TODO

The app is a work in progress here is some things which may be done in the
future. For a complete list of things to be done you can have a look at the
[issue page](../../issues).

* Write proper tests
* Don't save password in plain text (maybe use [keytar](https://github.com/atom/node-keytar))
* Handle https protocol
* Custom CSS to customize the printed issues format
* Support OAuth protocol to reach Jira

## Contributing

Please fork and submit a Pull Request!

## Code quality

We have a CodeFactor watching this repo [here](https://www.codefactor.io/repository/github/statox/jiraprinterelectron/)

We also have Travis which should be usefull when we write tests in the future
[here](https://travis-ci.org/statox/jiraPrinterElectron)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
