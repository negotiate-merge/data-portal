import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import Router from "./Router";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
const today = new Date().toDateString();
const lastvisit = localStorage.getItem("lastVisitDate");

if (lastvisit !== today) {
  localStorage.clear();
  localStorage.setItem("lastVisitDate", today);
}

root.render(
  <BrowserRouter>
    <Router />
  </BrowserRouter>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
