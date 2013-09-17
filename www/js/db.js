
var todoDB = (function() {
    var myDB = {};
    var datastore = null;

    myDB.open = function(callback) {
        var version = 1;
        var request = indexedDB.open('RSS', version);
        request.onupgradeneeded = function(e) {
            console.log("running onupgradeneeded");
            var db = e.target.result;
            e.target.transaction.onerror = myDB.onerror;
            if (db.objectStoreNames.contains('feed')) {
                db.deleteObjectStore('feed');
            }
            var store = db.createObjectStore('feed', {
                keypath: 'id',
                autoIncrement : true
            });
            store.createIndex("title","title",{unique:flase});
        };
        request.onsuccess = function(e){
            datastore = e.target.result;            
            callback();
        };
        request.onerror = myDB.onerror; 
   };
     
   myDB.fetchFeeds = function(callback){
       var db = datastore;
       var transaction = db.transaction (['feed'],'readwrite');
       var objStore = transaction.objectStore('feed');       
       var keyrange = IDBKeyRange.lowerBound(0);
       var cursorRequest = objStore.openCursor(keyrange);       
       var feeds = [];       
       transaction.oncomplete = function(e){
           callback(feeds);
       };
       cursorRequest.onsuccess = function(e){
           var result = e.target.result;           
           if(!!result == false){
               return;
       }
       feeds.push(result.value);
       result.continue();
       };
       cursorRequest.onerror = mtDB.onerror;
   };
   
   
   myDB.createFeed = function(title, description, date, callback){
       var db = datastore;
       var transaction = db.transaction(['feed'],'readwrite');
       var objStore = transaction.objectStore('feed');
       //var timestamp = new Date().getTime();
       
       var feed = {
           'title': title, 
           'description':description, 
           'date' :date
       };
       
       var request = objStore.put(feed);
       request.onsuccess = function (e){
           callback(feed);
       };
       request.onerror = myDB.onerror;
   };
});