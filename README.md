# TypeScript+CommonJs
This repo serves as a starting template for projects that want:

- TypeScript 2.3+, with strict checks
- Targeting server side javascript using NodeJs

## Setup
Run the following commands in order:

	$ npm install
	$ typings install
	$ gulp setup

## Usage
To rebuild the app, use one of the following commands:

	$ gulp compile
	$ gulp watch

To run tests, use the following command:

	$ gulp compile-test
	$ mocha ./tests
