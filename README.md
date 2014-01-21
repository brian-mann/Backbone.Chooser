# Backbone.Chooser
Track your **selected**, aka **chosen** models and collections with ease.

### Models
You can `choose` or `unchoose` your models, and receive easy-to-use events.

### Collections
Allow for tracking and managing which models have been `chosen`.  Simple configuration allows collections to automatically behave as **single** choice or **multiple** choice collections.

### Use Case
* Navigation - tracking the chosen tab
* Lists - tracking the chosen list item
* Forms - tracking multiple chosen items

## The Pitch
You've probably written it a dozen times in a dozen different ways - tracking a "selected" state of your models, or knowing which model within a collection is "selected".  This plugin takes the basic idea from [Derick Bailey's - Backbone.Picky](https://github.com/derickbailey/backbone.picky) but improves the API and events.

### Key Improvements
* Non conflicting method names and attributes
* `select()` and `pick()` are underscore methods which are mixed into collections and models.  This plugin works around that by referring to attributes and methods as `chosen` and `choose()`
* Only the callable methods are mixed into your objects - so they won't be polluted with unnecessary internals
* More consistent return of the chosen models by your collections
* Better events which are more clearly named, prefixed, and easier to work with
* Less chance of inconsistencies between events emitted and the internal state of your collections

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

### Model - Catalog of Events
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

#### Notes
* If the model is already chosen or unchosen and you call the same method, this will result in a noop and will not fire any events.
* If the model is part of a collection, then the collection will be notified and also fire its own events.  Read #collection catalog of events

## Collection Usage

### Collections
Collections can support either single choice or multi choice.

#### Single Choice Usage

```coffee
class Collection extends Backbone.Collection
  initialize: ->
    new Backbone.SingleChooser(@)
```
A single choice collection will only ever hold 1 chosen model at the same time.  Choosing a different model will thus unchoose the first.

#### collection.choose(model, [options])
Chooses the model - silence all events by passing {silent: true} as options
* First removes any currently `chosen` model by calling model.unchoose()
* Next it calls the `choose` method directly on the passed in model
* This stores the model internally as the currently `chosen` model
* Fires a `collection:chose:one` event, passing the model as the event argument

#### collection.unchoose(model, [options])
Unchooses the model - silence all events by passing {silent: true} as options
* Calls `unchosen` directly on the model
* Fires a `collection:unchose:one` event

#### collection.getChosen()
This will return an **array** of chosen models, even though a SingleChoice collection will only ever store one model.  As weird as this sounds, it makes your life much easier.  Your controllers / views won't have to know whether your collection is single or multi - you can always expect back an array.

#### collection.getFirstChosen()
This will return the first chosen model instead of an array.

#### collection.chooseById(id, [options])
* Finds the model by its id and calls `model.choose()` on it
* Convenience method so you don't have to have a direct reference to your model

### Single Choice Collection - Catalog of Events
Backbone.Chooser fires events in a logical order.

```coffee
collection.on "all", (event, arg) -> console.log event, arg

collection.choose(model)
#=> change:chosen
#=> change
#=> model:chosen
#=> collection:chose:one, model

collection.choose(model, {silent: true})
#=> ...crickets...

collection.on "collection:chose:one", (model) ->
  ## receive the model that was chosen
  console.log "model was chosen: ", model

  ## the collections internal reference to the
  ## chosen model is accurate as well
  console.log collection.getFirstChosen() is model #=> true
```

* Event order is key here - make sure you're listening to collection events instead of model events
* Model change events will trigger prior to the collection having internally changed its reference to the chosen model
* This means if you listen to the model on "change:chosen" and then ask the collection which model is chosen, you'll get a different model

#### Notes
* Intelligent no-op's will occur when you try to `choose` an already chosen model, or `unchoose` a model that isn't chosen
* Why do the collections receive the events from the model? [Backbone Collections](http://backbonejs.org/#Collection) do by design.

#### Multi Choice Usage

```coffee
class Collection extends Backbone.Collection
  initialize: ->
    new Backbone.MultiChooser(@)
```

A multi choice collection has the ability to hold a reference to multiple chosen models.

#### collection.choose(models, [options])
Will choose all of the passed in models - silence all events by passing {silent: true} as options

Supports an array of models or unlimited arguments, and is intelligent enough to figure out if options are present or not

```coffee
  ## passing multiple arguments with options
  collection.choose(model1, model2, model, {silent: true})

  ## passing an array of models without options
  collection.choose([model1, model, model3])
```

* Calls the `choose` method directly on each of the passed in models
* Fires a single `collection:chose:all` event if **all** of the models in the collection are also chosen
* Fires a single `collection:chose:some` event if only a portion of the models are chosen
* Passes an array of the currently chosen models as the event argument

#### collection.unchoose(models, [options])
Will unchoose all of the passed in models - silence all events by passing {silent: true} as options

Supports an array of models or unlimited arguments, and is intelligent enough to figure out if options are present or not

```coffee
  ## passing multiple arguments with options
  collection.unchoose(model1, model2, model, {silent: true})

  ## passing an array of models without options
  collection.unchoose([model1, model, model3])
```

* Calls the `unchoose` method directly on each of the passed in models
* Fires a single `collection:unchose:none` event if no models are chosen
* Fires a single `collection:unchose:some` event if only a portion of the models are chosen

#### collection.chooseAll([options])
Automatically chooses all of the models in the collection
* Calls the `choose` method directly on each of the passed in models
* Fires a single `collection:chose:all` event, pass {silent: true} to suppress
* Passes an array of the currently chosen models as the event argument

#### collection.chooseNone([options])
Automatically unchooses all of the chosen models
* Calls the `unchoose` method directly on each of the passed in models
* Fires a single `collection:chose:none` event, pass `{silent: true}` to suppress

#### collection.chooseByIds(ids, [options])
Accepts an **array** of ids only!
* Loops through each id, finds the model by its id, and calls `choose` on it directly
* Passing `{chooseNone: true}` will first remove all chosen models, and then choose them by each id

#### collection.getChosen()
This will return an **array** of the chosen models.

#### collection.getFirstChosen()
This will return the first chosen model instead of the full array.

### Multi Choice Collection - Catalog of Events
This follows the same event pattern as single chooser with one notable difference.


```coffee
## all 3 of these events return an array of chosen models
## TODO: add a "collection:chose:any" event which fires regardless of the number of chosen models
collection.on "collection:chose:none collection:chose:some collection:chose:all", (models) ->
  ## the multi chooser will return an array
  ## of chosen models instead of just the first
  console.log "all of the chosen models are: ", models
```

#### Notes
* Same intelligent no-ops and event triggering as SingleChooser

## Where are the tests?
I have them, I promise, just haven't converted them outside of a Rails app yet.... yes I know...

## Building
* npm install -g gulp
* npm install
* gulp build
* profit

## Screencast
Want to see this this in action?  It's in Episode #08 of [BackboneRails.com - PlanetExpress](http://www.backbonerails.com/series/building_planet_express)
