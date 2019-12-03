// So the downside of putting all of the reducers into the container is that we have to pass a lot of props around.  Let's see if we can't do better!

// Notice, for instance, visibilityFilter => currentFilter, all over the place.  Parents need to know to much about what children need so it breaks encapsulation.

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

const Link = ({
    active,
    children,
    onClick
}) => {
    if (active) {
        return <span>{children}</span>;
    }

    return (
        <a href='#'
            onClick={e => {
                e.preventDefault();
                onClick()
            }}
        >
            {children}
        </a>
    );
};


// container to provide data and behavior to presentational component
class FilterLink extends Component {
  componentDidMount() {
    // Unsubscribe() is returned by subscribe()
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate()
     );
  }
  
  componentWillUnmount() {
    this.unsubscribe();
  }
  
  render() {
    const props = this.props;
    const state = store.getState();
    
    // delegate rendering to presentational component.
    return (
      <Link
        active={
           props.filter ===
           state.visibilityFilter
        }
        onClick = {() =>
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter
          })
        }
      >
       {props.children}
      </Link>
    ); //return
  }
}
 
// Container component
const Footer = () => (
    <p>
        Show:
        {' '}
        <FilterLink 
            filter='SHOW_ALL'  
        >
            All
        </FilterLink>
        {', '}
        <FilterLink 
            filter='SHOW_ACTIVE'
        >
            Active
        </FilterLink>
        {', '}
        <FilterLink 
            filter='SHOW_COMPLETED'
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
        <Footer />
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