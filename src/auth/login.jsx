import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/appContext";

export default function Login(){

    const {setToken} = useContext(AppContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
       
    });

    const [errors, setErrors] = useState({});
    
    async function handleLogin(e){
        e.preventDefault();

        const res = await fetch("/api/login", {
            method: "post",
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if(data.errors){
            setErrors(data.errors);
        }
        
        else{
            localStorage.setItem("token", data.token);
            setToken(data.token);
            navigate("/");
            
        }
    }
    return(
        <>
        <div className="container">
            <div className="content">
                <div>
                    <h3>Login</h3>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="form-content">
                        
                        <div className="form-detail">
                            <input 
                                type="email" 
                                 placeholder="email" 
                                className="input"                             
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                             {errors.email && <p className="error">{errors.email[0]}</p>}


                        </div>
                        <div className="form-detail">
                            <input 
                                type="password" 
                                placeholder="password" 
                                className="input" 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                          
                            />
                             {errors.password && <p className="error">{errors.password[0]}</p>}


                        </div>
                        <div className="form-detail">
                            <button>Login</button>
                        </div>
 
                    </div>
                </form>

            </div>
        </div>           
            
        </>
        
    );
}