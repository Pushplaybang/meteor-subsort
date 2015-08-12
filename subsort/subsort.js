Items = new Meteor.Collection('items');

if (Meteor.isClient) {
  Session.setDefault('lastIndex', 1);

  /**
   * Setup out subscriptions passing the user to 
   * the 'myItems' subscription
   */
  Meteor.autorun(function() {
    var user = Meteor.user();
    Meteor.subscribe('myItems', user);
    Meteor.subscribe('items');
    Meteor.subscribe('user');
  });

  /**
   * Demo static list drag and drop to test the dragula lib
   */
  Template.staticList.onRendered(function() {
    dragula([document.querySelector('.staticlist')], {})
    .on('drop', function(el) {
      console.log($(el).prev('li')[0]);
      console.log($(el).next('li')[0]);
    });
  });

  /**
   * Return all Items
   */
  Template.items.helpers({
    items: function() {
      return Items.find({});
    }
  });

  /**
   * events to create a new item, add it to the user doc, 
   */

  Template.items.events({
    'submit #addone': function(e, t) {
      e.preventDefault();
      var title = t.find('.title').value;
      Meteor.call('createItem', title);
    },
    'click .add': function(e, t) {
      e.preventDefault();
      var id = this._id;
      var last  = Session.get('lastIndex');
      Session.set('lastIndex', (last * 2));
      var index = Session.get('lastIndex');
      Meteor.call('addToMyItems', id, index);
    },
    'click .remove': function(e, t) {
      e.preventDefault();
      var id = this._id;
      Meteor.call('removeItem', id);
    },
  });

  /**
   * When Rendereding the dynamic list which is filled by items added to the
   * myItems array on the user doc, initialize the dragula drag and drop, and also
   * setup an event callback to update the the index of the items when draging
   * and dropping.
   */
  Template.dynList.onRendered(function() {
    dragula([$('.dynlist')[0]], {})
    .on('drop', function(el) {
      if ($(el).prev('li')[0])  
        console.log(Blaze.getData($(el).prev('li')[0]));
      if ($(el).next('li')[0])
        console.log(Blaze.getData($(el).next('li')[0]));

      var id = Blaze.getData($(el)[0])._id;
      var before = $(el).prev('li')[0];
      var after = $(el).next('li')[0];
      var index = 0;

      if (!before && !after) { // its alone
        index = 10;
      } else if (!before && after) { // its the first
        index = Blaze.getData(after).index - 1;
      } else if (!after && before) { // its the last
        index = Blaze.getData(before).index + 1;
      } else { // its between items
        index = (Blaze.getData(after).index +
                               Blaze.getData(before).index) / 2;
      }

      Meteor.call('updateIndex', id, index);
    });
  });

  Template.dynList.helpers({
    items: function() {
      if (!Meteor.user())
        return;

      // var ids = _.pluck(Meteor.user().profile.myItems, 'id') || [];
      return Items.find({
        // _id: {$in: ids}
        dyn: 1
      }, {
        sort: {
          index: 1
        }
      });
    }
  });
  Template.dynList.events({});

  /**
   * When Items are rednered in the dynamic list, update the session var,
   * "lastIndex" with the highest index rendered
   */

  Template.ditem.onRendered(function() {
    if (this.index > Session.get('lastIndex')) {
      Session.set('lastIndex', this.index);
    }
  });

} // x

Meteor.methods({
  // Create new items
  createItem: function(title) {
    Items.insert({
      title: title
    });
  },

  // add items to the 
  addToMyItems: function(id, index) {
    if (Meteor.user()) {
      Meteor.users.update(Meteor.userId(), {
        $addToSet: {
          'profile.myItems': {
            id: id,
            index: index
          }
        }
      });
    }
  },
  updateIndex: function(id, index) {
    console.log(id);
    console.log(index);
    Meteor.users.update({
      _id: this.userId,
      'profile.myItems.id': id
    }, {
      $set: {
        'profile.myItems.$': {
          id: id,
          index: index
        }
      }
    });
  }

});

if (Meteor.isServer) {
  Meteor.publish('user', function() {
    return Meteor.users.find({}, {
      fields: {
        profile: 1,
        items: 1
      }
    });
  });

  Meteor.publish('items', function() {
    return Items.find({});
  });

  Meteor.publish('myItems', function(user) {
    if (!user)
      return false;
    var self = this;

    // add non DB properties to the returned docs
    var transform = function(doc) {
      // find the index in the user doc, for the curent doc id
      var ref = _.find(user.profile.myItems, function(x) {
        return x.id == doc._id;
      });

      doc.index = ref.index;
      doc.dyn = 1;
      return doc;
    };

    // may be able to avoid passing in the WHOLE user obj, - need to test
    var ids = user.profile.myItems ? _.pluck(user.profile.myItems, 'id') : [];

    var myItems = Items.find({
      _id: {$in: ids}
    }).observe({
      added: function(doc) {
        self.added('items', doc._id, transform(doc));
      },
      changed: function(doc, oldDoc) {
        self.changed('items', oldDoc._id, transform(doc));
      }, 
      removed: function(doc) {
        self.remove('items', doc._id);
      }
    });

    this.onStop(function() {
      myItems.stop();
    });

    this.ready();

  });
}
