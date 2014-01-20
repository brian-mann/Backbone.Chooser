var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

(function(Backbone) {
  var BaseChooser, _ref;
  Backbone.Chooser = (function() {
    function Chooser(model) {
      var method, _i, _len, _ref;
      this.model = model;
      this.model._chooser = this;
      _ref = this._publicMethods();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        method = _ref[_i];
        this.model[method] = _.bind(this[method], this);
      }
      this.chosen = false;
      this.model.set({
        chosen: false
      });
    }

    Chooser.prototype._publicMethods = function() {
      return ["choose", "unchoose", "toggleChoose", "isChosen"];
    };

    Chooser.prototype.isChosen = function() {
      return !!this.chosen;
    };

    Chooser.prototype.choose = function(options) {
      var _ref;
      if (options == null) {
        options = {};
      }
      if (this.isChosen()) {
        return;
      }
      this.chosen = true;
      this.model.set({
        chosen: true
      }, options);
      if (options.silent !== true) {
        this.model.trigger("model:chosen", this.model);
      }
      return (_ref = this.model.collection) != null ? typeof _ref.choose === "function" ? _ref.choose(this.model, options) : void 0 : void 0;
    };

    Chooser.prototype.unchoose = function(options) {
      var _ref;
      if (options == null) {
        options = {};
      }
      if (!this.isChosen()) {
        return;
      }
      this.chosen = false;
      this.model.set({
        chosen: false
      }, options);
      if (options.silent !== true) {
        this.model.trigger("model:unchosen", this.model);
      }
      return (_ref = this.model.collection) != null ? typeof _ref.unchoose === "function" ? _ref.unchoose(this.model, options) : void 0 : void 0;
    };

    Chooser.prototype.toggleChoose = function() {
      if (this.isChosen()) {
        return this.unchoose();
      } else {
        return this.choose();
      }
    };

    return Chooser;

  })();
  BaseChooser = (function() {
    function BaseChooser(collection) {
      var method, _i, _len, _ref;
      this.collection = collection;
      this.collection._chooser = this;
      this.collection._chooser.chosen = {};
      _ref = this._publicMethods();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        method = _ref[_i];
        this.collection[method] = _.bind(this[method], this);
      }
    }

    BaseChooser.prototype._publicMethods = function() {
      return ["choose", "unchoose", "getChosen", "getFirstChosen", "chooseById"];
    };

    BaseChooser.prototype.getChosen = function() {
      return _.toArray(this.chosen);
    };

    BaseChooser.prototype.getFirstChosen = function() {
      return this.getChosen()[0];
    };

    BaseChooser.prototype.modelInChosen = function(model) {
      var _ref;
      return _ref = model.cid, __indexOf.call(_.keys(this.chosen), _ref) >= 0;
    };

    BaseChooser.prototype.addModel = function(model, options) {
      if (options == null) {
        options = {};
      }
      this.chosen[model.cid] = model;
      return typeof model.choose === "function" ? model.choose(options) : void 0;
    };

    BaseChooser.prototype.removeModels = function(model) {
      var _i, _len, _ref, _results;
      if (model == null) {
        model = false;
      }
      _ref = _.flatten([model || this.getChosen()]);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        delete this.chosen[model.cid];
        _results.push(typeof model.unchoose === "function" ? model.unchoose() : void 0);
      }
      return _results;
    };

    BaseChooser.prototype.triggerEvent = function(event, options) {
      if (event == null) {
        event = false;
      }
      if (options == null) {
        options = {};
      }
      _.defaults(options, {
        silent: false
      });
      if (options.silent === true) {
        return;
      }
      event || (event = this._getEvent());
      return this.collection.trigger(event, this.getChosen());
    };

    BaseChooser.prototype.chooseById = function(id, options) {
      var model;
      if (options == null) {
        options = {};
      }
      model = this.collection.get(id);
      if (model) {
        return this.choose(model, options);
      }
    };

    return BaseChooser;

  })();
  Backbone.SingleChooser = (function(_super) {
    __extends(SingleChooser, _super);

    function SingleChooser() {
      _ref = SingleChooser.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    SingleChooser.prototype.choose = function(model, options) {
      if (this.modelInChosen(model)) {
        return;
      }
      this.removeModels();
      this.addModel(model);
      return this.triggerEvent("collection:chose:one", options);
    };

    SingleChooser.prototype.unchoose = function(model, options) {
      if (!this.modelInChosen(model)) {
        return;
      }
      this.removeModels(model);
      return this.triggerEvent("collection:unchose:one", options);
    };

    return SingleChooser;

  })(BaseChooser);
  return Backbone.MultiChooser = (function(_super) {
    __extends(MultiChooser, _super);

    function MultiChooser() {
      var method, _i, _len, _ref1;
      MultiChooser.__super__.constructor.apply(this, arguments);
      _ref1 = ["chooseAll", "chooseNone", "chooseByIds"];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        method = _ref1[_i];
        this.collection[method] = _.bind(this[method], this);
      }
    }

    MultiChooser.prototype.choose = function() {
      var args, eventShouldTrigger, model, options, _i, _len, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      options = !(_.chain(args).flatten().last().value() instanceof Backbone.Model) ? args.pop() : {};
      eventShouldTrigger = false;
      _ref1 = _([args]).flatten();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        model = _ref1[_i];
        if (this.modelInChosen(model)) {
          break;
        }
        eventShouldTrigger || (eventShouldTrigger = true);
        this.addModel(model, options);
      }
      if (eventShouldTrigger) {
        this.triggerEvent("collection:chose:any", options);
      }
      if (eventShouldTrigger) {
        return this.triggerEvent(false, options);
      }
    };

    MultiChooser.prototype.unchoose = function() {
      var args, eventShouldTrigger, model, options, _i, _len, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      options = !(_.chain(args).flatten().last().value() instanceof Backbone.Model) ? args.pop() : {};
      eventShouldTrigger = false;
      _ref1 = _([args]).flatten();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        model = _ref1[_i];
        if (!this.modelInChosen(model)) {
          break;
        }
        eventShouldTrigger || (eventShouldTrigger = true);
        this.removeModels(model, options);
      }
      if (eventShouldTrigger) {
        this.triggerEvent("collection:unchose:any", options);
      }
      if (eventShouldTrigger) {
        return this.triggerEvent(false, options);
      }
    };

    MultiChooser.prototype.chooseAll = function(options) {
      var model, _i, _len, _ref1;
      if (options == null) {
        options = {};
      }
      if (!_.difference(this.collection.models, this.getChosen()).length) {
        return;
      }
      _ref1 = this.collection.models;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        model = _ref1[_i];
        this.addModel(model);
      }
      this.triggerEvent("collection:chose:any", options);
      return this.triggerEvent(false, options);
    };

    MultiChooser.prototype.chooseNone = function(options) {
      if (options == null) {
        options = {};
      }
      if (this.getChosen().length === 0) {
        return;
      }
      this.removeModels();
      this.triggerEvent("collection:unchose:any", options);
      return this.triggerEvent(false, options);
    };

    MultiChooser.prototype.chooseByIds = function(ids, options) {
      var id, _i, _len, _ref1, _results;
      if (ids == null) {
        ids = [];
      }
      if (options == null) {
        options = {};
      }
      _.defaults(options, {
        chooseNone: true
      });
      if (options.chooseNone) {
        this.chooseNone(options);
      }
      _ref1 = _([ids]).flatten();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        id = _ref1[_i];
        _results.push(this.chooseById(id, options));
      }
      return _results;
    };

    MultiChooser.prototype._getEvent = function() {
      if (this.collection.length === this.getChosen().length) {
        return "collection:chose:all";
      }
      if (this.getChosen().length === 0) {
        return "collection:chose:none";
      }
      return "collection:chose:some";
    };

    return MultiChooser;

  })(BaseChooser);
})(Backbone);
