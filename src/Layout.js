import { Outlet, Link } from "react-router-dom";
import { UserContext } from './App';
import { useEffect, useCallback, useContext, useRef, useState } from "react";
const url = "https://localhost:7022";
const avatarPath = url + "/img/Avatars/";

const Layout = () => {
  const { user, setUser } = useContext(UserContext);

  const logOut = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
  });

  useEffect(() => {
    const handleScroll = () => {
      const parallax = document.querySelector('.parallax');
      const scrolled = window.scrollY;
      parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="parallax"></div>
      <nav className="navbar navbar-expand-md navbar-light bg-none">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/"><img className="logo" src="/img/logo.png" alt="logo" /></Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup"></div>
          {!!user && <>
            <img src={avatarPath + (user.avatarUrl ?? "no-avatar.png")} alt="avatar" className="size-40 rounded-circle" />
            <button type="button" className="btn btn-outline-secondary" onClick={logOut}><i className="bi bi-box-arrow-right"></i></button>
          </>}
          {!!user || <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#authModal"><i className="bi bi-person-check-fill"></i></button>}
          {!!user || <button type="button" className="btn" data-bs-toggle="modal" data-bs-target="#RegModal"><i className="bi bi-person-plus"></i></button>}
        </div>
      </nav>
      <div className="sub-header">
      </div>
      <div className="container">
        <Outlet />
      </div>
      <div className="spacer"></div>
      <footer>
        &copy;2024 - It Step
      </footer>
      <AuthModal />
      <RegModal />
    </>
  );
};

function AuthModal() {
  const { setUser, setToken } = useContext(UserContext);
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [errorMessage, setErrorMessage] = useState("");
  const closeButtonRef = useRef();

  const onEmailChange = e => setEmail(e.target.value);
  const onPasswordChange = e => setPassword(e.target.value);

  const authClick = () => {
    if (email === "") {
      setErrorMessage("Email must be filled!");
      return;
    }
    if (password === "") {
      setErrorMessage("Password must be filled!");
      return;
    }
    fetch(`${url}/api/auth/token?email=${email}&password=${password}`)
      .then(r => {
        if (r.status !== 200) {
          setErrorMessage("Вхід скасовано, перевірте введені дані");
        } else {
          setErrorMessage("");
          closeButtonRef.current.click();
          r.json().then(j => {
            if (j.user) {
              setUser(j.user);
              window.localStorage.setItem('user', JSON.stringify(j.user));
              delete j.user;
            }
            setToken(j);
            if (j) {
              window.localStorage.setItem('token', JSON.stringify(j));
            }
          });
        }
      });
  };

  return (
    <div className="modal fade" id="authModal" tabIndex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="authModalLabel">Вхід</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" ref={closeButtonRef}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="input-group mb-3">
                <span className="input-group-text" id="auth-email-icon"><i className="bi bi-envelope-at"></i></span>
                <input type="text" className="form-control" placeholder="Email" aria-label="Email" aria-describedby="auth-email-icon" value={email} onChange={onEmailChange} />
              </div>
            </div>
            <div className="row">
              <div className="input-group mb-3">
                <span className="input-group-text" id="auth-password-icon"><i className="bi bi-lock"></i></span>
                <input type="password" className="form-control" placeholder="Пароль" aria-label="Password" aria-describedby="auth-password-icon" value={password} onChange={onPasswordChange} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            {errorMessage.length > 0 && (
              <div className="alert alert-warning" role="alert">
                {errorMessage}
              </div>
            )}
            <button type="button" className="btn btn-primary" onClick={authClick}>Вхід</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegModal() {
  const { setUser } = useContext(UserContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const closeButtonRef = useRef();

  const onNameChange = e => setName(e.target.value);
  const onEmailChange = e => setEmail(e.target.value);
  const onPasswordChange = e => setPassword(e.target.value);
  const onDateOfBirthChange = e => setDateOfBirth(e.target.value);
  const onAvatarChange = e => setAvatar(e.target.files[0]);
  const onAgreedChange = e => setAgreed(e.target.checked);

  const registerClick = () => {
    if (name === "") {
      setErrorMessage("Name must be filled!");
      return;
    }
    if (email === "") {
      setErrorMessage("Email must be filled!");
      return;
    }
    if (password === "") {
      setErrorMessage("Password must be filled!");
      return;
    }
    if (dateOfBirth === "") {
      setErrorMessage("Date of birth must be filled!");
      return;
    }
    if (!agreed) {
      setErrorMessage("You must agree with the site rules!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("dateOfBirth", dateOfBirth);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    fetch(`${url}/api/register`, {
      method: "POST",
      body: formData,
    })
      .then(r => {
        if (r.status !== 201) {
          setErrorMessage("Registration failed, please check your input data.");
        } else {
          
          setErrorMessage("");
          closeButtonRef.current.click();
          r.json().then(setUser);
        }
      });
  };

  return (
    <div className="modal fade" id="RegModal" tabIndex="-1" aria-labelledby="regModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="regModalLabel">Реєстрація</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" ref={closeButtonRef}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="input-group mb-3">
                <span className="input-group-text" id="reg-name-icon"><i className="bi bi-person"></i></span>
                <input type="text" className="form-control" placeholder="Name" aria-label="Name" aria-describedby="reg-name-icon" value={name} onChange={onNameChange} />
              </div>
            </div>
            <div className="row">
              <div className="input-group mb-3">
                <span className="input-group-text" id="reg-email-icon"><i className="bi bi-envelope-at"></i></span>
                <input type="text" className="form-control" placeholder="Email" aria-label="Email" aria-describedby="reg-email-icon" value={email} onChange={onEmailChange} />
              </div>
            </div>
            <div className="row">
              <div className="input-group mb-3">
                <span className="input-group-text" id="reg-password-icon"><i className="bi bi-lock"></i></span>
                <input type="password" className="form-control" placeholder="Пароль" aria-label="Password" aria-describedby="reg-password-icon" value={password} onChange={onPasswordChange} />
              </div>
            </div>
            <div className="row">
              <div className="input-group mb-3">
                <span className="input-group-text" id="reg-dob-icon"><i className="bi bi-calendar"></i></span>
                <input type="date" className="form-control" placeholder="Дата народження" aria-label="Date of Birth" aria-describedby="reg-dob-icon" value={dateOfBirth} onChange={onDateOfBirthChange} />
              </div>
            </div>
            <div className="row">
              <div className="input-group mb-3">
                <span className="input-group-text" id="reg-avatar-icon"><i className="bi bi-image"></i></span>
                <input type="file" className="form-control" placeholder="Аватар" aria-label="Avatar" aria-describedby="reg-avatar-icon" onChange={onAvatarChange} />
              </div>
            </div>
            <div className="form-check mb-3">
              <input type="checkbox" className="form-check-input" id="agree-checkbox" checked={agreed} onChange={onAgreedChange} />
              <label className="form-check-label" htmlFor="agree-checkbox">Я погоджуюсь з правилами сайту</label>
            </div>
          </div>
          <div className="modal-footer">
            {errorMessage.length > 0 && (
              <div className="alert alert-warning" role="alert">
                {errorMessage}
              </div>
            )}
            <button type="button" className="btn btn-primary" onClick={registerClick}>Реєстрація</button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default Layout;
