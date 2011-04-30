Localized jQuery templates for node
====================================

**_warning_**: this is all highly experimental. don't rely on it just yet.

This is based on [express](http://expressjs.com) and [node-jqtpl](https://github.com/kof/node-jqtpl). It allows you to easily translate strings on your template files. You need sessions enabled (`app.use express.session`) for it to work.

How to use it
=============

## Installing

    npm install jqtpl-express-i18n

## Writing your templates

This module defines a new `{{e}}` tag for jqtpl, that you should use like this:

````html
<p>{{e "String to be translated"}}</p>
<ul>
  <li>{{e "Erinaceous"}}</li>
  <li>{{e "Inaniloquent"}}</li>
  <li>{{e "Limerance"}}</li>
  <li>{{e "Nihilarian"}}</li>
  <li>{{e "Gibberish"}}</li>
</ul>
```

You can change "e" to anything you want. I think it looks nice. Just avoid overwriting the existent template tags (=, html, etc).

## Setup your language files

By default, language files live in the `/lang` folder. You can change that using the options. I recommend you name your files `language.js` or `language.coffee` where `language` is the 2 character language code to keep it organized.

They should export an object where the keys are the original strings, and values are the translated ones.

A sample language file:

```javascript
exports.pt = {
# Last updated: Fri Apr 29 2011 17:03:53 GMT-0300 (BRT)
# chat.html
	  "like"          : "like"
  , "next"          : "próximo"
# dashboard.html
  , "Likes"         : ""
  , "History"       : "Histórico"
  , "Nothing here." : "Nada pra ver aqui."
# index.html
  , "Email"         : ""
  , "Password"      : "Senha"
  , "show password" : "exibir senha"
}
```

This example was generated by the `pullstring` tool that's included in the package. More info below.

You can also export multiple languages from a single file and name it anything you want. In fact, any .`js` or `.coffee` file will be read.

```coffeescript
exports.es =
	"Gibberish"  : "Algarabía"
	"Depone"     : "Deponer"
	
exports.ru =
  "Gibberish"  : "Тарабарщина"
	"Depone"     : "Давать показания под присягой" # really??
	
exports.jp
  "bacon"      : " ベーコン"
  "eggs"       : "卵"
  
```

## Configuring your express app

First, load up the module:

```coffeescript
i18n = require 'jqtpl-express-i18n'
```

then in your `app.configure` call:

```coffeescript
app.configure ->
  app.use blah blah
  # ...
  
  i18n.enable app
  
```

you can _optionally_ pass some _options_ to it:

```coffeescript
app.configure ->

  # these are the defaults
  i18n.enable app, 
    default: 'en'
    path: '/lang'
    tag: 'e'
  
```

### Language switching

You switch languages by setting the `req.session.lang` property. For example, using routes:

```coffeescript
app.get '/lang/:lang', (req, res) ->
	req.session.lang = req.params.lang if i18n[req.params.lang]?
	res.redirect req.headers.referer || '/'
```
	
This will allow you to switch languages easily by creating a link to http://yoursite.com/lang/en. This URL will never be actually used, it will redirect the user back to the referring page (or home).

Notice that it checks if the required translation exists before changing the session var, for consistency. Available language codes will have a property set on the module object.

## Extracting strings

If you installed this module using npm, you'll have a command line tool called `pullstrings`. It can parse your views  and pluck all of your strings into a nicely formatted output.

Usage is `pullstrings path_to_views [output file]`

For example, if you're in the root dir of your app and keep your views into `/views`, just run
    pullstrings views

It will print all the collected strings, filenames and a time stamp.

If you want to save it to a file, .i.e. `lang/strings.txt`:
    pullstrings views lang/strings.txt

You can then copy that to your language folder to an exports object and proceed translating.