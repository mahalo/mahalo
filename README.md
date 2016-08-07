To get started developing with Mahalo without waiting for a proper guide to arrive a good start
are the following pages:

* [Component](http://mahalo.github.io/documentation/latest/mahalo/component)
* [Template](http://mahalo.github.io/documentation/latest/mahalo/template)
* [Expression](http://mahalo.github.io/documentation/latest/mahalo/expression)
* [Behavior](http://mahalo.github.io/documentation/latest/mahalo/behavior)

### Requirements
The easiest way to get started with Mahalo is by starting from the
**mahalo-seed** package. This is a pre-configured starte-kit
that contains a shell for creating Mahalo applications.

Before you can start you have to be familiar with NPM the package
manager of [Node.js](http://www.nodejs.org) which has to be installed on
your machine for Mahalo to work.

Another dependency of **mahalo-seed** is [Grunt](http://www.gruntjs.com)
which is responsible for running various tasks like starting the
development server or building a deployable script file.

Once you have Node.js installed you can install Grunt globally with following
command in a terminal

```sh
npm install -g grunt-cli
```

### Option A: Install using Git
This assumes that you are familiar with Git and have it running in your environment.
Create a new folder on your local machine that will host your
application. Inside of that folder execute the following two commands

```sh
git init
git pull https://github.com/mahalo/mahalo-seed.git
```
        
You now have an initialized Git repository in that folder and copied the files
from **mahalo-seed** to that folder.

### Option B: Download the package
If you don't want to initialize a Git repository yet you can also
download the **mahalo-seed** package [here](http://www.github.com/mahalo/mahalo-seed).
Just extract all files to a folder of your liking.

### Running Mahalo
After you have the **mahalo-seed** package somewhere on your machine you
can install your applications dependencies with the following command
executed in your **mahalo-seed** folder

```sh
npm install
```

Congratulations! You can now start your Mahalo application in development
mode by using the default Grunt task by typing the following command

```sh
grunt       
```

This command will bundle your files and start the development sever listening
on port [8080](http://localhost:8080) by default. Mahalo uses webpack as its module
bundler and webpack-dev-server to serve your application and automatically
refresh your browser when you make changes to your files.