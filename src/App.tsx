import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [newTodoContent, setNewTodoContent] = useState(""); 
  const [editTodoId, setEditTodoId] = useState<string | null>(null); 
  const [updatedContent, setUpdatedContent] = useState(""); 
  const [isFormVisible, setIsFormVisible] = useState(false); 
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  async function createTodo(e: React.FormEvent) {
    e.preventDefault(); 
    if (newTodoContent.trim()) {
      await client.models.Todo.create({ content: newTodoContent });
      setNewTodoContent(""); 
      setIsFormVisible(false); 
    }
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  function startEdit(todoId: string, currentContent: string) {
    setEditTodoId(todoId);
    setUpdatedContent(currentContent);
  }

  async function updateTodo(e: React.FormEvent) {
    e.preventDefault();
    if (updatedContent.trim() && editTodoId) {
      await client.models.Todo.update({ id: editTodoId, content: updatedContent });
      setEditTodoId(null); 
      setUpdatedContent(""); 
    }
  }

  function getUsernameFromEmail(email) {
    email = email.split('@')[0]
    return email.charAt(0).toUpperCase() + email.slice(1)
  }  

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>{getUsernameFromEmail(user?.signInDetails?.loginId)}'s todos</h1>
        <button style={{ marginLeft: '0.5rem'}} onClick={signOut}>Sign out</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My todos</h1>
        <button onClick={() => setIsFormVisible(!isFormVisible)}>
          {isFormVisible ? 'Hide Form' : '+'} 
        </button> 
      </div>

      {isFormVisible && (
        <form onSubmit={createTodo} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Enter new todo..." 
            value={newTodoContent} 
            onChange={(e) => setNewTodoContent(e.target.value)} 
            style={{ marginRight: '0.5rem' }}
          />
          <button style={{ backgroundColor: 'blue'}} type="submit">Save Todo</button>
        </form>
      )}

      <ul>
        {todos.map((todo) => (
          <li
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}
            key={todo.id}
          >
            {editTodoId === todo.id ? (
              <form onSubmit={updateTodo} style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  type="text" 
                  value={updatedContent} 
                  onChange={(e) => setUpdatedContent(e.target.value)} 
                />
                <button type="submit">Update</button>
                <button type="button" onClick={() => setEditTodoId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                {todo.content}
                <div style={{ marginLeft: '0.5rem'}}>
                  <button style={{ marginRight: 5 }} onClick={() => startEdit(todo.id, todo.content)}>Edit</button>
                  <button  style={{ backgroundColor: 'red' }} onClick={() => deleteTodo(todo.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
