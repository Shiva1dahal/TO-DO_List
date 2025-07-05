class TodoApp {
  constructor() {
    this.todos = this.loadTodos()
    this.currentFilter = 'all'
    this.init()
  }

  init() {
    this.bindEvents()
    this.render()
  }

  bindEvents() {
    // Form submission
    document.getElementById('todo-form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.addTodo()
    })

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter)
      })
    })

    // Clear completed button
    document.getElementById('clear-completed').addEventListener('click', () => {
      this.clearCompleted()
    })

    // Todo list event delegation
    document.getElementById('todo-list').addEventListener('click', (e) => {
      const todoId = e.target.closest('.todo-item')?.dataset.id
      if (!todoId) return

      if (e.target.classList.contains('todo-checkbox')) {
        this.toggleTodo(todoId)
      } else if (e.target.classList.contains('delete-btn')) {
        this.deleteTodo(todoId)
      }
    })

    // Edit todo on double click
    document.getElementById('todo-list').addEventListener('dblclick', (e) => {
      if (e.target.classList.contains('todo-text')) {
        this.editTodo(e.target)
      }
    })
  }

  //Input
  addTodo() {
    const input = document.getElementById('todo-input')
    const text = input.value.trim()
    
    if (!text) return

    const todo = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    }

    this.todos.push(todo)
    this.saveTodos()
    this.render()
    input.value = ''
    
    // Add subtle animation
    setTimeout(() => {
      const todoElement = document.querySelector(`[data-id="${todo.id}"]`)
      if (todoElement) {
        todoElement.classList.add('todo-added')
      }
    }, 50)
  }

  toggleTodo(id) {
    this.todos = this.todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
    this.saveTodos()
    this.render()
  }

  deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`)
    if (todoElement) {
      todoElement.classList.add('todo-removing')
      setTimeout(() => {
        this.todos = this.todos.filter(todo => todo.id !== id)
        this.saveTodos()
        this.render()
      }, 300)
    }
  }

  editTodo(textElement) {
    const todoItem = textElement.closest('.todo-item')
    const todoId = todoItem.dataset.id
    const currentText = textElement.textContent

    const input = document.createElement('input')
    input.type = 'text'
    input.value = currentText
    input.className = 'todo-edit-input'
    input.maxLength = 100

    const saveEdit = () => {
      const newText = input.value.trim()
      if (newText && newText !== currentText) {
        this.todos = this.todos.map(todo => 
          todo.id === todoId ? { ...todo, text: newText } : todo
        )
        this.saveTodos()
      }
      this.render()
    }

    const cancelEdit = () => {
      this.render()
    }

    input.addEventListener('blur', saveEdit)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveEdit()
      } else if (e.key === 'Escape') {
        cancelEdit()
      }
    })

    textElement.replaceWith(input)
    input.focus()
    input.select()
  }

  setFilter(filter) {
    this.currentFilter = filter
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter)
    })
    
    this.render()
  }

  clearCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed)
    this.saveTodos()
    this.render()
  }

  getFilteredTodos() {
    switch (this.currentFilter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed)
      case 'completed':
        return this.todos.filter(todo => todo.completed)
      default:
        return this.todos
    }
  }

  render() {
    const filteredTodos = this.getFilteredTodos()
    const todoList = document.getElementById('todo-list')
    const emptyState = document.getElementById('empty-state')
    const todoCount = document.getElementById('todo-count')
    const clearBtn = document.getElementById('clear-completed')

    // Show/hide empty state
    if (this.todos.length === 0) {
      emptyState.style.display = 'block'
      todoList.style.display = 'none'
    } else {
      emptyState.style.display = 'none'
      todoList.style.display = 'block'
    }

    // Render todos
    todoList.innerHTML = filteredTodos.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <div class="todo-content">
          <label class="todo-checkbox-label">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="checkmark"></span>
          </label>
          <span class="todo-text" title="Double-click to edit">${this.escapeHtml(todo.text)}</span>
        </div>
        <button class="delete-btn" title="Delete task">
          <span class="delete-icon">×</span>
        </button>
      </li>
    `).join('')

    // Update stats
    const activeTodos = this.todos.filter(todo => !todo.completed).length
    const completedTodos = this.todos.filter(todo => todo.completed).length
    todoCount.textContent = `${activeTodos} ${activeTodos === 1 ? 'task' : 'tasks'} remaining`

    // Show/hide clear button
    clearBtn.style.display = completedTodos > 0 ? 'block' : 'none'
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  loadTodos() {
    try {
      const saved = localStorage.getItem('todos')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Error loading todos:', error)
      return []
    }
  }

  saveTodos() {
    try {
      localStorage.setItem('todos', JSON.stringify(this.todos))
    } catch (error) {
      console.error('Error saving todos:', error)
    }
  }
}

// Initialize the app
new TodoApp()