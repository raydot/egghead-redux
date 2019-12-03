// Extracting and refactoring.

// Renders a single list item
const todo = ( state, action ) => {
    switch (action.type) {
      case 'ADD_TODO':
        return {
          id: action.id,
          text: action.text,
          completed: false
        };
      case 'TOGGLE_TODO':
        if (state.id !== action.id) {
          return state;
        }
          return {
            ...state,
            completed: !state.completed
          }
      default:
        return state
    }
  }
  
  // todos reducer
  const todos = (state = [], action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return [
          ...state, // return array with all items + new
          todo(undefined, action) // calls child reducers
        ]
        case 'TOGGLE_TODO':
          return state.map(t => todo(t, action))
        default:
          return state;
    }
  };
  
  const visibilityFilter = (
    state = 'SHOW_ALL',
    action
  ) => {
    switch (action.type) {
      case 'SET_VISIBILITY_FILTER':
        return action.filter;
      default:
        return state;
    }
  }
  
  const { combineReducers } = Redux
  
  // This is the root reducer
  const todoApp = combineReducers({
    todos,
    visibilityFilter
  })
  
  const { createStore } = Redux
  
  // combined reducer
  const store = createStore(todoApp)
  
  const { Component } = React
  
  // react presentational component for utilizing visibility filter
const FilterLink = ({
    filter,
    currentFilter,
    children,
    onClick
}) => {
    if (filter === currentFilter) {
        return (
            <span>{children}</span>
        );
    }

    return (
        <a href='#'
            onClick={e => {
                e.preventDefault();
                onClick(filter)
            }}
        >
            {children}
        </a>
    )
}
  
const Footer = ({ 
    visibilityFilter,
    onFilterClick
}) => (
    <p>
        Show:
        {' '}
        <FilterLink 
            filter='SHOW_ALL' 
            currentFilter={visibilityFilter}
            onClick={onFilterClick}    
        >
            All
        </FilterLink>
        {', '}
        <FilterLink 
            filter='SHOW_ACTIVE'
            currentFilter={visibilityFilter}
            onClick={onFilterClick}
        >
            Active
        </FilterLink>
        {', '}
        <FilterLink 
            filter='SHOW_COMPLETED'
            currentFilter={visibilityFilter}
            onClick={onFilterClick}
        >
            Completed
        </FilterLink>
    </p>
);
  
// Purely presentational Todo component
const Todo = ({
    onClick,
    completed,
    text,
    id
}) => (
    <li
        onClick={onClick}
        style={{
            textDecoration:
                completed ?
                'line-through' :
                'none'
        }}
    >
    {id}: {text}
    </li>
);
  
  // Purely presentational TodoList
  const TodoList = ({
    todos,
    onTodoClick
  }) => (
  <ul>
    {todos.map(todo =>
       <Todo
         key={todo.id}
         {...todo}
        onClick={() => onTodoClick(todo.id)}
        />
     )}
  </ul>
);
  
// Purely presentational AddTodo
const AddTodo = ({
  onAddClick
}) => {
  let input;
  
  return (
    <div>
        <input ref={node => {
          input = node;
          }} />
          <button onClick = {() => {
            onAddClick(input.value);
            input.value='';
          }}>
        Add Todo
       </button>
     </div>
  );
};

const getVisibleTodos = (
    todos,
    filter
) => {
    switch (filter) {
        case 'SHOW_ALL':
            return todos;
        case 'SHOW_COMPLETED':
            return todos.filter(
                t => t.completed
            );
        case 'SHOW_ACTIVE':
            return todos.filter(
                t => !t.completed
            );
    }
}
  
let nextTodoId = 0;

 // With the refactor of TodoList, AddTodo, and Footer, TodoApp() this is now acting as a container component.
const TodoApp =({
    todos,
    visibilityFilter
}) => (
    <div>
        <AddTodo
            onAddClick={text =>
                store.dispatch({
                    type: 'ADD_TODO',
                    id: nextTodoId++,
                    text
                })
            }
        />
        <TodoList
            todos = {
                getVisibleTodos(
                    todos,
                    visibilityFilter
                )
            }
            onTodoClick = {id =>
                store.dispatch({
                    type: 'TOGGLE_TODO',
                    id
                })
            } 
        />
        <Footer
            visibilityFilter={visibilityFilter}
            onFilterClick={filter =>
                store.dispatch({
                    type: 'SET_VISIBILITY_FILTER',
                    filter
                })
            }
        />
    </div>
);
  
const render = () => {
    ReactDOM.render(
        // passes to component as prop, every state filled in inside the state object.
        <TodoApp 
            {...store.getState()} 
        />,
        document.getElementById('root')
    )
}

store.subscribe(render) // runs on any state change
render()