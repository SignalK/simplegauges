Simplegauges
============

Simple gauges for use with SignalK server. Install with 

`bower install https://github.com/SignalK/simplegauges.git`

Developing
==========
Simplegauges uses a build tool called `webpack` to package all the js source files into one under `dist/gauges.js`.
To create a "production" build run `npm run build`. During development use `npm run watch`, which usually runs webpack
when you save relevant source files.

If you want your changes to persist over reinstalls you can 
* fork the repository on Github
* install your own fork
* make the changes in `lib/simplegauges.js`, package the `dist/gauges.js` with webpack launched with npm run and then refresh your browser
* commit the changes to your own repo 

and hopefully eventually

* contribute your additions back to the main instrumentpanel repository by creating a Github Pull Request.




