import React, { useMemo, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function TodoForm({ onAdd }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <form className="d-flex gap-2" onSubmit={handleSubmit}>
      <input
        className="form-control"
        placeholder="Add a todo"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-primary" type="submit">Add</button>
    </form>
  );
}

function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (!trimmed) return setIsEditing(false);
    onEdit(todo.id, trimmed);
    setIsEditing(false);
  };

  return (
    <li className="list-group-item d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        {isEditing ? (
          <input
            className="form-control"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        ) : (
          <span className={todo.completed ? 'text-decoration-line-through text-muted' : ''}>
            {todo.text}
          </span>
        )}
      </div>
      <div className="d-flex gap-2">
        {isEditing ? (
          <button className="btn btn-sm btn-success" onClick={handleSave}>Save</button>
        ) : (
          <button className="btn btn-sm btn-secondary" onClick={() => setIsEditing(true)}>Edit</button>
        )}
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(todo.id)}>Delete</button>
      </div>
    </li>
  );
}

function TodoList({ todos, onToggle, onEdit, onDelete }) {
  return (
    <ul className="list-group">
      {todos.map((t) => (
        <TodoItem
          key={t.id}
          todo={t}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />)
      )}
    </ul>
  );
}

export function App({ initialData }) {
  const initialTodos = useMemo(() => {
    const list = initialData?.todos || [];
    return list.map((t) => ({ ...t }));
  }, [initialData]);

  const [todos, setTodos] = useState(initialTodos);

  // Ensure hydration sync: if window.__INITIAL_DATA__ exists and differs, adopt it (CSR nav)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.todos) {
      setTodos(window.__INITIAL_DATA__.todos.map((t) => ({ ...t })));
    }
  }, []);

  const addTodo = useCallback((text) => {
    setTodos((prev) => {
      const id = prev.length ? Math.max(...prev.map((t) => t.id)) + 1 : 1;
      return [...prev, { id, text, completed: false }];
    });
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const editTodo = useCallback((id, text) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-4">SSR Todo App</h1>
      <div className="card">
        <div className="card-body">
          <TodoForm onAdd={addTodo} />
        </div>
      </div>
      <div className="mt-3">
        <TodoList todos={todos} onToggle={toggleTodo} onEdit={editTodo} onDelete={deleteTodo} />
      </div>
    </div>
  );
}


