# Backbone.Chooser
Track your "selected" **models** and **collections** with ease.

### Models
Know if they have been `selected` - except with the attribute is `chosen`.

### Collections
Easily track and manage which models have been `chosen`.  Simple configuration allows collections to automatically behave as `single choice` or `multiple choice` collections.

### Use Case
* In Navigation - tracking the `chosen` tab
* In Lists - tracking the `chosen` list item
* In Forms - tracking multiple `chosen` items

## The Pitch
You've probably written it a dozen times in a dozen different ways - tracking a "selected" state of your models, or knowing which model within a collection is "selected".  This plugin takes the basic idea from [Derick Bailey's - Backbone.Picky](https://github.com/derickbailey/backbone.picky) but improves the API and events.

### Key Improvements
* Non conflicting method names and attributes
* `select()` and `pick()` are underscore methods which are mixed into collections and models.  This plugin works around that by referring to attributes and methods as `chosen` and `choose()`
* Only the callable methods are mixed into your objects - so they won't be polluted with unnecessary internals
* More consistent return of the chosen models by your collections
* Better events which are more clearly named, prefixed, and easier to work with

## Model Usage

Compose Backbone.Chooser into your models:

```coffee
class Model extends Backbone.Model
  initialize: ->
    new Backbone.Chooser(@)
```
Backbone.Chooser will now give your models access to the following methods:

#### model.choose([options])
Chooses the model
* Sets the `chosen` attribute on the model to `true`.
* Triggers a custom `model:chosen` event. Pass `{silent: true}` to supress this.
* If this belongs to a collection, the collection will automatically be notified

#### model.unchoose([options])
Unchooses the model
* Sets the `chosen` attribute on the model to `false`
* Triggers a `model:unchosen` event. Pass `{silent: true}` to supress this.
* If this belongs to a collection, the collection will automatically be notified

#### model.isChosen()
returns boolean whether or not your model has been chosen

```coffee
model.isChosen() #=> false
model.choose()
model.isChosen() #=> true
```

#### model.toggleChosen()
Toggles between chosen and unchosen

```coffee
model.toggleChoose()
model.isChosen() #=> true
model.toggleChoose()
model.isChosen() #=> false
```

### Model Catalog of Events
Backbone.Chooser fires events in an easy to use order:

```coffee
model.on "all", (event) -> console.log event

model.choose()
#=> change:chosen
#=> change
#=> model:chosen

model.choose({silent: true})
#=> ...crickets...
```

If the model is part of a collection, then the collection will also fire its own events.  Read #collection catalog of events

## Collection Usage

### Collections
Collections can support either single choice or multi choice.

#### Single Choice

```coffee
class Collection extends Backbone.Collection
  initialize: ->
    new Backbone.SingleChooser(@)
```

#### Multi Choice

```coffee
class Collection extends Backbone.Collection
  initialize: ->
    new Backbone.MultiChooser(@)
```

## API
Backbone.Chooser works its magic....

## Building

* npm install -g gulp
* npm install
* gulp build
* profit

## Screencast
Want to see this this in action?  It's in Episode #08 of [BackboneRails.com - PlanetExpress](http://www.backbonerails.com/series/building_planet_express)
