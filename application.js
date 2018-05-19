(function () {

  // 'global' variable to store reference to the database
  var db, input, ul;

  databaseOpen()
    .then(function () {
      console.log("The database has been opened");
      input = document.querySelector('input');
      ul = document.querySelector('ul');
      document.body.addEventListener('submit', onSubmit);
    })
    .then(refreshView)
    ;

  function onSubmit(e) {
    e.preventDefault();
    var todo = { text: input.value, _id: String(Date.now()) };
    databaseTodosPut(todo)
      .then(function () {
        input.value = '';
      })
      .then(refreshView);
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

  // retrieve all todo items
  function databaseTodosGet() {
    return new Promise(function (resolve, reject){
      var transaction = db.transaction(['todo'], 'readonly');
      var store = transaction.objectStore('todo');
      // Get everything in the store
      var keyRange = IDBKeyRange.lowerBound(0);
      var cursorRequest = store.openCursor(keyRange);
      // This fires once per row in the store, so for simplicity collect the data
      // in an array (data) and send it pass it in the resolve call in one go
      var data = [];
      cursorRequest.onsuccess = function(e){
        var result = e.target.result;
        // If there's data, add it to array
        if(result){
          data.push(result.value);
          result.continue();
        }else{
          // Reach the end of the data
          resolve(data);
        }
      };

      cursorRequest.onerror = reject;
    });
  }

  function refreshView() {
    return databaseTodosGet().then(renderAllTodos);
  }

  function renderAllTodos(todos) {
    var html = '';
    todos.forEach(function(todo) {
      html += todoToHtml(todo);
    });
    ul.innerHTML = html;
  }

  function todoToHtml(todo) {
    return '<li>'+todo.text+'</li>';
  }

}());