(function() {
  var debug, fs, i18n, path, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  fs = require('fs');

  _ = require('./util');

  debug = function(str) {
    return i18n.options.debug && console.log("[i18n] " + str);
  };

  i18n = function(options) {
    i18n.options = _.extend({
      "default": 'en',
      path: '/lang',
      debug: false
    }, options);
    i18n.languages.push(i18n.options["default"]);
    i18n.loadLanguageFiles();
    return function(req, res, next) {
      var locale, _ref;
      if (((_ref = req.session) != null ? _ref.lang : void 0) == null) {
        locale = i18n.getLocale(req);
        req.session.locale = locale;
        req.session.lang = locale.slice(0, 3);
        debug("Language set to " + req.session.lang);
      }
      res.locals({
        locale: req.session.locale,
        lang: req.session.lang
      });
      return next();
    };
  };

  i18n.languages = [];

  i18n.strings = {};

  i18n.locals = {
    __: i18n.translate,
    _n: i18n.plural,
    languages: i18n.languages
  };

  i18n.loadLanguageFiles = function() {
    var data, dir, filePath, files, locale, _i, _len, _results;
    dir = i18n.options.path;
    if (fs.existsSync(process.cwd() + dir)) {
      files = fs.readdirSync(process.cwd() + dir).map(function(f) {
        return path.basename(f, '.json');
      }).filter(_.isValidLocale);
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        locale = files[_i];
        if (!(locale !== i18n.options["default"])) {
          continue;
        }
        filePath = path.join(process.cwd(), dir, locale + '.json');
        try {
          data = JSON.parse(fs.readFileSync(filePath).toString());
          i18n.strings[locale] = data;
          i18n.languages.push(locale);
          _results.push(debug("loaded " + locale + ".json"));
        } catch (e) {
          _results.push(debug("failed to load language file " + filePath));
        }
      }
      return _results;
    } else {
      return debug("path " + dir + " doesn't exist");
    }
  };

  i18n.isValidLocale = function(locale) {
    return /^\w\w(-\w\w)?$/.test(locale);
  };

  i18n.getLocale = function(req) {
    var acceptHeader, languages, locale, _i, _len;
    languages = [];
    if (acceptHeader = req.header('Accept-Language')) {
      languages = acceptHeader.split(/,|;/g).filter(i18n.isValidLocale);
    }
    if (languages.length < 1) {
      languages.push(i18n.options["default"]);
      debug("Empty Accept-Language header, reverting to default");
    }
    for (_i = 0, _len = languages.length; _i < _len; _i++) {
      locale = languages[_i];
      if (i18n.languages[locale]) {
        locale = locale.toLowerCase();
      }
    }
    locale || (locale = languages[0]);
    return locale;
  };

  i18n.plural = function(str, zero, one, more) {
    var word, _ref;
    if (typeof more !== 'string') {
      _ref = [zero, one, one], one = _ref[0], more = _ref[1], zero = _ref[2];
    }
    word = (function() {
      switch (true) {
        case str === 0:
          return zero;
        case str === 1:
          return one;
        case str > 1:
          return more;
      }
    })();
    return i18n.translate.call(this, word).replace(/%s/g, str);
  };

  i18n.translate = function(str) {
    var localStrings, _ref;
    if (!isNaN(str) && arguments.length > 2) {
      return i18n.plural.apply(this, arguments);
    }
    localStrings = i18n.strings[this.locale] || i18n.strings[this.lang];
    localStrings && ((_ref = localStrings[str]) != null ? _ref : localStrings[str] = '');
    return (localStrings != null ? localStrings[str] : void 0) || str || '';
  };

  i18n.setLanguage = function(session, lang) {
    if (__indexOf.call(i18n.languages, lang) >= 0) {
      session.lang = lang;
      session.langbase = lang.substring(0, 2);
      return debug("Language set to " + lang);
    }
  };

  i18n.updateStrings = function(req, res, next) {
    var basePath, file, filePath, lang, strings, _ref;
    basePath = path.join(process.cwd(), i18n.options.path);
    _ref = i18n.strings;
    for (lang in _ref) {
      strings = _ref[lang];
      if (!(i18n.isValidLocale(lang))) {
        continue;
      }
      file = "" + lang + ".json";
      filePath = path.join(basePath, file);
      fs.readFile(filePath, function(err, res) {
        var contents, s, t;
        try {
          contents = JSON.parse(res.toString());
        } catch (e) {
          contents = {};
        } finally {
          for (s in strings) {
            t = strings[s];
            if (contents[s]) {
              i18n.strings[lang][s] = contents[s];
            } else {
              contents[s] = t;
            }
          }
        }
        fs.writeFile(filePath, JSON.stringify(contents, null, 4), 'utf8');
        return debug("Updated strings in " + file);
      });
    }
    return next();
  };

  module.exports = i18n;

}).call(this);