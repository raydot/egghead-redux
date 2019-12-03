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
  
  // react component for utilizing visibility filter
  const FilterLink = ({
    filter,
    currentFilter,
    children
  }) => {
    if (filter === currentFilter) {
      return <span>{children}</span>;
    }
    
    return (
      <a href='#'
        onClick={e => {
          e.preventDefault();
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter
          });
      }}
      >
          {children}
      </a>
    )
  }
  
  // Refactored Todo Component to make it purely presentational
  const Todo = ({
    onClick, // Don't have to do this, but it's convenient
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
      }}>
    {id}: {text}
    </li>
  );
  
  // Purely presentational
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
  class TodoApp extends Component {
    render() {
      const { // destructure from the props
        todos,
        visibilityFilter
      } = this.props;
      
      const visibleTodos = getVisibleTodos(
        todos,
        visibilityFilter
      );
      return (
        <div>
          <input ref={node => {
            this.input = node
          }} />
          <button onClick = {() => {
            store.dispatch({ // initiate state change
              type: 'ADD_TODO',
              text: this.input.value,
              id: nextTodoId++
            })
            this.input.value=''
          }}>
            Add Todo
           </button>
            <TodoList
              todos = {visibleTodos}
              onTodoClick = {id =>
                store.dispatch({
                   type: 'TOGGLE_TODO',
                   id
                  })
              } />
            <p>
              Show:
              {' '}
              <FilterLink 
                filter='SHOW_ALL' 
                currentFilter={visibilityFilter}>
                  All
              </FilterLink>
              {' '}
              <FilterLink 
                filter='SHOW_ACTIVE'
                currentFilter={visibilityFilter}>
                  Active
              </FilterLink>
              {' '}
              <FilterLink 
                filter='SHOW_COMPLETED'
                currentFilter={visibilityFilter}>
                  Completed
               </FilterLink>
             </p>
        </div>
      );
    }
  }
  
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