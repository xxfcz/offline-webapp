(function () {

  // 'global' variable to store reference to the database
  var db, input;

  databaseOpen()
    .then(function () {
      console.log("The database has been opened");
      input = document.querySelector('input');
      document.body.addEventListener('submit', onSubmit);
    });

  function onSubmit(e) {
    e.preventDefault();
    var todo = { text: input.value, _id: String(Date.now()) };
    databaseTodosPut(todo)
      .then(function () {
        input.value = '';
      })
  }

  function databaseOpen() {
    return new Promise(function (resolve, reject) {
      var version = 2;
      var request = indexedDB.open('todos', version);

      // Run migrations if necessary
      request.onupgradeneeded = function (e) {
        db = e.target.result;
        e.target.transaction.onerror = reject;
        db.createObjectStore('todo', { keyPath: '_id' });
      };

      request.onsuccess = function (e) {
        db = e.target.result;
        resolve();
      };
      request.onerror = reject;
    });
  }

  // add todo item
  function databaseTodosPut(todo) {
    return new Promise(function (resolve, reject) {
      var transaction = db.transaction(['todo'], 'readwrite');
      var store = transaction.objectStore('todo');
      var request = store.put(todo);
      transaction.oncomplete = resolve;
      request.onerror = reject;
    });
  }

}());