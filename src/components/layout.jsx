import { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AppContext } from "../context/appContext";

export default function Layout() {
 
    const  {user, token, setUser, setToken} = useContext(AppContext);
    const navigate = useNavigate();

    async function handleLogout(e) {

        e.preventDefault();

        const res = await fetch('/api/logout', {
            method: "post",
            headers:{
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        console.log(data);

        if(res.ok){
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            navigate("/");
        }
    }

  return (
    <>
      <header>
        <nav>
          <div className="main-div">
          <div className="home">          
            <Link to="/" className="nav-link">
              Home
            </Link>
          </div>
          <div>
          {user ? (
            <div className="user">
              <span className="welcome">Welcome back {user.name}</span>
              <Link to="/create" className="nav-link">
                New Post
              </Link>
              <form onSubmit={handleLogout}>
                <button className="logout">Logout</button>
              </form>
            </div>
            
          ) : (
            <div className="auth">
              <div className="register">
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </div>
              <div className="login">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </div>
            </div>
          )}
          </div>
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
    
}