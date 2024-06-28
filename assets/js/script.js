import Airtable from "airtable";

var base = new Airtable({
  apiKey:
    "pat9u8gMXhzPwjxj2.47ee096b8b6bba92b89091cbd0712b72b800030b8b3f099be990dfa6cbb83c3a",
}).base("app1oRI8VTrCdu1ku");

function updateTodo(toDo)  {
  base('ToDos').update([toDo])
}


function getMyTodos(limit=undefined){
  base("ToDos")
    .select({
      fields: ["ToDo", "Completed", "CreatedAt"],
      view: "Grid view",
      ...(limit !== undefined ? {maxRecords: limit} : {}), 
      sort: [{field: "CreatedAt", direction: limit !== undefined ? "desc" : "asc"}]
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        const myTaskList = document.getElementById("my-task-list");
  
        console.log(records);
  
        records.forEach(function (record) {
          const listItem = document.createElement("li");
          listItem.classList.add("list-group-item");
  
          const inputElement = document.createElement("input");
          inputElement.classList.add("form-check-input");
          inputElement.classList.add("me-1");
          inputElement.name = `${record.id}`;
          inputElement.type = "checkbox";
          inputElement.checked = record.fields.Completed === 0 ? "" : "checked";
          inputElement.id = `${record.id}`;

          inputElement.addEventListener("change", (e) => {
            updateTodo({
              id: e.target.id,
              fields: {
                Completed: e.target.checked ? 1 : 0
              }
            })
          })
  
          const labelElement = document.createElement("label");
          labelElement.classList.add("form-check-label");
          labelElement.htmlFor = `${record.id}`;
          labelElement.innerText = `${record.fields.ToDo} - (${(new Date(record.fields.CreatedAt))?.toLocaleDateString()} at ${(new Date(record.fields.CreatedAt))?.toLocaleTimeString()})`;
  
          listItem.append(inputElement);
          listItem.append(labelElement);
  
          myTaskList.append(listItem);
        });
  
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        // fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

getMyTodos()



const todoForm = document.getElementById("todoForm");

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const todoInput = e.target.todo.value;

  let isToDoValid = false;

  if (todoInput !== "" && todoInput?.length > 8 && todoInput?.length < 60) {
    isToDoValid = true;
  }

  if (isToDoValid) {
    fetch(
      `https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzMzA0Mzc1MjY0NTUzNjUxMzMi_pc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          todo: todoInput,
          completed: false,
        }),
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.status === "success") {
          todoForm.reset();
          setTimeout(() => {
            getMyTodos(1)
          }, 4000);
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }
});
