import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/appContext";

export default function Register(){
    const {setToken} = useContext(AppContext);
    
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        student_id: "",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState({});
    
    async function handleRegistration(e){
        e.preventDefault();

        const response = await fetch("/api/register", {
            method: "post",
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if(data.errors){
            setErrors(data.errors);
        }
        else{
            localStorage.setItem("token", data.token);
            setToken(data.token);
            console.log(data);
            navigate("/login");    
        }
    }
    return(
        <>
        <div className="container">
            <div className="content">
                <div>
                    <h3>Create Account</h3>
                </div>
                <form onSubmit={handleRegistration}>
                    <div className="form-content">
                        <div className="form-detail">
                            <label htmlFor="name">Full Name</label>
                            <input 
                                type="text" 
                                placeholder="name" 
                                className="input" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                            {errors.name && <p className="error">{errors.name[0]}</p>}

                        </div>
                        <div className="form-detail">
                            <label htmlFor="name">Email</label>
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
                            <label htmlFor="reg-number">Registration Number</label>
                            <input 
                                type="text" 
                                placeholder="reg number" 
                                className="input"
                                value={formData.student_id}
                                onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                          
                            />
                             {errors.student_id && <p className="error">{errors.student_id[0]}</p>}


                        </div>
                        <div className="form-detail">
                            <label htmlFor="password">Password</label>
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
                            <label htmlFor="confirm">Confirm Password</label>
                            <input 
                                type="password" 
                                placeholder="confirm password" 
                                className="input"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                          
                            />

                        </div>
                        <div className="form-detail">
                            <button>Register</button>
                        </div>


                    </div>
                </form>

            </div>


        </div>
            
            
        </>
        
    );
}