import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/appContext";
import { useNavigate, useParams } from "react-router-dom";

export default function Update(){
    const {id} = useParams();

    const {token, user} = useContext(AppContext);

    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
            level: '',
            course_code: '',
            course_name:'',
        });
    const [errors, setErrors] = useState({});

    async function getCourse() {
        const res = await fetch(`/api/courses/${id}`,{
            method: "get",
            headers:{
                Authorization: `Bearer ${token}`,
            }
        });    
        const data = await res.json();

        
        if(res.ok){

            if(!data.courses.user_id === user.id){
                navigate("/");
            }
            setFormData({
               // student_id: data.courses.student_id,
                level: data.courses.level,
                course_code: data.courses.course_code,
                course_name: data.courses.course_name,
            });
        }
    }

    async function handleUpdate(e) {
       
        e.preventDefault();

        confirm("Are you sure to update ");
       
        const response = await fetch(`/api/courses/${id}`, {
            method: "put",
            headers: {
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify(formData)
        });
       
        const data = await response.json();
       

        if(data.errors){
            setErrors(data.errors);
            //console.log(data.errors);
        }
        else{
           navigate("/");
           console.log(data);
            
        }
        

    }    
    useEffect(()=>{
        getCourse();
    }, [])
    return(
            <>
                <div className="container">
                <div className="content">
                    <div>
                        <h3>Add Course</h3>
                    </div>
                    <form onSubmit={handleUpdate}>
                        <div className="form-content">
                            <div className="form-detail">
                                <label htmlFor="course name">Level</label>
                                <input 
                                    type="text" 
                                    placeholder="Level" 
                                    className="input" 
                                    value={formData.level}
                                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                            
                                />
                                {errors.level && <p className="error">{errors.level[0]}</p>}


                            </div>
                            <div className="form-detail">
                            <label htmlFor="course name">Course Code</label>
                                <input 
                                    type="text" 
                                    placeholder="Course code" 
                                    className="input" 
                                    value={formData.course_code}
                                    onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                            
                                />
                                {errors.course_code && <p className="error">{errors.course_code[0]}</p>}


                            </div>
                            <div className="form-detail">
                            <label htmlFor="course name">Course Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Course name" 
                                    className="input" 
                                    value={formData.course_name}
                                    onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                            
                                />
                                {errors.course_name && <p className="error">{errors.course_name[0]}</p>}


                            </div>
                            <div className="form-detail">
                                <button>Update</button>
                            </div>


                        </div>
                    </form>

                </div>


            </div>
            


        </>
    )
}