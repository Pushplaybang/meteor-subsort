# what

This works by storing an array of objects on the user profile, each with an id reference to the doc in the other collection that we want, and an index property thats updated when re-ordering with drag and drop.  We then pass the user doc to the publish function, using the list of id's in the query, and use a transform function in a Meteor.publish function to apply the index from the object in this array to the matching document returned by the publish query.

example structure on the user document : 

````json
{
    "_id" : "ujvnKiTDTXEwieYQF",
    "profile" : {
        "myItems" : [ 
            {
                "id" : "zu8XpTnGoMNAtKX38",
                "index" : 1
            }, 
            {
                "id" : "v2jy8pfDhrt53xhE6",
                "index" : 4
            }, 
            {
                "id" : "tyH6zcJ3njguuRtKx",
                "index" : 5
            }, 
            {
                "id" : "XnnkNqADgr7RyuNMi",
                "index" : 6
            }, 
            {
                "id" : "Nu7fyntjsCuBWEA5r",
                "index" : 2
            }
        ]
    }
}
````