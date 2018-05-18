(function() {
    var db;
  
    databaseOpen()
      .then(function() {
        alert("The database has been opened");
      });
  
    function databaseOpen() {
      return new Promise(function(resolve, reject) {
        var version = 1;
        var request = indexedDB.open('todos', version);
        request.onsuccess = function(e) {
          db = e.target.result;
          resolve();
        };
        request.onerror = reject;
      });
    }
  
  }());