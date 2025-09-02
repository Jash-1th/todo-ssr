// Simple in-memory storage abstraction. Could be replaced by a DB later.
export class InMemoryTodoStorage {
  constructor(initialTodos = []) {
    this.todos = [...initialTodos];
  }

  getAll() {
    return [...this.todos];
  }

  setAll(newTodos) {
    this.todos = [...newTodos];
  }
}


