import React, { useState, useEffect, useCallback, useReducer, useContext } from 'react';
import { Link } from "react-router-dom";
import { UserContext } from './App';

const url = "https://localhost:7022";
const apiPath = url + "/api/category";
const photoPath = url + "/img/content/";

function reducer(state, action) {
  switch (action.type) {
    case 'loadCategories': {
      return {
        ...state,
        categories: action.payload
      };
    }
    case 'deleteCategory': {
      let newState = { ...state };
      newState.categories.find(c => c.id === action.payload).deletedDt = new Date().toDateString();
      return newState;
    }
    case 'restoreCategory': {
      let newState = { ...state };
      newState.categories.find(c => c.id === action.payload).deletedDt = null;
      return newState;
    }
    default:
      return state;
  }
}

function Home() {
  const [state, dispatch] = useReducer(reducer, { categories: [] });
  const { user, token } = useContext(UserContext);

  useEffect(() => {
    if (state.categories.length === 0) {
      loadCategories();
    }
  }, []);

  const loadCategories = useCallback(() => {
    fetch(apiPath, {
      headers: (token ? { 'Authorization': `Bearer ${token.id}` } : {})
    })
    .then(r => r.json())
    .then(j => dispatch({ type: 'loadCategories', payload: j }));
  }, [token]);

  const editCardClick = useCallback((category) => {
    console.log(category);
  }, []);

  return (
    <div className="Home">
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {state.categories.map(c => (
          <CategoryCard key={c.id} category={c} dispatch={dispatch} editCardClick={editCardClick} />
        ))}
      </div>
      {user != null && user.role === "Admin" && <AdminCategoryForm reload={loadCategories} />}
    </div>
  );
}

function AdminCategoryForm(props) {
  const formSubmit = useCallback((e) => {
    e.preventDefault();
    const form = e.target;
    let formData = new FormData(form);
    fetch(apiPath, {
      method: 'POST',
      body: formData
    }).then(r => {
      if (r.status === 201) {
        props.reload();
      } else {
        r.text().then(alert);
      }
    });
  }, [props.reload]);

  return (
    <>
      <hr />
      <form id="category-form" method="post" encType="multipart/form-data" onSubmit={formSubmit}>
        <div className="row">
          <div className="col">
            <div className="input-group mb-3">
              <span className="input-group-text" id="category-name"><i className="bi bi-person-vcard"></i></span>
              <input type="text" className="form-control" placeholder="Назва" name="category-name"
                aria-label="Category Name" aria-describedby="category-name" />
              <div className="invalid-feedback">Ім'я не може бути порожнім</div>
            </div>
          </div>
          <div className="col">
            <div className="input-group mb-3">
              <span className="input-group-text" id="category-description"><i className="bi bi-file-text"></i></span>
              <input type="text" className="form-control" name="category-description" placeholder="Опис"
                aria-label="Description" aria-describedby="category-description" />
              <div className="invalid-feedback">Опис не може бути порожнім</div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="input-group mb-3">
              <span className="input-group-text" id="category-slug"><i className="bi bi-link"></i></span>
              <input type="text" className="form-control" placeholder="Slug" name="category-slug"
                aria-label="Category Slug" aria-describedby="category-slug" />
            </div>
          </div>
          <div className="col">
            <div className="input-group mb-3">
              <label className="input-group-text" htmlFor="category-photo"><i className="bi bi-image"></i></label>
              <input type="file" className="form-control" name="category-photo" id="category-photo" />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <button type="submit" className="btn btn-secondary" name="category-button" value="true">
              Зберегти
            </button>
          </div>
        </div>
        <input type="hidden" name="category-id" value="" />
      </form>
      <hr />
    </>
  );
}

function CategoryCard(props) {
  const { user, token } = useContext(UserContext);

  const delClick = useCallback(() => {
    if (window.confirm("Подтвердите удаление категории")) {
      fetch(`${apiPath}/${props.category.id}`, {
        method: 'DELETE',
        headers: (token ? { 'Authorization': `Bearer ${token.id}` } : {})
      })
      .then(r => {
        if (r.status < 400) {
          props.dispatch({ type: 'deleteCategory', payload: props.category.id });
        } else {
          alert("Ошибка удаления");
        }
      });
    }
  }, [props.category.id, props.dispatch, token]);

  const restoreClick = useCallback(() => {
    if (window.confirm("Подтвердите восстановление категории")) {
      fetch(`${apiPath}?id=${props.category.id}`, {
        method: 'PUT', // Исправлен метод на PUT для восстановления
        headers: (token ? { 'Authorization': `Bearer ${token.id}` } : {})
      })
      .then(r => {
        if (r.status < 400) {
          props.dispatch({ type: 'restoreCategory', payload: props.category.id });
        } else {
          alert("Ошибка восстановления");
        }
      });
    }
  }, [props.category.id, props.dispatch, token]);

  const editClick = useCallback(() => {
    props.editCardClick(props.category);
  }, [props.category, props.editCardClick]);

  return (
      <div>
        <div className={`card  ${props.category.deletedDt ? "card-deleted" : ""}`}>
          <Link to={"category/" + props.category.slug} className="CardRoom">
            <div className="card-img-top" style={{ backgroundImage: `url(${photoPath + props.category.photoUrl})` }}></div>
            <div className="card-body">
              {!!props.category.deletedDt && <i>Deleted {props.category.deletedDt}</i>}
              <h5 className="card-title">{props.category.name}</h5>
              <p className="card-text">{props.category.description}</p>
            </div>
          </Link>
          {user != null && user.role === "Admin" &&
            <div className="card-footer">
              {!!props.category.deletedDt ?
                <button className="btn btn-outline-danger" onClick={restoreClick}>Restore</button> :
                <button className="btn btn-outline-danger" onClick={delClick}>Del</button>
              }
              <button className="btn btn-outline-warning" onClick={editClick}>Edit</button>
            </div>
          }
        </div>
      </div>
  );
}



export default Home;
