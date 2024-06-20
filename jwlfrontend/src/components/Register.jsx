import React from 'react'
import { useState } from 'react'
import axios from 'axios'

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleUsername = (e) => {
    setUsername(e.target.value);
  }
  const handlePassword = (e) => {
    setPassword(e.target.value);
  }
  const handleSubmit = () => {
    const data = new FormData();
    data.append('username', username);
    data.append('password', password);
    try {
      const res = axios.post('http://localhost:3001/register', data);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <>
      <div className='d-flex flex-column justify-content-center align-items-center'>
        <h1>Register</h1>
        <div className='d-flex flex-column col-3'>
          <label htmlFor='username'>Username</label>
          <input id="username" type="text" onChange={handleUsername} />
        </div>
        <div className='d-flex flex-column mt-4 col-3'>
          <label htmlFor='password'>Password</label>
          <input id="password" type="password" onChange={handlePassword}/>
        </div>
        <div>
          <button onClick={handleSubmit}>Register</button>
        </div>
      </div>
    </>
  )
}
